import * as storage from './storage.js';
import { getDay } from './storage.js';
import { uid } from './util.js';

const data = storage.load();
const listeners = new Set();

function persist() {
  storage.save(data);
}

function notify() {
  for (const fn of listeners) fn();
}

function commit() {
  persist();
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return data;
}

export function getGoals() {
  return data.goals;
}

export function updateGoals(partial) {
  Object.assign(data.goals, partial);
  commit();
}

export function getFoods() {
  return data.foods;
}

export function getFood(id) {
  return data.foods.find((f) => f.id === id);
}

export function addFood(food) {
  const entry = {
    id: uid(),
    name: food.name.trim(),
    brand: (food.brand || '').trim(),
    unit: food.unit === 'ml' ? 'ml' : 'g',
    per100: { ...food.per100 },
    custom: true,
    estimated: false,
  };
  data.foods.push(entry);
  commit();
  return entry;
}

export function updateFood(id, food) {
  const existing = getFood(id);
  if (!existing) return;
  existing.name = food.name.trim();
  existing.brand = (food.brand || '').trim();
  existing.unit = food.unit === 'ml' ? 'ml' : 'g';
  existing.per100 = { ...food.per100 };
  commit();
}

export function deleteFood(id) {
  const idx = data.foods.findIndex((f) => f.id === id);
  if (idx === -1) return;
  data.foods.splice(idx, 1);
  commit();
}

export function getDiaryDay(dateKeyStr) {
  return getDay(data, dateKeyStr);
}

export function addEntry(dateKeyStr, meal, food, qty) {
  const day = getDiaryDay(dateKeyStr);
  day[meal].push({
    id: uid(),
    foodId: food.id,
    name: food.name,
    brand: food.brand,
    unit: food.unit,
    per100: { ...food.per100 },
    qty,
  });
  commit();
}

export function removeEntry(dateKeyStr, meal, entryId) {
  const day = getDiaryDay(dateKeyStr);
  day[meal] = day[meal].filter((e) => e.id !== entryId);
  commit();
}

export function updateEntryQty(dateKeyStr, meal, entryId, qty) {
  const day = getDiaryDay(dateKeyStr);
  const entry = day[meal].find((e) => e.id === entryId);
  if (!entry) return;
  entry.qty = qty;
  commit();
}

export function replaceState(newState) {
  Object.keys(data).forEach((k) => delete data[k]);
  Object.assign(data, newState);
  commit();
}
