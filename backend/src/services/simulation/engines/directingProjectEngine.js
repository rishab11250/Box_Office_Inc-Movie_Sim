import crypto from "crypto";

import { calculateProjectedMovieQuality } from "../../director/directingProjectService.js";
import { addNotification } from "../helpers/notificationHelper.js";

const DISCOVERY_REVEAL_THRESHOLD = 50;

const addUniqueStudio = (director, studioName) => {
  director.studiosWorkedWith = director.studiosWorkedWith || [];

  if (!director.studiosWorkedWith.includes(studioName)) {
    director.studiosWorkedWith.push(studioName);
  }
};

const buildPreProductionMovie = ({ project, script, director, studio, projectedQuality }) => ({
  id: crypto.randomUUID(),
  title: project.movieName || project.scriptTitle,
  scriptId: project.scriptId,
  scriptTitle: project.scriptTitle || project.movieName,
  directorId: director.id,
  directorName: director.name,
  genre: project.genre || script?.genres?.[0] || "Drama",
  projectedQuality,
  stage: "PRE_PRODUCTION_READY",
  studio: studio?.name || "Unknown Studio",
});

export const processDirectingProjects = (gameState, studio) => {
  const completedProjects = [];

  gameState.activeDirectorProjects = gameState.activeDirectorProjects || [];
  gameState.ownedScripts = gameState.ownedScripts || [];
  gameState.preProductionMovies = gameState.preProductionMovies || [];

  for (const project of gameState.activeDirectorProjects) {
    if (project.replacementRequired || project.status === "NEEDS_DIRECTOR_REPLACEMENT") {
      continue;
    }

    const totalDuration = Math.max(1, project.completionWeek - project.startWeek);
    const elapsedWeeks = Math.max(0, gameState.currentWeek - project.startWeek);

    project.progress = Math.min(
      100,
      Math.floor((elapsedWeeks / totalDuration) * 100)
    );

    if (gameState.currentWeek < project.completionWeek) {
      continue;
    }

    const director = gameState.ownedDirectors?.find(
      (candidate) => candidate.id === project.directorId
    );

    if (!director) {
      project.replacementRequired = true;
      project.status = "NEEDS_DIRECTOR_REPLACEMENT";
      continue;
    }

    const script = gameState.ownedScripts.find(
      (candidate) => candidate.id === project.scriptId
    );

    director.status = "AVAILABLE";
    director.busyUntilWeek = null;
    director.moviesDirected = Number(director.moviesDirected || 0) + 1;
    director.reputation = Math.min(100, Number(director.reputation || 0) + 2);
    director.morale = Math.min(100, Number(director.morale || 0) + 2);

    const previousDiscovery = Number(director.discovered || 0);
    director.discovered = Math.min(100, previousDiscovery + 15);

    const projectedQuality = calculateProjectedMovieQuality({
      script: script || project,
      director,
      qualityPenalty: project.qualityPenalty || 0,
    });

    director.ratings = director.ratings || [];
    director.ratings.push(projectedQuality);

    addUniqueStudio(director, studio?.name || "Unknown Studio");

    director.careerHistory = director.careerHistory || [];
    director.careerHistory.push({
      movieName: project.movieName || project.scriptTitle,
      studioName: studio?.name || "Unknown Studio",
      releaseWeek: gameState.currentWeek,
      genre: project.genre || script?.genres?.[0] || "Drama",
      movieRating: projectedQuality,
      boxOffice: 0,
      outcome: "PRE_PRODUCTION_READY",
    });

    if (script) {
      script.status = "PRE_PRODUCTION_READY";
      script.assignedDirectorId = director.id;
      script.assignedDirectorName = director.name;
      script.directingProjectId = null;
    }

    gameState.preProductionMovies.push(
      buildPreProductionMovie({
        project,
        script,
        director,
        studio,
        projectedQuality,
      })
    );

    addNotification(
      gameState,
      `Director ${director.name} completed directing ${project.scriptTitle || project.movieName}. Movie is now ready for pre-production.`
    );

    if (previousDiscovery < DISCOVERY_REVEAL_THRESHOLD && director.discovered >= DISCOVERY_REVEAL_THRESHOLD) {
      addNotification(
        gameState,
        `${director.name} has been fully discovered. All director stats are now revealed.`
      );
    }

    completedProjects.push(project.id);
  }

  gameState.activeDirectorProjects = gameState.activeDirectorProjects.filter(
    (project) => !completedProjects.includes(project.id)
  );
};
