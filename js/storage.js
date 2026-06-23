// Storage abstraction. Everything reads/writes through this module so the
// backing store can later be swapped for a Google Drive-synced provider
// without touching app logic — callers only ever see load()/save().
import { SEED_FOODS } from './seed-foods.js';

const STORAGE_KEY = 'mft:data:v1';
const SCHEMA_VERSION = 2;

function defaultFlatGoals() {
  return {
    calories: 2200,
    protein: 165,
    carbs: 220,
    fat: 70,
  };
}

function defaultGoalPreset(values) {
  return { calculated: null, values: { ...values } };
}

function defaultGoals() {
  const flat = defaultFlatGoals();
  return {
    defaultDayType: 'training',
    training: defaultGoalPreset(flat),
    rest: defaultGoalPreset(flat),
  };
}

function defaultProfile() {
  return {
    sex: 'male',
    age: 0,
    heightCm: 0,
    weightKg: 0,
    goalWeightKg: 0,
    rateKgPerWeek: -0.5,
    activityLevel: 'moderate',
  };
}

function defaultState() {
  return {
    version: SCHEMA_VERSION,
    profile: defaultProfile(),
    goals: defaultGoals(),
    foods: SEED_FOODS.map((f) => ({ ...f })),
    meals: [],
    diary: {},
  };
}

function emptyDay() {
  return { dayType: null, breakfast: [], lunch: [], dinner: [], snacks: [] };
}

// One-time upgrade from the original flat-goals, gram-only-foods schema.
function migrateV1toV2(state) {
  const oldGoals = { ...defaultFlatGoals(), ...state.goals };
  state.profile = state.profile || defaultProfile();
  state.goals = {
    defaultDayType: 'training',
    training: defaultGoalPreset(oldGoals),
    rest: defaultGoalPreset(oldGoals),
  };
  state.meals = state.meals || [];
  state.diary = state.diary || {};
  for (const day of Object.values(state.diary)) {
    if (day.dayType === undefined) day.dayType = null;
  }
  // Refresh built-in (non-custom) foods from the current seed list so
  // existing installs pick up the new quickAdd/defaultQty metadata and
  // the egg per-100g -> per-piece conversion. Custom foods are untouched.
  const seedById = new Map(SEED_FOODS.map((f) => [f.id, f]));
  state.foods = (state.foods || []).map((f) => {
    if (!f.custom && seedById.has(f.id)) return { ...seedById.get(f.id) };
    return { quickAdd: false, defaultQty: f.unit === 'piece' ? 1 : 100, ...f };
  });
  state.version = 2;
  return state;
}

function migrate(state) {
  if (!state.version || state.version < 2) state = migrateV1toV2(state);
  return state;
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to read stored data, starting fresh.', err);
    return null;
  }
}

function writeRaw(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function load() {
  const existing = readRaw();
  if (!existing) {
    const fresh = defaultState();
    writeRaw(fresh);
    return fresh;
  }
  const migrated = migrate(existing);
  // Make sure newly-added seed foods appear for existing users without
  // clobbering any edits they made to their own custom foods.
  const knownIds = new Set(migrated.foods.map((f) => f.id));
  for (const seed of SEED_FOODS) {
    if (!knownIds.has(seed.id)) migrated.foods.push({ ...seed });
  }
  return migrated;
}

export function save(state) {
  writeRaw(state);
}

export function getDay(state, dateKey) {
  if (!state.diary[dateKey]) {
    state.diary[dateKey] = emptyDay();
  }
  return state.diary[dateKey];
}

export function exportJSON(state) {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !parsed.foods) {
    throw new Error('That file does not look like a tracker export.');
  }
  return migrate(parsed);
}
