/**
 * @fileoverview Home Media Engine (issue #192)
 *
 * Processes weekly VOD and physical home-media sales for released movies.
 * Called each tick after theatrical box office activity has settled.
 *
 * ## Revenue model
 * - Base weekly revenue for VOD:      worldwideGross × 0.012  (1.2% per week)
 * - Additional for PHYSICAL:          worldwideGross × 0.006  (0.6% extra per week)
 * - Combined (BOTH):                  worldwideGross × 0.018
 *
 * Revenue decays 8% per week (multiplied by 0.92^weeksOnSale).
 * Sales stop when weeklyRevenue drops below $10,000 or after 52 weeks.
 *
 * All proceeds are added directly to studio.money.
 */

import Movie from "../../../models/Movie.js";

const VOD_BASE_RATE      = 0.012;
const PHYSICAL_EXTRA     = 0.006;
const WEEKLY_DECAY       = 0.92;
const MIN_REVENUE        = 10_000;
const MAX_WEEKS_ON_SALE  = 52;

/**
 * Processes home media revenue for all movies currently in home media release.
 *
 * @param {object} studio    - Studio Mongoose document (mutated in place).
 * @param {number} currentWeek
 * @returns {Promise<void>}
 */
export const processHomeMediaSales = async (studio, currentWeek) => {
  const moviesOnHomeMedia = await Movie.find({
    studioId: studio._id,
    "homeMedia.status": { $in: ["VOD", "PHYSICAL", "BOTH"] },
    status: "RELEASED",
  });

  for (const movie of moviesOnHomeMedia) {
    const hm = movie.homeMedia;
    if (hm.weeksOnSale >= MAX_WEEKS_ON_SALE) continue;

    const baseRevenue = movie.worldwideGross || 0;
    let weeklyBase = 0;

    if (hm.status === "VOD")      weeklyBase = baseRevenue * VOD_BASE_RATE;
    if (hm.status === "PHYSICAL") weeklyBase = baseRevenue * PHYSICAL_EXTRA;
    if (hm.status === "BOTH")     weeklyBase = baseRevenue * (VOD_BASE_RATE + PHYSICAL_EXTRA);

    const weeklyRevenue = Math.round(weeklyBase * Math.pow(WEEKLY_DECAY, hm.weeksOnSale));

    if (weeklyRevenue < MIN_REVENUE) {
      // Sales have dried up — stop processing
      hm.status = "NONE";
      await movie.save();
      continue;
    }

    hm.weeklyRevenue  = weeklyRevenue;
    hm.totalRevenue   = (hm.totalRevenue || 0) + weeklyRevenue;
    hm.weeksOnSale    = (hm.weeksOnSale || 0) + 1;
    studio.money      += weeklyRevenue;

    await movie.save();
  }
};
