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

  // Proteins
  food('chicken-thigh-raw', 'Chicken thigh, skinless (raw)', '', 'g', {
    calories: 119, protein: 17.9, carbs: 0, sugar: 0, fiber: 0, fat: 4.6, satFat: 1.3,
  }),
  food('chicken-whole-roasted', 'Chicken, whole (roasted, meat & skin)', '', 'g', {
    calories: 239, protein: 27, carbs: 0, sugar: 0, fiber: 0, fat: 14, satFat: 3.8,
  }, { estimated: true }),
  food('beef-ground-raw', 'Beef, ground 85% lean (raw)', '', 'g', {
    calories: 215, protein: 18.6, carbs: 0, sugar: 0, fiber: 0, fat: 15.4, satFat: 6.0,
  }),
  food('beef-steak-raw', 'Beef, sirloin steak, lean (raw)', '', 'g', {
    calories: 142, protein: 21.6, carbs: 0, sugar: 0, fiber: 0, fat: 5.4, satFat: 2.1,
  }),
  food('pork-chop-raw', 'Pork loin chop, lean (raw)', '', 'g', {
    calories: 143, protein: 21.4, carbs: 0, sugar: 0, fiber: 0, fat: 5.6, satFat: 1.9,
  }),
  food('salmon-raw', 'Salmon (raw)', '', 'g', {
    calories: 208, protein: 20.4, carbs: 0, sugar: 0, fiber: 0, fat: 13.4, satFat: 3.1,
  }),
  food('cod-raw', 'Cod (raw)', '', 'g', {
    calories: 82, protein: 17.8, carbs: 0, sugar: 0, fiber: 0, fat: 0.7, satFat: 0.1,
  }),
  food('tuna-canned-water', 'Tuna, canned in water (drained)', '', 'g', {
    calories: 116, protein: 25.5, carbs: 0, sugar: 0, fiber: 0, fat: 0.8, satFat: 0.2,
  }),
  food('tofu-firm', 'Tofu, firm', '', 'g', {
    calories: 144, protein: 15.8, carbs: 2.8, sugar: 0.6, fiber: 1.9, fat: 8.7, satFat: 1.3,
  }),
  food('beans-black-cooked', 'Black beans, cooked', '', 'g', {
    calories: 132, protein: 8.9, carbs: 23.7, sugar: 0.3, fiber: 8.7, fat: 0.5, satFat: 0.1,
  }),
  food('beans-kidney-cooked', 'Kidney beans, cooked', '', 'g', {
    calories: 127, protein: 8.7, carbs: 22.8, sugar: 0.3, fiber: 6.4, fat: 0.5, satFat: 0.1,
  }),
  food('chickpeas-cooked', 'Chickpeas, cooked', '', 'g', {
    calories: 164, protein: 8.9, carbs: 27.4, sugar: 4.8, fiber: 7.6, fat: 2.6, satFat: 0.3,
  }),
  food('lentils-cooked', 'Lentils, cooked', '', 'g', {
    calories: 116, protein: 9.0, carbs: 20.1, sugar: 1.8, fiber: 7.9, fat: 0.4, satFat: 0.1,
  }),
  food('greek-yogurt-plain', 'Greek yogurt, plain (2%)', '', 'g', {
    calories: 73, protein: 10.0, carbs: 3.9, sugar: 3.9, fiber: 0, fat: 1.9, satFat: 1.2,
  }),
  food('cottage-cheese-2pct', 'Cottage cheese (2%)', '', 'g', {
    calories: 84, protein: 11.1, carbs: 4.3, sugar: 4.1, fiber: 0, fat: 2.3, satFat: 1.3,
  }),
  food('whey-protein-powder', 'Whey protein powder', '', 'g', {
    calories: 400, protein: 80, carbs: 8, sugar: 4, fiber: 1, fat: 6, satFat: 3,
  }, { estimated: true }),
  food('plant-protein-powder', 'Plant protein powder (pea)', '', 'g', {
    calories: 380, protein: 78, carbs: 5, sugar: 1, fiber: 3, fat: 4, satFat: 0.5,
  }, { estimated: true }),

  // Carbs / grains
  food('rice-white-cooked', 'Rice, white (cooked)', '', 'g', {
    calories: 130, protein: 2.7, carbs: 28.2, sugar: 0.1, fiber: 0.4, fat: 0.3, satFat: 0.1,
  }),
  food('rice-brown-cooked', 'Rice, brown (cooked)', '', 'g', {
    calories: 123, protein: 2.7, carbs: 25.6, sugar: 0.4, fiber: 1.6, fat: 1.0, satFat: 0.2,
  }),
  food('pasta-cooked', 'Pasta, cooked', '', 'g', {
    calories: 158, protein: 5.8, carbs: 30.9, sugar: 0.6, fiber: 1.8, fat: 0.9, satFat: 0.2,
  }),
  food('bread-white', 'Bread, white', '', 'g', {
    calories: 265, protein: 9.0, carbs: 49, sugar: 5, fiber: 2.7, fat: 3.2, satFat: 0.7,
  }, { estimated: true }),
  food('bread-wholewheat', 'Bread, whole wheat', '', 'g', {
    calories: 252, protein: 10.7, carbs: 43, sugar: 5, fiber: 6.8, fat: 3.5, satFat: 0.7,
  }, { estimated: true }),
  food('oats-rolled-dry', 'Oats, rolled (dry)', '', 'g', {
    calories: 389, protein: 16.9, carbs: 66.3, sugar: 1.0, fiber: 10.6, fat: 6.9, satFat: 1.2,
  }),
  food('potato-boiled', 'Potato, boiled (with skin)', '', 'g', {
    calories: 87, protein: 1.9, carbs: 20.1, sugar: 0.9, fiber: 1.8, fat: 0.1, satFat: 0,
  }),
  food('sweet-potato-boiled', 'Sweet potato, boiled', '', 'g', {
    calories: 90, protein: 2.0, carbs: 20.7, sugar: 6.5, fiber: 3.3, fat: 0.1, satFat: 0,
  }),
  food('quinoa-cooked', 'Quinoa, cooked', '', 'g', {
    calories: 120, protein: 4.4, carbs: 21.3, sugar: 0.9, fiber: 2.8, fat: 1.9, satFat: 0.2,
  }),
  food('tortilla-flour', 'Tortilla, flour', '', 'g', {
    calories: 312, protein: 8.2, carbs: 51.4, sugar: 2.6, fiber: 3, fat: 7.6, satFat: 1.8,
  }, { estimated: true }),
  food('cereal-cornflakes', 'Cereal, corn flakes', '', 'g', {
    calories: 357, protein: 7.5, carbs: 84, sugar: 8, fiber: 3, fat: 0.9, satFat: 0.2,
  }, { estimated: true }),

  // Dairy
  food('milk-whole', 'Milk, whole (3.25%)', '', 'ml', {
    calories: 61, protein: 3.2, carbs: 4.8, sugar: 4.8, fiber: 0, fat: 3.3, satFat: 1.9,
  }),
  food('milk-skim', 'Milk, skim', '', 'ml', {
    calories: 34, protein: 3.4, carbs: 5.0, sugar: 5.1, fiber: 0, fat: 0.1, satFat: 0.1,
  }),
  food('milk-oat', 'Oat milk, unsweetened', '', 'ml', {
    calories: 47, protein: 1.0, carbs: 7.5, sugar: 4, fiber: 0.8, fat: 1.5, satFat: 0.2,
  }, { estimated: true }),
  food('cheese-cheddar', 'Cheese, cheddar', '', 'g', {
    calories: 403, protein: 24.9, carbs: 1.3, sugar: 0.5, fiber: 0, fat: 33.1, satFat: 21,
  }),
  food('cheese-mozzarella', 'Cheese, mozzarella', '', 'g', {
    calories: 280, protein: 19.4, carbs: 2.2, sugar: 1.0, fiber: 0, fat: 21.6, satFat: 13.2,
  }, { estimated: true }),
  food('yogurt-plain', 'Yogurt, plain (whole milk)', '', 'g', {
    calories: 61, protein: 3.5, carbs: 4.7, sugar: 4.7, fiber: 0, fat: 3.3, satFat: 2.1,
  }),
  food('butter', 'Butter', '', 'g', {
    calories: 717, protein: 0.9, carbs: 0.1, sugar: 0.1, fiber: 0, fat: 81.1, satFat: 51.4,
  }),

  // Fruits
  food('banana', 'Banana', '', 'g', {
    calories: 89, protein: 1.1, carbs: 22.8, sugar: 12.2, fiber: 2.6, fat: 0.3, satFat: 0.1,
  }),
  food('apple', 'Apple, with skin', '', 'g', {
    calories: 52, protein: 0.3, carbs: 13.8, sugar: 10.4, fiber: 2.4, fat: 0.2, satFat: 0,
  }),
  food('orange', 'Orange', '', 'g', {
    calories: 47, protein: 0.9, carbs: 11.8, sugar: 9.4, fiber: 2.4, fat: 0.1, satFat: 0,
  }),
  food('strawberry', 'Strawberry', '', 'g', {
    calories: 32, protein: 0.7, carbs: 7.7, sugar: 4.9, fiber: 2.0, fat: 0.3, satFat: 0,
  }),
  food('blueberry', 'Blueberry', '', 'g', {
    calories: 57, protein: 0.7, carbs: 14.5, sugar: 10, fiber: 2.4, fat: 0.3, satFat: 0,
  }),
  food('grapes', 'Grapes', '', 'g', {
    calories: 69, protein: 0.7, carbs: 18.1, sugar: 15.5, fiber: 0.9, fat: 0.2, satFat: 0.1,
  }),
  food('avocado', 'Avocado', '', 'g', {
    calories: 160, protein: 2.0, carbs: 8.5, sugar: 0.7, fiber: 6.7, fat: 14.7, satFat: 2.1,
  }),

  // Vegetables
  food('broccoli-raw', 'Broccoli, raw', '', 'g', {
    calories: 34, protein: 2.8, carbs: 6.6, sugar: 1.7, fiber: 2.6, fat: 0.4, satFat: 0.1,
  }),
  food('spinach-raw', 'Spinach, raw', '', 'g', {
    calories: 23, protein: 2.9, carbs: 3.6, sugar: 0.4, fiber: 2.2, fat: 0.4, satFat: 0.1,
  }),
  food('carrot-raw', 'Carrot, raw', '', 'g', {
    calories: 41, protein: 0.9, carbs: 9.6, sugar: 4.7, fiber: 2.8, fat: 0.2, satFat: 0,
  }),
  food('tomato-raw', 'Tomato, raw', '', 'g', {
    calories: 18, protein: 0.9, carbs: 3.9, sugar: 2.6, fiber: 1.2, fat: 0.2, satFat: 0,
  }),
  food('onion-raw', 'Onion, raw', '', 'g', {
    calories: 40, protein: 1.1, carbs: 9.3, sugar: 4.2, fiber: 1.7, fat: 0.1, satFat: 0,
  }),
  food('bell-pepper-raw', 'Bell pepper, raw', '', 'g', {
    calories: 31, protein: 1.0, carbs: 6.0, sugar: 4.2, fiber: 2.1, fat: 0.3, satFat: 0,
  }),
  food('lettuce-raw', 'Lettuce, iceberg, raw', '', 'g', {
    calories: 14, protein: 0.9, carbs: 3.0, sugar: 2.0, fiber: 1.2, fat: 0.1, satFat: 0,
  }),
  food('cucumber-raw', 'Cucumber, raw, with peel', '', 'g', {
    calories: 15, protein: 0.7, carbs: 3.6, sugar: 1.7, fiber: 0.5, fat: 0.1, satFat: 0,
  }),

  // Fats / oils
  food('olive-oil', 'Olive oil', '', 'ml', {
    calories: 884, protein: 0, carbs: 0, sugar: 0, fiber: 0, fat: 100, satFat: 13.8,
  }),
  food('peanut-butter', 'Peanut butter', '', 'g', {
    calories: 588, protein: 25.1, carbs: 20, sugar: 9.2, fiber: 6, fat: 50.4, satFat: 10.3,
  }),
  food('almonds', 'Almonds', '', 'g', {
    calories: 579, protein: 21.2, carbs: 21.6, sugar: 4.4, fiber: 12.5, fat: 49.9, satFat: 3.8,
  }),
  food('walnuts', 'Walnuts', '', 'g', {
    calories: 654, protein: 15.2, carbs: 13.7, sugar: 2.6, fiber: 6.7, fat: 65.2, satFat: 6.1,
  }),

  // Drinks
  food('coffee-black', 'Coffee, black', '', 'ml', {
    calories: 1, protein: 0.1, carbs: 0, sugar: 0, fiber: 0, fat: 0, satFat: 0,
  }),
  food('tea-black', 'Tea, black', '', 'ml', {
    calories: 1, protein: 0, carbs: 0.3, sugar: 0, fiber: 0, fat: 0, satFat: 0,
  }),
  food('cola-soda', 'Cola, soda', '', 'ml', {
    calories: 42, protein: 0, carbs: 10.6, sugar: 10.6, fiber: 0, fat: 0, satFat: 0,
  }),
  food('orange-juice', 'Orange juice', '', 'ml', {
    calories: 45, protein: 0.7, carbs: 10.4, sugar: 8.4, fiber: 0.2, fat: 0.2, satFat: 0,
  }),
  food('protein-shake-rtd', 'Protein shake, ready-to-drink', '', 'ml', {
    calories: 60, protein: 8, carbs: 4, sugar: 2, fiber: 0.5, fat: 1.5, satFat: 0.5,
  }, { estimated: true }),

  // Icelandic staples
  food('lysi', 'Lýsi (cod liver oil)', 'Lýsi hf', 'ml', {
    calories: 810, protein: 0, carbs: 0, sugar: 0, fiber: 0, fat: 92, satFat: 16,
  }),
  food('rugbraud', 'Rúgbrauð', '', 'g', {
    calories: 241, protein: 7, carbs: 51, sugar: 4, fiber: 6, fat: 1, satFat: 0.2,
  }, { estimated: true }),
  food('hangikjot', 'Hangikjöt (smoked lamb, cooked)', '', 'g', {
    calories: 220, protein: 22, carbs: 0, sugar: 0, fiber: 0, fat: 14, satFat: 6,
  }, { estimated: true }),
  food('hardfiskur', 'Harðfiskur (dried fish)', '', 'g', {
    calories: 342, protein: 80, carbs: 0, sugar: 0, fiber: 0, fat: 1, satFat: 0.2,
  }, { estimated: true }),
  food('kleinur', 'Kleinur', '', 'g', {
    calories: 380, protein: 6, carbs: 45, sugar: 12, fiber: 1, fat: 19, satFat: 8,
  }, { estimated: true }),
  food('cinnamon-bagel-kronan', 'Cinnamon bagel', 'Krónan', 'g', {
    calories: 271, protein: 9, carbs: 55, sugar: 8, fiber: 2.5, fat: 1.6, satFat: 0.3,
  }, { estimated: true }),
];
