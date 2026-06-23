import { el, fmt, fmt1 } from '../dom.js';
import * as state from '../state.js';
import { sumMacros, scaleMacros, clamp } from '../util.js';
import { openFoodPicker } from '../modals/foodpicker.js';

const MEALS = [
  ['breakfast', 'Breakfast'],
  ['lunch', 'Lunch'],
  ['dinner', 'Dinner'],
  ['snacks', 'Snacks'],
];

const MACRO_ROWS = [
  ['protein', 'Protein', 'var(--c-protein)', true],
  ['carbs', 'Carbs', 'var(--c-carbs)', false],
  ['sugar', 'Sugar', 'var(--c-sugar)', false],
  ['fiber', 'Fiber', 'var(--c-fiber)', false],
  ['fat', 'Fat', 'var(--c-fat)', false],
  ['satFat', 'Sat. fat', 'var(--c-satfat)', false],
];

function barRow(label, color, consumed, goal, emphasize) {
  const pct = goal > 0 ? clamp((consumed / goal) * 100, 0, 100) : 0;
  const over = consumed > goal;
  return el('div', { class: `bar-row ${emphasize ? 'protein-row' : ''}` }, [
    el('div', { class: 'bar-label' }, [
      el('span', { class: 'name' }, [el('span', { class: 'dot', style: `background:${color}` }), label]),
      el('span', { class: 'vals' }, [
        `${fmt1(consumed)} / ${fmt1(goal)} g`,
      ]),
    ]),
    el('div', { class: 'bar-track' }, [
      el('div', { class: 'bar-fill', style: `width:${pct}%;background:${over ? 'var(--danger)' : color}` }),
    ]),
  ]);
}

function calorieRow(consumed, goal) {
  const pct = goal > 0 ? clamp((consumed / goal) * 100, 0, 100) : 0;
  const remaining = goal - consumed;
  const over = remaining < 0;
  return el('div', { class: 'cal-summary' }, [
    el('div', { class: 'cal-numbers', style: 'width:100%' }, [
      el('div', { class: 'cal-big' }, [`${fmt(consumed)}`, el('span', { class: 'unit' }, ` / ${fmt(goal)} kcal`)]),
      el('div', { class: `cal-sub ${over ? 'over' : ''}` }, over ? `${fmt(Math.abs(remaining))} kcal over goal` : `${fmt(remaining)} kcal remaining`),
      el('div', { class: 'bar-track', style: 'margin-top:8px' }, [
        el('div', { class: 'bar-fill', style: `width:${pct}%;background:${over ? 'var(--danger)' : 'var(--c-calories)'}` }),
      ]),
    ]),
  ]);
}

function mealCard(dateKeyStr, mealKey, mealLabel, entries) {
  const totals = sumMacros(entries);
  const list = el('div', { class: 'entry-list' });
  if (entries.length === 0) {
    list.append(el('div', { class: 'empty-state' }, 'Nothing logged yet.'));
  } else {
    for (const entry of entries) {
      const m = scaleMacros(entry.per100, entry.qty);
      list.append(el('div', { class: 'entry-row' }, [
        el('div', { class: 'entry-main' }, [
          el('div', { class: 'entry-name' }, entry.name),
          el('div', { class: 'entry-qty' }, `${fmt1(entry.qty)} ${entry.unit} · P ${fmt1(m.protein)} C ${fmt1(m.carbs)} F ${fmt1(m.fat)}`),
        ]),
        el('div', { class: 'entry-cals' }, `${fmt(m.calories)} kcal`),
        el('button', { class: 'entry-del', onclick: () => state.removeEntry(dateKeyStr, mealKey, entry.id) }, '✕'),
      ]));
    }
  }

  return el('div', { class: 'meal-card' }, [
    el('div', { class: 'meal-head' }, [
      el('div', { class: 'meal-name' }, mealLabel),
      el('div', { class: 'meal-cals' }, `${fmt(totals.calories)} kcal`),
    ]),
    list,
    el('button', { class: 'add-food-btn', onclick: () => openFoodPicker(dateKeyStr, mealKey) }, '+ Add food'),
  ]);
}

export function renderDiary(container, dateKeyStr) {
  container.innerHTML = '';
  const day = state.getDiaryDay(dateKeyStr);
  const goals = state.getGoals();
  const allEntries = [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks];
  const totals = sumMacros(allEntries);

  const summary = el('div', { class: 'card' }, [
    calorieRow(totals.calories, goals.calories),
    el('div', { style: 'margin-top:16px' }, MACRO_ROWS.map(([key, label, color, emphasize]) =>
      barRow(label, color, totals[key], goals[key], emphasize)
    )),
  ]);

  container.append(summary);
  for (const [key, label] of MEALS) {
    container.append(mealCard(dateKeyStr, key, label, day[key]));
  }
}
