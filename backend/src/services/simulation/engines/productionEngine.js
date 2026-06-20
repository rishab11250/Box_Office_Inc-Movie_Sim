import Movie from "../../../models/Movie.js";
import { addNotification } from "../helpers/notificationHelper.js";
import { generateStreamingOffers } from "./streamingEngine.js";

const STAGES = {
  PRE_PRODUCTION: { duration: 4, next: "PRODUCTION" },
  PRODUCTION: { duration: 10, next: "POST_PRODUCTION" },
  POST_PRODUCTION: { duration: 6, next: "READY_FOR_RELEASE" },
};

export const processProduction = async (gameState, studio) => {
  if (!gameState.activeMovies || gameState.activeMovies.length === 0) return;

  const movies = await Movie.find({
    _id: { $in: gameState.activeMovies },
    status: { $in: Object.keys(STAGES) },
  });

  for (const movie of movies) {
    const stageInfo = STAGES[movie.status];
    if (!stageInfo) continue;

    // Get talent for reliability effects
    const director = gameState.ownedDirectors.find(d => d.id === movie.directorId);
    const leadActor = gameState.ownedActors.find(a => a.id === movie.leadActorId);
    const crewTeam = gameState.ownedCrewTeams.find(c => c.id === movie.crewTeamId);

    // Calculate reliability factor (average 0-100, mapped to influence)
    const avgReliability = (
      (director?.reliability || 50) +
      (leadActor?.reliability || 50) +
      (crewTeam?.reliability || 50)
    ) / 3;

    // Reliability effect: High reliability (80+) gives a chance for bonus progress
    // Low reliability (<40) gives a chance for a delay (no progress this week)
    let weeklyProgress = 1;
    let delay = false;

    const roll = Math.random() * 100;
    if (avgReliability < 40 && roll < 20) {
      delay = true;
      weeklyProgress = 0;
      addNotification(gameState, `Production on "${movie.title}" faced a delay due to reliability issues.`);
    } else if (avgReliability > 80 && roll > 80) {
      weeklyProgress = 2;
      addNotification(gameState, `Production on "${movie.title}" is ahead of schedule!`);
    }

    movie.weeksInStage += weeklyProgress;

    // Calculate total progress percentage
    // Typical total duration = 4 + 10 + 6 = 20
    const totalTarget = STAGES.PRE_PRODUCTION.duration + STAGES.PRODUCTION.duration + STAGES.POST_PRODUCTION.duration;
    let currentCompleted = 0;
    if (movie.status === "PRODUCTION") currentCompleted = STAGES.PRE_PRODUCTION.duration;
    if (movie.status === "POST_PRODUCTION") currentCompleted = STAGES.PRE_PRODUCTION.duration + STAGES.PRODUCTION.duration;

    movie.productionProgress = Math.min(100, Math.round(((currentCompleted + movie.weeksInStage) / totalTarget) * 100));

    // Calculate remaining weeks
    const currentAbsoluteWeeks = currentCompleted + movie.weeksInStage;
    movie.remainingWeeks = Math.max(0, totalTarget - currentAbsoluteWeeks);

    if (movie.weeksInStage >= stageInfo.duration) {
      const oldStatus = movie.status;
      movie.status = stageInfo.next;
      movie.weeksInStage = 0;

      addNotification(gameState, `"${movie.title}" has moved from ${oldStatus} to ${movie.status}.`);

      if (movie.status === "READY_FOR_RELEASE") {
        movie.productionProgress = 100;
        movie.releaseWeek = gameState.currentWeek + 1; // Suggest release next week

        // Generate streaming offers
        await generateStreamingOffers(movie, gameState);

        // Release talent if ready for release (or keep them busy until release?)
        // Instructions say: "When movie finishes: status = AVAILABLE"
        // Let's treat READY_FOR_RELEASE as finished for the talent.
        releaseTalent(gameState, movie);
      }
    }

    await movie.save();
  }
};

const releaseTalent = (gameState, movie) => {
  const director = gameState.ownedDirectors.find(d => d.id === movie.directorId);
  const leadActor = gameState.ownedActors.find(a => a.id === movie.leadActorId);
  const crewTeam = gameState.ownedCrewTeams.find(c => c.id === movie.crewTeamId);

  if (director) {
    director.status = "AVAILABLE";
    director.busyUntilWeek = null;
  }
  if (leadActor) {
    leadActor.status = "AVAILABLE";
    leadActor.busyUntilWeek = null;
  }
  if (crewTeam) {
    crewTeam.status = "AVAILABLE";
    crewTeam.busyUntilWeek = null;
  }
};
