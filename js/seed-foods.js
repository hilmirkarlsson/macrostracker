// Built-in food database. Macros are per 100g (solids) or per 100ml (liquids).
// Entries flagged `estimated: true` could not be confirmed against an exact
// official spec sheet during seeding — worth double-checking against the
// package label and correcting in Foods > edit if you spot a difference.

function food(id, name, brand, unit, per100, opts = {}) {
  return {
    id,
    name,
    brand,
    unit, // 'g' or 'ml'
    per100,
    custom: false,
    estimated: !!opts.estimated,
  };
}

export const SEED_FOODS = [
  food('hledsla-sukkulaedi', 'Hleðsla – Súkkulaði', 'MS', 'ml', {
    calories: 64, protein: 8.4, carbs: 6.5, sugar: 5.9, fiber: 0, fat: 0.5, satFat: 0.3,
  }),
  food('hledsla-kolvetnaskert', 'Hleðsla – Kolvetnaskert', 'MS', 'ml', {
    calories: 55, protein: 8.4, carbs: 4.4, sugar: 3.8, fiber: 0, fat: 0.5, satFat: 0.4,
  }),
  food('hledsla-vanilla', 'Hleðsla – Vanilla', 'MS', 'ml', {
    calories: 62, protein: 8.4, carbs: 6.0, sugar: 5.5, fiber: 0, fat: 0.4, satFat: 0.3,
  }, { estimated: true }),
  food('hledsla-proteinkaffi', 'Hleðsla – Próteinkaffi', 'MS', 'ml', {
    calories: 60, protein: 8.8, carbs: 5.0, sugar: 4.5, fiber: 0, fat: 0.5, satFat: 0.3,
  }, { estimated: true }),
  food('hledsla-proteinskyr', 'Hleðsla – Próteinskyr (jarðarber & banani)', 'MS', 'g', {
    calories: 62, protein: 11, carbs: 4.5, sugar: 4.0, fiber: 0, fat: 0.2, satFat: 0.1,
  }, { estimated: true }),
  food('fron-mjolkurkex', 'Frón Mjólkurkex', 'Frón', 'g', {
    calories: 464, protein: 5.9, carbs: 66, sugar: 33, fiber: 1.9, fat: 10, satFat: 5.5,
  }, { estimated: true }),
  food('skyr-hreint', 'Skyr, hreint', 'MS Ísey', 'g', {
    calories: 61, protein: 11, carbs: 3.7, sugar: 3.7, fiber: 0, fat: 0.2, satFat: 0.1,
  }),
  food('egg-whole-raw', 'Egg, whole (raw)', '', 'g', {
    calories: 155, protein: 13, carbs: 1.1, sugar: 1.1, fiber: 0, fat: 11, satFat: 3.6,
  }),
  food('chicken-breast-raw', 'Chicken breast, skinless (raw)', '', 'g', {
    calories: 120, protein: 22.5, carbs: 0, sugar: 0, fiber: 0, fat: 2.6, satFat: 0.7,
  }),
  food('chicken-breast-cooked', 'Chicken breast, skinless (cooked)', '', 'g', {
    calories: 165, protein: 31, carbs: 0, sugar: 0, fiber: 0, fat: 3.6, satFat: 1.0,
  }),
  food('grjonagrautur', 'Grjónagrautur (rice porridge, with milk)', '', 'g', {
    calories: 110, protein: 3.5, carbs: 16, sugar: 8, fiber: 0.2, fat: 2.5, satFat: 1.5,
  }, { estimated: true }),
];
