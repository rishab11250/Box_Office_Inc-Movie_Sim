const qualityAverage = (careerHistory = []) => {
  if (careerHistory.length === 0) {
    return 0;
  }

  const totalQuality = careerHistory.reduce(
    (total, entry) => total + Number(entry.scriptQuality || 0),
    0
  );

  return Math.round(totalQuality / careerHistory.length);
};

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
  const totalScripts = careerHistory.length || Number(normalizedWriter.writtenScripts || 0);
  const hits = Number(normalizedWriter.hitScripts || 0);
  const flops = Number(normalizedWriter.flopScripts || 0);

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
      hitRate: totalScripts > 0 ? Math.round((hits / totalScripts) * 100) : 0,
      averageQuality: qualityAverage(careerHistory),
      awards: Number(normalizedWriter.awards || 0),
      totalEarnings: Number(normalizedWriter.totalEarnings || 0),
      salaryHistory: normalizeSalaryHistory(normalizedWriter),
      scripts: careerHistory,
    },
  };
};
