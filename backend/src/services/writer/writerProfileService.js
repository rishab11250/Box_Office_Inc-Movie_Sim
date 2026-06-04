import { calculateWriterAnalytics } from "./writerAnalyticsEngine.js";

const uniqueStudiosWorkedWith = (writer) => {
  const studioNames = new Set();

  writer.careerHistory?.forEach((entry) => {
    if (entry.studioName) {
      studioNames.add(entry.studioName);
    }
  });

  writer.studiosWorkedWith?.forEach((studio) => {
    if (studio.name) {
      studioNames.add(studio.name);
    }
  });

  return [...studioNames];
};

const normalizeSalaryHistory = (writer) => {
  if (writer.salaryHistory?.length > 0) {
    return writer.salaryHistory;
  }

  return [
    {
      week: 1,
      salary: Number(writer.salary || 0),
      reason: "Initial Salary",
    },
  ];
};

export const buildWriterProfile = (writer) => {
  const normalizedWriter = writer.toObject ? writer.toObject() : { ...writer };
  const careerHistory = normalizedWriter.careerHistory || [];
  const totalScripts =
    careerHistory.length || Number(normalizedWriter.writtenScripts || 0);
  const hits = Number(normalizedWriter.hitScripts || 0);
  const flops = Number(normalizedWriter.flopScripts || 0);
  const analytics = calculateWriterAnalytics(normalizedWriter);

  return {
    id: normalizedWriter.id,
    personalInfo: {
      name: normalizedWriter.name,
      age: normalizedWriter.age,
      genres: normalizedWriter.genreExpertise || [],
      rarity: normalizedWriter.rarity,
      status: normalizedWriter.status,
      avatarSeed: normalizedWriter.avatarSeed,
    },
    career: {
      studiosWorkedWith: uniqueStudiosWorkedWith(normalizedWriter),
      totalScripts,
      hits,
      flops,
      hitRate: analytics.hitRate,
      flopRate: analytics.flopRate,
      averageQuality: analytics.averageScriptQuality,
      careerReputation: analytics.careerReputation,
      marketValue: analytics.marketValue,
      awards: Number(normalizedWriter.awards || 0),
      totalEarnings: Number(normalizedWriter.totalEarnings || 0),
      salaryHistory: normalizeSalaryHistory(normalizedWriter),
      analytics,
      scripts: careerHistory,
    },
  };
};
