export const calculateActorSalary = ({
  popularity,
  actingSkill,
  reliability,
  fanbase,
  rarity,
}) => {
  const score =
    actingSkill * 0.35 + popularity * 0.3 + reliability * 0.2 + Math.min(100, fanbase / 10000) * 0.15;

  const rarityMultiplier = {
    Common: 1,
    Uncommon: 1.25,
    Rare: 1.6,
    Epic: 2.2,
    Legendary: 3,
  }[rarity] || 1;

  const baseSalary = score * 3200;
  const fanbasePremium = Math.min(250000, Number(fanbase || 0) * 0.08);

  return Math.round((baseSalary + fanbasePremium) * rarityMultiplier);
};
