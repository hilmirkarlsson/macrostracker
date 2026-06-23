// Storage abstraction. Everything reads/writes through this module so the
// backing store can later be swapped for a Google Drive-synced provider
// without touching app logic — callers only ever see load()/save().
import { SEED_FOODS } from './seed-foods.js';

const STORAGE_KEY = 'mft:data:v1';
const SCHEMA_VERSION = 1;

function defaultGoals() {
  return {
    calories: 2200,
    protein: 165,
    carbs: 220,
    sugar: 50,
    fiber: 30,
    fat: 70,
    satFat: 20,
  };
}

function defaultState() {
  return {
    version: SCHEMA_VERSION,
    goals: defaultGoals(),
    foods: SEED_FOODS.map((f) => ({ ...f })),
    diary: {},
  };
}

function emptyDay() {
  return { breakfast: [], lunch: [], dinner: [], snacks: [] };
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
  // Make sure newly-added seed foods appear for existing users without
  // clobbering any edits they made to their own custom foods.
  const knownIds = new Set(existing.foods.map((f) => f.id));
  for (const seed of SEED_FOODS) {
    if (!knownIds.has(seed.id)) existing.foods.push({ ...seed });
  }
  existing.goals = { ...defaultGoals(), ...existing.goals };
  existing.diary = existing.diary || {};
  return existing;
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
  if (!parsed || typeof parsed !== 'object' || !parsed.foods || !parsed.goals) {
    throw new Error('That file does not look like a tracker export.');
  }
  parsed.diary = parsed.diary || {};
  parsed.goals = { ...defaultGoals(), ...parsed.goals };
  return parsed;
}
