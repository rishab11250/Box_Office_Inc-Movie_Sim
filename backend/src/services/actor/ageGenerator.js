const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const ACTOR_AGE_DISTRIBUTION = {
  young: 0.2,
  prime: 0.7,
  veteran: 0.1,
};

export const generateActorAge = () => {
  const roll = Math.random() * 100;

  if (roll < 20) {
    return randomBetween(18, 30);
  }

  if (roll < 90) {
    return randomBetween(31, 60);
  }

  return randomBetween(61, 90);
};

export const generateActorAgeForBucket = (bucket) => {
  if (bucket === "young") {
    return randomBetween(18, 30);
  }

  if (bucket === "prime") {
    return randomBetween(31, 60);
  }

  return randomBetween(61, 90);
};
