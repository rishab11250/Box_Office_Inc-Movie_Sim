// Talent filters slice.
//
// Centralises the search / filter / sort UI state for every talent market
// page (actors, writers, directors, crew) so those selections persist across
// navigation and page reloads (issue #10: "State persists correctly").
//
// Each page has its own filter shape; we keep them namespaced under one slice.
// The page components read their slice via useSelector and update it through
// the per-page setters below, so the existing filtering/sorting logic on each
// page is unchanged — only the source of the filter values moves into Redux.

import { createSlice } from "@reduxjs/toolkit";

import { loadTalentFilters } from "./talentFiltersStorage";

// Default filter state per page. These mirror the initial useState values that
// previously lived inside each page component, so behaviour is identical on a
// fresh load with nothing persisted.
export const DEFAULT_FILTERS = {
  actors: {
    search: "",
    ageFilter: "All",
    popularityFilter: "All",
    fanbaseFilter: "All",
    salaryFilter: "All",
    awardsFilter: "All",
    rarityFilter: "All",
    sortBy: "popularityDesc",
  },
  writers: {
    search: "",
    selectedGenre: "All",
    ageFilter: "All",
    rarityFilter: "All",
    sortBy: "salaryDesc",
  },
  directors: {
    search: "",
    selectedGenre: "All",
    ageFilter: "All",
    rarityFilter: "All",
    reputationFilter: "All",
    salaryFilter: "All",
    sortBy: "reputationDesc",
  },
  crew: {
    search: "",
    rarityFilter: "All",
    qualityFilter: "All",
    salaryFilter: "All",
    sortBy: "technicalDesc",
  },
};

// Merge any persisted state over the defaults, key by key, so a saved partial
// or an older shape never drops the newer default fields.
const buildInitialState = () => {
  const persisted = loadTalentFilters();
  if (!persisted) return DEFAULT_FILTERS;

  const merged = {};
  for (const page of Object.keys(DEFAULT_FILTERS)) {
    merged[page] = { ...DEFAULT_FILTERS[page], ...(persisted[page] || {}) };
  }
  return merged;
};

const talentSlice = createSlice({
  name: "talent",
  initialState: buildInitialState(),
  reducers: {
    // Patch a subset of a page's filters: dispatch(setActorFilters({ search: "x" }))
    setActorFilters: (state, action) => {
      state.actors = { ...state.actors, ...action.payload };
    },
    setWriterFilters: (state, action) => {
      state.writers = { ...state.writers, ...action.payload };
    },
    setDirectorFilters: (state, action) => {
      state.directors = { ...state.directors, ...action.payload };
    },
    setCrewFilters: (state, action) => {
      state.crew = { ...state.crew, ...action.payload };
    },
    // Reset a single page's filters back to defaults (the "Clear filters" action).
    resetActorFilters: (state) => {
      state.actors = { ...DEFAULT_FILTERS.actors };
    },
    resetWriterFilters: (state) => {
      state.writers = { ...DEFAULT_FILTERS.writers };
    },
    resetDirectorFilters: (state) => {
      state.directors = { ...DEFAULT_FILTERS.directors };
    },
    resetCrewFilters: (state) => {
      state.crew = { ...DEFAULT_FILTERS.crew };
    },
  },
});

export const {
  setActorFilters,
  setWriterFilters,
  setDirectorFilters,
  setCrewFilters,
  resetActorFilters,
  resetWriterFilters,
  resetDirectorFilters,
  resetCrewFilters,
} = talentSlice.actions;

// Selectors
export const selectActorFilters = (state) => state.talent.actors;
export const selectWriterFilters = (state) => state.talent.writers;
export const selectDirectorFilters = (state) => state.talent.directors;
export const selectCrewFilters = (state) => state.talent.crew;

export default talentSlice.reducer;
