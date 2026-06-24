import { el, fmt, fmt1 } from '../dom.js';
import * as state from '../state.js';
import { sumMacros, scaleMacros, clamp } from '../util.js';
import { openFoodPicker } from '../modals/foodpicker.js';

const ICONS = {
  sunrise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18h14M7.5 18a4.5 4.5 0 0 1 9 0M12 10V5M7.4 9.4 5.9 7.9M16.6 9.4l1.5-1.5"/></svg>',
  bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11h17a8 8 0 0 1-15.9 1M3.5 11a8 8 0 0 1 .1-1M12 11V6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.7A8 8 0 1 1 9.3 4a6.5 6.5 0 0 0 10.7 10.7Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4"/></svg>',
};

const EMPTY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8" stroke-dasharray="3 3.5"/></svg>';

const MEAL_META = {
  breakfast: { label: 'Breakfast', color: 'var(--c-calories)', icon: ICONS.sunrise },
  lunch: { label: 'Lunch', color: 'var(--c-carbs)', icon: ICONS.bowl },
  dinner: { label: 'Dinner', color: 'var(--c-fiber)', icon: ICONS.moon },
  snacks: { label: 'Snacks', color: 'var(--c-sugar)', icon: ICONS.spark },
};

const MACRO_ROWS = [
  ['protein', 'Protein', 'var(--c-protein)', true],
  ['carbs', 'Carbs', 'var(--c-carbs)', false],
  ['fat', 'Fat', 'var(--c-fat)', false],
];

function barRow(label, color, consumed, goal, emphasize) {
  const pct = goal > 0 ? clamp((consumed / goal) * 100, 0, 100) : 0;
  const over = consumed > goal;
  return el('div', { class: `bar-row mini ${emphasize ? 'protein-row' : ''}` }, [
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

function calorieRing(consumed, goal) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? clamp((consumed / goal) * 100, 0, 100) : 0;
  const remaining = goal - consumed;
  const over = remaining < 0;
  const targetOffset = over ? 0 : circumference * (1 - pct / 100);
  const strokeStyle = over ? 'stroke:var(--danger)' : 'stroke:url(#ringGrad)';

  const svgHtml = `<svg viewBox="0 0 120 120">
    <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:var(--accent)"/>
      <stop offset="100%" style="stop-color:var(--accent-2)"/>
    </linearGradient></defs>
    <circle class="ring-track" cx="60" cy="60" r="${r}"/>
    <circle class="ring-progress" cx="60" cy="60" r="${r}" style="${strokeStyle}" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"/>
  </svg>`;

  const wrap = el('div', { class: 'cal-ring' }, [
    el('div', { html: svgHtml }),
    el('div', { class: 'ring-center' }, [
      el('div', { class: `ring-num ${over ? 'over' : ''}` }, over ? `+${fmt(Math.abs(remaining))}` : fmt(remaining)),
      el('div', { class: 'ring-label' }, over ? 'kcal over' : 'kcal left'),
    ]),
  ]);

  const progressCircle = wrap.querySelector('.ring-progress');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progressCircle.style.strokeDashoffset = String(targetOffset);
    });
  });

  return wrap;
}

function mealCard(dateKeyStr, mealKey, meta, entries, index) {
  const totals = sumMacros(entries);
  const list = el('div', { class: 'entry-list' });
  if (entries.length === 0) {
    list.append(el('div', { class: 'empty-state' }, [el('div', { html: EMPTY_ICON }), 'Nothing logged yet.']));
  } else {
    for (const entry of entries) {
      const m = scaleMacros(entry.per100, entry.qty, entry.unit);
      list.append(el('div', { class: 'entry-row' }, [
        el('div', { class: 'entry-main' }, [
          el('div', { class: 'entry-name' }, entry.name),
          el('div', { class: 'entry-qty' }, `${fmt1(entry.qty)} ${entry.unit} · P ${fmt1(m.protein)} C ${fmt1(m.carbs)} F ${fmt1(m.fat)}`),
        ]),
        el('div', { class: 'entry-cals' }, `${fmt(m.calories)} kcal`),
        el('button', { class: 'entry-del', 'aria-label': `Remove ${entry.name}`, onclick: () => state.removeEntry(dateKeyStr, mealKey, entry.id) }, '✕'),
      ]));
    }
  }

  return el('div', { class: 'meal-card', style: `--i:${index}` }, [
    el('div', { class: 'meal-head' }, [
      el('div', { class: 'meal-title' }, [
        el('div', { class: 'meal-icon', style: `--mc:${meta.color}` }, [el('div', { html: meta.icon })]),
        el('div', { class: 'meal-name' }, meta.label),
      ]),
      el('div', { class: 'meal-cals' }, `${fmt(totals.calories)} kcal`),
    ]),
    list,
    el('button', { class: 'add-food-btn', onclick: () => openFoodPicker(dateKeyStr, mealKey) }, '+ Add food'),
  ]);
}

export function renderDiary(container, dateKeyStr) {
  container.innerHTML = '';
  const day = state.getDiaryDay(dateKeyStr);
  const goals = state.getGoals(dateKeyStr);
  const allEntries = [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks];
  const totals = sumMacros(allEntries);

  const heroTop = el('div', { class: 'cal-hero-top' }, [
    calorieRing(totals.calories, goals.calories),
    el('div', { class: 'cal-hero-stats' }, MACRO_ROWS.map(([key, label, color, emphasize]) =>
      barRow(label, color, totals[key], goals[key], emphasize)
    )),
  ]);
  const exactRow = el('div', { class: 'cal-exact' }, [
    el('span', {}, ['Consumed ', el('b', {}, `${fmt(totals.calories)} kcal`)]),
    el('span', {}, ['Goal ', el('b', {}, `${fmt(goals.calories)} kcal`)]),
  ]);

  container.append(el('div', { class: 'card' }, [heroTop, exactRow]));

  let i = 0;
  for (const [key, meta] of Object.entries(MEAL_META)) {
    container.append(mealCard(dateKeyStr, key, meta, day[key], i++));
  }
}
