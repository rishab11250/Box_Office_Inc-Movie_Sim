const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const calculateDirectorCompensation = (director) => {
  const reputation = clamp(Number(director?.reputation || 0), 0, 100);
  const contractYears = clamp(Number(director?.contractYears || 1), 1, 5);

  const reputationCost = (reputation / 100) * 300000;
  const contractCost = ((contractYears - 1) / 4) * 150000;

  return clamp(Math.round(50000 + reputationCost + contractCost), 50000, 500000);
};

export const calculateDirectorFanLoss = (director) => {
  const reputation = clamp(Number(director?.reputation || 0), 0, 100);

  if (director?.rarity === "Legendary" || reputation >= 85) {
    return 500;
  }

  if (reputation >= 70) {
    return 300;
  }

  if (reputation >= 50) {
    return 150;
  }

  if (reputation >= 30) {
    return 75;
  }

  return 25;
};

export const calculateDirectorReplacementPenalty = (progress = 0) => {
  const safeProgress = clamp(Number(progress || 0), 0, 100);

  if (safeProgress >= 75) {
    return 15;
  }

  if (safeProgress >= 50) {
    return 10;
  }

  if (safeProgress >= 25) {
    return 5;
  }

  return 2;
};
