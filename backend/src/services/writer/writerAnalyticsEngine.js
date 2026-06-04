const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const getCareerHistory = (writer) => writer.careerHistory || [];

export const calculateTotalScripts = (writer) => {
  const careerHistory = getCareerHistory(writer);

  return Math.max(
    careerHistory.length,
    Number(writer.writtenScripts || 0)
  );
};

export const calculateHitRate = (writer) => {
  const totalScripts = calculateTotalScripts(writer);

  if (totalScripts === 0) {
    return 0;
  }

  return Math.round((Number(writer.hitScripts || 0) / totalScripts) * 100);
};

export const calculateFlopRate = (writer) => {
  const totalScripts = calculateTotalScripts(writer);

  if (totalScripts === 0) {
    return 0;
  }

  return Math.round((Number(writer.flopScripts || 0) / totalScripts) * 100);
};

export const calculateAverageScriptQuality = (writer) => {
  const careerHistory = getCareerHistory(writer);

  if (careerHistory.length === 0) {
    return 0;
  }

  const totalQuality = careerHistory.reduce(
    (total, entry) => total + Number(entry.scriptQuality || 0),
    0
  );

  return Math.round(totalQuality / careerHistory.length);
};

export const calculateCareerReputation = (writer) => {
  const baseReputation = Number(writer.reputation || 0);
  const hitRate = calculateHitRate(writer);
  const flopRate = calculateFlopRate(writer);
  const averageQuality = calculateAverageScriptQuality(writer);
  const awards = Number(writer.awards || 0);
  const totalScripts = calculateTotalScripts(writer);

  const experienceBonus = Math.min(10, totalScripts * 0.5);
  const awardBonus = Math.min(15, awards * 5);

  const score =
    baseReputation * 0.45 +
    averageQuality * 0.25 +
    hitRate * 0.2 -
    flopRate * 0.15 +
    experienceBonus +
    awardBonus;

  return Math.round(clamp(score));
};

export const calculateMarketValue = (writer) => {
  const salary = Number(writer.salary || 0);
  const careerReputation = calculateCareerReputation(writer);
  const hitRate = calculateHitRate(writer);
  const averageQuality = calculateAverageScriptQuality(writer);
  const awards = Number(writer.awards || 0);

  const multiplier =
    1 +
    careerReputation / 100 +
    hitRate / 200 +
    averageQuality / 250 +
    Math.min(0.5, awards * 0.1);

  return Math.round(salary * multiplier);
};

export const calculateWriterAnalytics = (writer) => {
  const normalizedWriter = writer.toObject ? writer.toObject() : { ...writer };

  return {
    hitRate: calculateHitRate(normalizedWriter),
    flopRate: calculateFlopRate(normalizedWriter),
    averageScriptQuality: calculateAverageScriptQuality(normalizedWriter),
    careerReputation: calculateCareerReputation(normalizedWriter),
    marketValue: calculateMarketValue(normalizedWriter),
  };
};
