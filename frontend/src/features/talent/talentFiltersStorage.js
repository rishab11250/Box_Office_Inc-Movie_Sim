// Persistence helpers for talent filter UI state.
//
// The talent market pages (actors, writers, directors, crew) let the player
// search, filter, and sort large talent pools. Issue #10 requires that these
// selections persist across navigation and reloads. We store the filter slice
// in localStorage under a single key and rehydrate it when the app boots.

const STORAGE_KEY = "cineverse_talent_filters";

/**
 * Read the persisted talent-filters state from localStorage.
 * Returns null when nothing is stored or the value can't be parsed, so the
 * slice can safely fall back to its defaults.
 */
export const loadTalentFilters = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    // Corrupt/unavailable storage -> behave as if nothing was saved.
    return null;
  }
};

/**
 * Persist the talent-filters state to localStorage. Failures (e.g. storage
 * disabled or quota exceeded) are swallowed so they never break the UI.
 */
export const saveTalentFilters = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failures — filters still work for the session.
  }
};

export default { loadTalentFilters, saveTalentFilters };
