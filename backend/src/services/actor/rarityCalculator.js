export const calculateActorRarity = ({
  popularity,
  actingSkill,
  reliability,
  fanbase,
  hiddenPotential = 0,
}) => {
  const fanbaseScore = Math.min(100, Number(fanbase || 0) / 10000);
  const potentialScore = Math.min(100, Number(hiddenPotential || 0));
  const average =
    actingSkill * 0.35 +
    popularity * 0.25 +
    reliability * 0.2 +
    fanbaseScore * 0.1 +
    potentialScore * 0.1;

  if (average >= 95) return "Legendary";

  if (average >= 88) return "Epic";

  if (average >= 78) return "Rare";

  if (average >= 68) return "Uncommon";

  return "Common";
};
