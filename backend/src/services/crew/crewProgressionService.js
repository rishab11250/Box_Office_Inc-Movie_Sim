/**
 * @fileoverview Crew Career Progression Service
 *
 * Adds a meaningful career-progression layer for crew teams on top of the
 * reputation they already accrue from released projects (see
 * `careerImpactEngine.js`, which raises `crewTeam.reputation` by a verdict-driven
 * delta on every movie release).
 *
 * Reputation on its own is a raw 0–100 number; this service maps it onto a
 * discrete, human-readable career ladder and records progression milestones so
 * the player can see their crew grow from Rookie to Legendary as their projects
 * succeed.
 *
 * Design notes:
 *  - Progression is **monotonic**: a crew's `careerTier` reflects the highest
 *    rank they have ever reached, so a single flop (which lowers reputation)
 *    does not strip an earned career rank. This matches "career progression"
 *    semantics rather than a volatile live rank.
 *  - Only **owned** crew progress (they are the ones taking on projects and
 *    earning reputation). Market crew retain the schema default until hired.
 *  - Effects are limited to the new `careerTier` field, a `PROGRESSION` history
 *    entry, and a notification — no existing stat is altered, so simulation
 *    balance is unaffected (crew `reputation`/`morale` feed no gameplay formula).
 *
 * No database calls are made; the caller persists the mutated GameState and
 * flushes pending history/notifications.
 */
import { addTalentHistory } from "../simulation/helpers/historyHelper.js";
import { addNotification } from "../simulation/helpers/notificationHelper.js";

const toNumber = (value) => Number(value || 0);

/**
 * Career tiers in ascending order. `min` is the inclusive reputation threshold
 * at which a crew reaches that tier.
 */
export const CREW_CAREER_TIERS = [
  { name: "Rookie", min: 0 },
  { name: "Professional", min: 20 },
  { name: "Established", min: 40 },
  { name: "Veteran", min: 60 },
  { name: "Legendary", min: 80 },
];

/** Highest tier index whose threshold is met by the given reputation. */
const tierIndexForReputation = (reputation) => {
  const rep = toNumber(reputation);
  let index = 0;
  for (let i = 0; i < CREW_CAREER_TIERS.length; i += 1) {
    if (rep >= CREW_CAREER_TIERS[i].min) {
      index = i;
    }
  }
  return index;
};

/** Index of a named tier, or -1 if unrecognised (treated as pre-tier baseline). */
const tierIndexByName = (name) =>
  CREW_CAREER_TIERS.findIndex((tier) => tier.name === name);

/**
 * Advances owned crew along the career ladder based on their current reputation.
 *
 * For each owned crew, compares the tier implied by their reputation against
 * their recorded `careerTier`; if it is strictly higher, promotes them (updates
 * the field, records a `PROGRESSION` history entry, and queues a notification).
 *
 * @param {object} gameState - GameState document (mutated in place).
 * @returns {number} The number of crew promoted this call (useful for tests/logging).
 */
export const processCrewProgression = (gameState) => {
  const crews = gameState.ownedCrewTeams || [];
  let promotions = 0;

  crews.forEach((crew) => {
    if (!crew) {
      return;
    }

    const newIndex = tierIndexForReputation(crew.reputation);

    const recordedIndex = tierIndexByName(crew.careerTier);
    // Unrecognised / unset tier is treated as the baseline (Rookie, index 0).
    const currentIndex = recordedIndex === -1 ? 0 : recordedIndex;

    if (newIndex > currentIndex) {
      const fromTier = CREW_CAREER_TIERS[currentIndex].name;
      const toTier = CREW_CAREER_TIERS[newIndex].name;

      crew.careerTier = toTier;
      promotions += 1;

      addTalentHistory(gameState, crew.id, "PROGRESSION", {
        week: gameState.currentWeek,
        fromTier,
        toTier,
        reputation: toNumber(crew.reputation),
      });

      addNotification(gameState, `${crew.name} was promoted to ${toTier} crew.`);
    }
  });

  return promotions;
};
