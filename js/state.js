import * as storage from './storage.js';
import { getDay } from './storage.js';
import { uid, addDays } from './util.js';

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

export function getProfile() {
  return data.profile;
}

export function updateProfile(partial) {
  Object.assign(data.profile, partial);
  commit();
}

export function getGoalsConfig() {
  return data.goals;
}

export function getDefaultDayType() {
  return data.goals.defaultDayType;
}

export function setDefaultDayType(type) {
  data.goals.defaultDayType = type;
  commit();
}

export function getDayType(dateKeyStr) {
  const day = getDiaryDay(dateKeyStr);
  return day.dayType || data.goals.defaultDayType;
}

export function setDayType(dateKeyStr, type) {
  const day = getDiaryDay(dateKeyStr);
  day.dayType = type;
  commit();
}

export function getGoalPreset(type) {
  return data.goals[type];
}

export function updateGoalPreset(type, partialValues) {
  Object.assign(data.goals[type].values, partialValues);
  commit();
}

export function setGoalCalculated(type, calculated, applyToValues = true) {
  data.goals[type].calculated = { ...calculated };
  if (applyToValues) data.goals[type].values = { ...calculated };
  commit();
}

export function resetGoalToCalculated(type) {
  const preset = data.goals[type];
  if (!preset.calculated) return;
  preset.values = { ...preset.calculated };
  commit();
}

// Resolves the active flat goal targets for a given day (or the default day
// type if no date is given), for callers that just want today's numbers.
export function getGoals(dateKeyStr) {
  const type = dateKeyStr ? getDayType(dateKeyStr) : data.goals.defaultDayType;
  return data.goals[type].values;
}

export function updateGoals(partial, dateKeyStr) {
  const type = dateKeyStr ? getDayType(dateKeyStr) : data.goals.defaultDayType;
  Object.assign(data.goals[type].values, partial);
  commit();
}

export function getFoods() {
  return data.foods;
}

export function getFood(id) {
  return data.foods.find((f) => f.id === id);
}

function normalizeUnit(unit) {
  return unit === 'ml' || unit === 'piece' ? unit : 'g';
}

export function addFood(food) {
  const unit = normalizeUnit(food.unit);
  const entry = {
    id: uid(),
    name: food.name.trim(),
    brand: (food.brand || '').trim(),
    unit,
    per100: { ...food.per100 },
    custom: true,
    estimated: false,
    quickAdd: !!food.quickAdd,
    defaultQty: food.defaultQty ?? (unit === 'piece' ? 1 : 100),
  };
  data.foods.push(entry);
  commit();
  return entry;
}

export function updateFood(id, food) {
  const existing = getFood(id);
  if (!existing) return;
  const unit = normalizeUnit(food.unit);
  existing.name = food.name.trim();
  existing.brand = (food.brand || '').trim();
  existing.unit = unit;
  existing.per100 = { ...food.per100 };
  if (food.quickAdd !== undefined) existing.quickAdd = !!food.quickAdd;
  if (food.defaultQty !== undefined) existing.defaultQty = food.defaultQty;
  commit();
}

export function deleteFood(id) {
  const idx = data.foods.findIndex((f) => f.id === id);
  if (idx === -1) return;
  data.foods.splice(idx, 1);
  commit();
}

export function setFoodQuickAdd(id, quickAdd) {
  const existing = getFood(id);
  if (!existing) return;
  existing.quickAdd = !!quickAdd;
  commit();
}

export function setFoodDefaultQty(id, qty) {
  const existing = getFood(id);
  if (!existing) return;
  existing.defaultQty = qty;
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

// Adds an ad-hoc "quick" entry with exact macros (no backing food). Stored as a
// single-piece item with qty 1 so existing scale/sum logic gives exact totals.
export function addQuickEntry(dateKeyStr, meal, macros, label) {
  const day = getDiaryDay(dateKeyStr);
  day[meal].push({
    id: uid(),
    foodId: null,
    name: label || 'Quick add',
    brand: '',
    unit: 'piece',
    per100: {
      calories: macros.calories || 0,
      protein: macros.protein || 0,
      carbs: macros.carbs || 0,
      fat: macros.fat || 0,
      sugar: macros.sugar || 0,
      fiber: macros.fiber || 0,
    },
    qty: 1,
    quick: true,
  });
  commit();
}

// Copies the same meal from the most recent earlier day that has entries in it,
// cloning each line with a fresh id. Returns how many entries were copied.
export function copyMealFromPrevious(dateKeyStr, meal, lookbackDays = 30) {
  const day = getDiaryDay(dateKeyStr);
  let cursor = dateKeyStr;
  for (let i = 0; i < lookbackDays; i++) {
    cursor = addDays(cursor, -1);
    const src = data.diary[cursor];
    if (src && Array.isArray(src[meal]) && src[meal].length > 0) {
      for (const entry of src[meal]) {
        day[meal].push({ ...entry, per100: { ...entry.per100 }, id: uid() });
      }
      commit();
      return src[meal].length;
    }
  }
  return 0;
}

export function getWater(dateKeyStr) {
  return getDiaryDay(dateKeyStr).water || 0;
}

export function setWater(dateKeyStr, cups) {
  const day = getDiaryDay(dateKeyStr);
  day.water = Math.max(0, Math.min(30, Math.round(cups)));
  commit();
}

export function getWeights() {
  return data.weights || {};
}

export function getWeight(dateKeyStr) {
  return (data.weights || {})[dateKeyStr];
}

export function setWeight(dateKeyStr, kg) {
  if (!data.weights) data.weights = {};
  data.weights[dateKeyStr] = kg;
  commit();
}

export function removeWeight(dateKeyStr) {
  if (data.weights && data.weights[dateKeyStr] !== undefined) {
    delete data.weights[dateKeyStr];
    commit();
  }
}

export function getMeals() {
  return data.meals;
}

export function getMeal(id) {
  return data.meals.find((m) => m.id === id);
}

export function addMeal(meal) {
  const entry = {
    id: uid(),
    name: meal.name.trim(),
    items: meal.items.map((item) => ({ foodId: item.foodId, qty: item.qty })),
  };
  data.meals.push(entry);
  commit();
  return entry;
}

export function updateMeal(id, meal) {
  const existing = getMeal(id);
  if (!existing) return;
  existing.name = meal.name.trim();
  existing.items = meal.items.map((item) => ({ foodId: item.foodId, qty: item.qty }));
  commit();
}

export function deleteMeal(id) {
  const idx = data.meals.findIndex((m) => m.id === id);
  if (idx === -1) return;
  data.meals.splice(idx, 1);
  commit();
}

// Expands a saved meal's items into separate diary line items (not a single
// collapsed entry), so each food stays individually editable in the diary.
export function logMeal(dateKeyStr, mealSlot, meal) {
  const day = getDiaryDay(dateKeyStr);
  for (const item of meal.items) {
    const food = getFood(item.foodId);
    if (!food) continue;
    day[mealSlot].push({
      id: uid(),
      foodId: food.id,
      name: food.name,
      brand: food.brand,
      unit: food.unit,
      per100: { ...food.per100 },
      qty: item.qty,
    });
  }
  commit();
}

export function replaceState(newState) {
  Object.keys(data).forEach((k) => delete data[k]);
  Object.assign(data, newState);
  commit();
}
