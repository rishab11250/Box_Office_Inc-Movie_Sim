import { calculateDirectorAnalytics } from "./directorAnalyticsService.js";

const toPlainDirector = (director) =>
  director?.toObject ? director.toObject() : { ...(director || {}) };

const uniqueStudiosWorkedWith = (director) => {
  const studioNames = new Set();

  director.studiosWorkedWith?.forEach((studio) => {
    if (typeof studio === "string" && studio.trim()) {
      studioNames.add(studio);
    }

    if (studio?.name) {
      studioNames.add(studio.name);
    }
  });

  director.careerHistory?.forEach((movie) => {
    if (movie.studioName) {
      studioNames.add(movie.studioName);
    }
  });

  return [...studioNames];
};

const normalizeSalaryHistory = (director) => {
  if (director.salaryHistory?.length > 0) {
    return director.salaryHistory.map((entry) => ({
      salary: Number(entry.salary || 0),
      week: Number(entry.week || 1),
      reason: entry.reason || "Salary Update",
    }));
  }

  return [
    {
      salary: Number(director.salary || 0),
      week: 1,
      reason: "Initial Salary",
    },
  ];
};

const weekToYear = (week = 1) => Math.floor((Number(week || 1) - 1) / 52) + 1;

const normalizeCareerTimeline = (director) =>
  (director.careerHistory || []).map((movie) => ({
    movieName: movie.movieName || "Untitled Movie",
    year: weekToYear(movie.releaseWeek),
    week: movie.releaseWeek || null,
    studio: movie.studioName || "Unknown Studio",
    genre: movie.genre || "Unknown",
    verdict: movie.outcome || movie.verdict || "Unreleased",
    criticScore: Number(movie.criticScore ?? movie.movieRating ?? 0),
    audienceScore: Number(movie.audienceScore ?? movie.movieRating ?? 0),
    boxOffice: Number(movie.boxOffice || 0),
  }));

const normalizeAwards = (director) =>
  (director.awardsHistory || []).map((award) => ({
    awardName: award.awardName || "Unnamed Award",
    category: award.category || award.genre || "General",
    movie: award.movieTitle || award.movieName || award.movie || "Unknown Movie",
    year: award.year || weekToYear(award.week),
    week: award.week || null,
  }));

export const buildDirectorProfile = (director, currentWeek) => {
  const normalizedDirector = toPlainDirector(director);
  const analytics = calculateDirectorAnalytics(normalizedDirector, currentWeek);
  const careerTimeline = normalizeCareerTimeline(normalizedDirector);
  const awards = normalizeAwards(normalizedDirector);

  return {
    id: normalizedDirector.id,
    personalInformation: {
      name: normalizedDirector.name,
      age: normalizedDirector.age,
      avatar: normalizedDirector.avatarSeed,
      avatarSeed: normalizedDirector.avatarSeed,
      rarity: normalizedDirector.rarity,
      reputation: Number(normalizedDirector.reputation || 0),
      morale: Number(normalizedDirector.morale || 0),
      salary: Number(normalizedDirector.salary || 0),
      genreExpertise: normalizedDirector.genreExpertise || [],
      currentStatus: normalizedDirector.status || "AVAILABLE",
    },
    careerInformation: {
      moviesDirected: Number(normalizedDirector.moviesDirected || 0),
      studiosWorkedWith: uniqueStudiosWorkedWith(normalizedDirector),
      totalEarnings: Number(normalizedDirector.totalEarnings || 0),
      awardsCount: Number(normalizedDirector.awards || awards.length || 0),
      careerLength: analytics.careerLength,
    },
    statistics: {
      hitMovies: Number(normalizedDirector.hitMovies || 0),
      flopMovies: Number(normalizedDirector.flopMovies || 0),
      hitRate: analytics.hitRate,
      flopRate: analytics.flopRate,
      averageRating: analytics.averageRating,
      averageBoxOffice: analytics.averageBoxOffice,
    },
    careerTimeline,
    awards,
    salaryHistory: normalizeSalaryHistory(normalizedDirector),
  };
};
