/**
 * @fileoverview Actor Awards Service
 *
 * Evaluates and grants annual, actor-specific awards, mirroring the structure
 * of `directorAwardsService.js` but adapted to actor stats (actors track
 * `popularity` and `fanbase` rather than `reputation`/`marketValue`).
 *
 * Called once per in-game year (every 52 weeks) from the tick engine, after
 * each owned/market/retired actor has had their career history attached from
 * the persisted `TalentHistory` collection.
 *
 * Award effects applied to a winning actor:
 *  - `awards` counter incremented.
 *  - `popularity` raised by the award's prestige value (clamped to [0, 100]).
 *  - `fanbase` increased by the award's fan bump.
 *  - `salary` increased by the award's salary-increase rate.
 *  - `AWARD` and `SALARY` entries appended to the actor's talent history.
 *  - The owning studio's `fans` increased by the award's fan bump.
 *  - A system notification is queued.
 *
 * No database calls are made here; the caller (tick engine / simulation
 * controller) persists the mutated GameState and flushes pending history and
 * notifications.
 */
import { addTalentHistory } from "../simulation/helpers/historyHelper.js";
import { addNotification } from "../simulation/helpers/notificationHelper.js";
import { VERDICTS } from "../../constants/verdicts.js";

const WEEKS_PER_YEAR = 52;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toNumber = (value) => Number(value || 0);
const weekToYear = (week = 1) => Math.floor((Number(week || 1) - 1) / WEEKS_PER_YEAR) + 1;

/**
 * Normalizes a career-history entry (written by careerImpactEngine) into a
 * consistent shape for scoring. careerImpactEngine records:
 *   { movieId, movieTitle, releaseWeek, quality, boxOffice, verdict }
 * so critic/audience scores fall back to `quality`, and `year` is derived from
 * `releaseWeek` when not present.
 */
const normalizeMovie = (movie, fallbackIndex = 0) => {
  const criticScore = toNumber(movie.criticScore ?? movie.movieRating ?? movie.quality);
  const audienceScore = toNumber(movie.audienceScore ?? movie.movieRating ?? movie.quality);
  const movieQuality = toNumber(
    movie.movieQuality ?? movie.quality ?? movie.movieRating ?? ((criticScore + audienceScore) / 2)
  );
  const boxOffice = toNumber(movie.boxOffice);
  const verdict = movie.verdict || movie.outcome || "Unknown";

  return {
    movieId: movie.movieId || movie.id || `${movie.movieTitle || "movie"}-${movie.releaseWeek || fallbackIndex}`,
    movieTitle: movie.movieTitle || movie.title || movie.movieName || "Untitled Movie",
    year: movie.year || weekToYear(movie.releaseWeek),
    releaseWeek: movie.releaseWeek,
    movieQuality,
    criticScore,
    audienceScore,
    boxOffice,
    verdict,
  };
};

const getAnnualMovies = (actor, awardYear) =>
  (actor.careerHistory || [])
    .map(normalizeMovie)
    .filter((movie) => movie.year === awardYear);

const getBoxOfficeScore = (boxOffice) => clamp((toNumber(boxOffice) / 100000000) * 100, 0, 100);

/**
 * Verdict-driven success weighting. Uses the canonical VERDICTS strings
 * (uppercase) so HIT/BLOCKBUSTER/ALL_TIME_BLOCKBUSTER are actually rewarded and
 * FLOP/DISASTER penalised; otherwise falls back to raw quality.
 */
const getGenreSuccessScore = (movie) => {
  if (
    movie.verdict === VERDICTS.HIT ||
    movie.verdict === VERDICTS.BLOCKBUSTER ||
    movie.verdict === VERDICTS.ALL_TIME_BLOCKBUSTER
  ) {
    return 100;
  }

  if (movie.verdict === VERDICTS.FLOP || movie.verdict === VERDICTS.DISASTER) {
    return 20;
  }

  return clamp((movie.movieQuality + movie.criticScore + movie.audienceScore) / 3, 0, 100);
};

/**
 * Scores a single movie for an actor. The career-standing term uses the actor's
 * `popularity` (an actor's analogue to a director's reputation).
 */
const scoreMovieForAward = (actor, movie) => {
  const careerStanding = toNumber(actor.popularity);

  return (
    movie.movieQuality * 0.3 +
    movie.criticScore * 0.2 +
    movie.audienceScore * 0.15 +
    getBoxOfficeScore(movie.boxOffice) * 0.15 +
    getGenreSuccessScore(movie) * 0.1 +
    careerStanding * 0.1
  );
};

const getBestMovieCandidate = (actor, awardYear) => {
  const movies = getAnnualMovies(actor, awardYear);

  if (movies.length === 0) {
    return null;
  }

  return movies
    .map((movie) => ({
      actor,
      movie,
      score: scoreMovieForAward(actor, movie),
    }))
    .sort((a, b) => b.score - a.score)[0];
};

const getAnnualActorScore = (actor, awardYear) => {
  const movies = getAnnualMovies(actor, awardYear);

  if (movies.length === 0) {
    return null;
  }

  const movieScores = movies.map((movie) => scoreMovieForAward(actor, movie));
  const averageMovieScore = movieScores.reduce((sum, score) => sum + score, 0) / movieScores.length;
  const volumeBonus = Math.min(10, movies.length * 2);

  return {
    actor,
    movie: movies.sort((a, b) => scoreMovieForAward(actor, b) - scoreMovieForAward(actor, a))[0],
    score: averageMovieScore + volumeBonus + toNumber(actor.popularity) * 0.1,
  };
};

/**
 * Breakthrough Actor candidate: an actor whose only career movie is this year's
 * (i.e. a debut year), boosted so a strong first outing can stand out.
 */
const getBreakthroughCandidate = (actor, awardYear) => {
  const careerMovies = actor.careerHistory || [];
  const annualCandidate = getBestMovieCandidate(actor, awardYear);

  if (!annualCandidate || careerMovies.length !== 1) {
    return null;
  }

  return {
    ...annualCandidate,
    score: annualCandidate.score + 10,
  };
};

const getLifetimeCandidate = (actor, awardYear) => {
  const careerMovies = (actor.careerHistory || []).map(normalizeMovie);
  const moviesActed = toNumber(actor.movies) || careerMovies.length;
  const awards = toNumber(actor.awards);
  const popularity = toNumber(actor.popularity);
  const age = toNumber(actor.age);

  if (moviesActed < 10 && popularity < 80 && age < 70) {
    return null;
  }

  const averageMovieScore = careerMovies.length
    ? careerMovies.reduce((sum, movie) => sum + scoreMovieForAward(actor, movie), 0) / careerMovies.length
    : popularity;

  return {
    actor,
    movie: careerMovies.sort((a, b) => scoreMovieForAward(actor, b) - scoreMovieForAward(actor, a))[0] || {
      movieId: null,
      movieTitle: "Career Achievement",
      year: awardYear,
    },
    score: averageMovieScore + moviesActed * 1.5 + awards * 5 + popularity * 0.3,
  };
};

const hasAwardForYear = (actor, awardName, year) =>
  (actor.awardsHistory || []).some(
    (award) => award.awardName === awardName && Number(award.year || weekToYear(award.week)) === year
  );

const buildAward = ({ awardName, category, candidate, awardYear }) => {
  const score = clamp(candidate.score, 0, 100);
  const prestigeValue = Math.round(clamp(5 + (score / 100) * 15, 5, 20));
  const salaryIncreaseRate = clamp(0.1 + (score / 100) * 0.4, 0.1, 0.5);

  return {
    actorId: candidate.actor.id,
    awardName,
    category,
    movieId: candidate.movie?.movieId || null,
    movieTitle: candidate.movie?.movieTitle || "Career Achievement",
    year: awardYear,
    prestigeValue,
    salaryIncreaseRate,
    fanIncrease: Math.round(prestigeValue * 1000),
  };
};

const selectTopCandidate = (candidates, awardName, awardYear, minimumScore = 60) =>
  candidates
    .filter(Boolean)
    .filter((candidate) => candidate.score >= minimumScore)
    .filter((candidate) => !hasAwardForYear(candidate.actor, awardName, awardYear))
    .sort((a, b) => b.score - a.score)[0] || null;

const collectActorEntries = (gameState) => [
  ...(gameState.marketActors || []).map((actor) => ({ actor, pool: "market" })),
  ...(gameState.ownedActors || []).map((actor) => ({ actor, pool: "owned" })),
  ...(gameState.retiredActors || []).map((actor) => ({ actor, pool: "retired" })),
];

/**
 * Determines the year's actor awards.
 *
 * Genre-specific acting awards are intentionally omitted: careerImpactEngine's
 * career-history entries do not record a movie's genre, so a data-driven
 * genre award could not be evaluated without modifying that (test-covered)
 * engine. The awards below are all evaluable from the recorded history.
 */
const determineActorAwards = (gameState, awardYear) => {
  const entries = collectActorEntries(gameState).filter(
    ({ actor }) => actor.status !== "RETIRED" || (actor.careerHistory || []).length > 0
  );
  const awards = [];

  const bestActorCandidate = selectTopCandidate(
    entries.map(({ actor }) => getBestMovieCandidate(actor, awardYear)),
    "Best Actor",
    awardYear
  );

  if (bestActorCandidate) {
    awards.push(buildAward({ awardName: "Best Actor", category: "Overall", candidate: bestActorCandidate, awardYear }));
  }

  const actorOfYearCandidate = selectTopCandidate(
    entries.map(({ actor }) => getAnnualActorScore(actor, awardYear)),
    "Actor Of The Year",
    awardYear,
    65
  );

  if (actorOfYearCandidate) {
    awards.push(
      buildAward({ awardName: "Actor Of The Year", category: "Annual", candidate: actorOfYearCandidate, awardYear })
    );
  }

  const breakthroughCandidate = selectTopCandidate(
    entries.map(({ actor }) => getBreakthroughCandidate(actor, awardYear)),
    "Breakthrough Actor",
    awardYear
  );

  if (breakthroughCandidate) {
    awards.push(
      buildAward({ awardName: "Breakthrough Actor", category: "Debut", candidate: breakthroughCandidate, awardYear })
    );
  }

  const lifetimeCandidate = selectTopCandidate(
    entries.map(({ actor }) => getLifetimeCandidate(actor, awardYear)),
    "Lifetime Achievement Award",
    awardYear,
    75
  );

  if (lifetimeCandidate) {
    awards.push(
      buildAward({
        awardName: "Lifetime Achievement Award",
        category: "Career",
        candidate: lifetimeCandidate,
        awardYear,
      })
    );
  }

  return awards;
};

const applyActorAward = ({ award, studio, gameState }) => {
  const actor = collectActorEntries(gameState).find(
    ({ actor: candidate }) => candidate.id === award.actorId
  )?.actor;

  if (!actor) {
    return;
  }

  const previousSalary = toNumber(actor.salary);
  const nextSalary = Math.round(previousSalary * (1 + award.salaryIncreaseRate));

  actor.awards = toNumber(actor.awards) + 1;
  addTalentHistory(gameState, actor.id, "AWARD", {
    awardName: award.awardName,
    category: award.category,
    movieId: award.movieId,
    movieTitle: award.movieTitle,
    movieName: award.movieTitle,
    year: award.year,
    prestigeValue: award.prestigeValue,
  });

  actor.popularity = clamp(toNumber(actor.popularity) + award.prestigeValue, 0, 100);
  actor.fanbase = Math.round(toNumber(actor.fanbase) + award.fanIncrease);
  actor.salary = nextSalary;
  addTalentHistory(gameState, actor.id, "SALARY", {
    week: gameState.currentWeek,
    salary: nextSalary,
    reason: `${award.awardName} Award Increase`,
  });

  if (studio) {
    studio.fans = toNumber(studio.fans) + award.fanIncrease;
  }

  addNotification(gameState, `${actor.name} won ${award.awardName}.`);
};

/**
 * Processes annual actor awards for the current in-game year.
 *
 * Guards:
 *  - Only runs on an award week (every 52 weeks).
 *  - Skips a year already recorded in `gameState.actorAwardYearsProcessed`.
 *
 * @param {object} gameState - GameState document (mutated in place).
 * @param {object} studio    - Player's studio document (mutated in place), or null.
 * @returns {Array<object>} The awards granted this year (empty if none / not due).
 */
export const processActorAwards = (gameState, studio) => {
  const awardYear = weekToYear(gameState.currentWeek);

  if (gameState.currentWeek % WEEKS_PER_YEAR !== 0) {
    return [];
  }

  gameState.actorAwardYearsProcessed = gameState.actorAwardYearsProcessed || [];

  if (gameState.actorAwardYearsProcessed.includes(awardYear)) {
    return [];
  }

  const awards = determineActorAwards(gameState, awardYear);

  awards.forEach((award) => applyActorAward({ award, studio, gameState }));

  gameState.actorAwardYearsProcessed.push(awardYear);

  return awards;
};
