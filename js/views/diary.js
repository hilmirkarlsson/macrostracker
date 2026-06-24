import { el, fmt, fmt1, toast } from '../dom.js';
import * as state from '../state.js';
import { sumMacros, scaleMacros, clamp, WATER_GOAL_CUPS, WATER_CUP_ML } from '../util.js';
import { openFoodPicker } from '../modals/foodpicker.js';

const ICONS = {
  sunrise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18h14M7.5 18a4.5 4.5 0 0 1 9 0M12 10V5M7.4 9.4 5.9 7.9M16.6 9.4l1.5-1.5"/></svg>',
  bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11h17a8 8 0 0 1-15.9 1M3.5 11a8 8 0 0 1 .1-1M12 11V6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.7A8 8 0 1 1 9.3 4a6.5 6.5 0 0 0 10.7 10.7Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4"/></svg>',
  drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3 3.6 6 6.8 6 10.2a6 6 0 0 1-12 0c0-3.4 3-6.6 6-10.2Z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
};

const EMPTY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8" stroke-dasharray="3 3.5"/></svg>';

const MEAL_META = {
  breakfast: { label: 'Breakfast', color: 'var(--c-calories)', icon: ICONS.sunrise },
  lunch: { label: 'Lunch', color: 'var(--c-carbs)', icon: ICONS.bowl },
  dinner: { label: 'Dinner', color: 'var(--c-fiber)', icon: ICONS.moon },
  snacks: { label: 'Snacks', color: 'var(--c-sugar)', icon: ICONS.spark },
};

const MACRO_ROWS = [
  ['protein', 'Protein', 'var(--c-protein)', 4],
  ['carbs', 'Carbs', 'var(--c-carbs)', 4],
  ['fat', 'Fat', 'var(--c-fat)', 9],
];

// Persisted across re-renders within a session: grams vs % of calories.
let macroMode = 'g';

function barRowGrams(label, color, consumed, goal) {
  const pct = goal > 0 ? clamp((consumed / goal) * 100, 0, 100) : 0;
  const over = consumed > goal;
  return el('div', { class: 'bar-row mini' }, [
    el('div', { class: 'bar-label' }, [
      el('span', { class: 'name' }, [el('span', { class: 'dot', style: `background:${color}` }), label]),
      el('span', { class: 'vals' }, `${fmt1(consumed)} / ${fmt1(goal)} g`),
    ]),
    el('div', { class: 'bar-track' }, [
      el('div', { class: 'bar-fill', style: `width:${pct}%;background:${over ? 'var(--danger)' : color}` }),
    ]),
  ]);
}

function barRowPercent(label, color, share) {
  return el('div', { class: 'bar-row mini' }, [
    el('div', { class: 'bar-label' }, [
      el('span', { class: 'name' }, [el('span', { class: 'dot', style: `background:${color}` }), label]),
      el('span', { class: 'vals' }, `${Math.round(share)}%`),
    ]),
    el('div', { class: 'bar-track' }, [
      el('div', { class: 'bar-fill', style: `width:${clamp(share, 0, 100)}%;background:${color}` }),
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

function summaryCard(container, dateKeyStr, totals, goals) {
  const toggle = el('div', { class: 'macro-toggle' }, [
    el('button', { class: macroMode === 'g' ? 'active' : '', onclick: () => switchMode('g', container, dateKeyStr) }, 'grams'),
    el('button', { class: macroMode === '%' ? 'active' : '', onclick: () => switchMode('%', container, dateKeyStr) }, '%'),
  ]);

  let macroRows;
  if (macroMode === 'g') {
    macroRows = MACRO_ROWS.map(([key, label, color]) => barRowGrams(label, color, totals[key], goals[key]));
  } else {
    const calFromMacros = MACRO_ROWS.reduce((s, [key, , , kcal]) => s + totals[key] * kcal, 0) || 1;
    macroRows = MACRO_ROWS.map(([key, label, color, kcal]) => barRowPercent(label, color, (totals[key] * kcal / calFromMacros) * 100));
  }

  const microLine = el('div', { class: 'micro-line' }, [
    microItem('Sugar', totals.sugar),
    microItem('Fiber', totals.fiber),
    microItem('Sat fat', totals.satFat),
  ]);

  return el('div', { class: 'card' }, [
    el('div', { class: 'cal-hero-top' }, [
      calorieRing(totals.calories, goals.calories),
      el('div', { class: 'cal-hero-stats' }, [
        el('div', { class: 'hero-stats-head' }, [el('span', { class: 'hero-stats-title' }, 'Macros'), toggle]),
        ...macroRows,
      ]),
    ]),
    microLine,
    el('div', { class: 'cal-exact' }, [
      el('span', {}, ['Consumed ', el('b', {}, `${fmt(totals.calories)} kcal`)]),
      el('span', {}, ['Goal ', el('b', {}, `${fmt(goals.calories)} kcal`)]),
    ]),
  ]);
}

function microItem(label, grams) {
  return el('span', { class: 'micro-item' }, [`${label} `, el('b', {}, `${fmt1(grams)}g`)]);
}

function switchMode(mode, container, dateKeyStr) {
  if (macroMode === mode) return;
  macroMode = mode;
  const day = state.getDiaryDay(dateKeyStr);
  const totals = sumMacros([...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks]);
  const goals = state.getGoals(dateKeyStr);
  const fresh = summaryCard(container, dateKeyStr, totals, goals);
  const old = container.querySelector('.card');
  if (old) old.replaceWith(fresh);
}

function waterCard(dateKeyStr) {
  const cups = state.getWater(dateKeyStr);
  const pips = el('div', { class: 'water-pips' });
  for (let i = 0; i < WATER_GOAL_CUPS; i++) {
    const filled = i < cups;
    pips.append(el('button', {
      class: `water-pip ${filled ? 'filled' : ''}`,
      'aria-label': `Set water to ${i + 1} cups`,
      html: ICONS.drop,
      // Tapping the last filled pip decrements; otherwise set to that level.
      onclick: () => state.setWater(dateKeyStr, cups === i + 1 ? i : i + 1),
    }));
  }
  return el('div', { class: 'card water-card' }, [
    el('div', { class: 'water-head' }, [
      el('div', { class: 'section-title', style: 'margin:0' }, [
        el('div', { class: 'icon-chip', style: '--mc:var(--c-carbs)' }, [el('div', { html: ICONS.drop })]),
        el('h2', {}, 'Water'),
      ]),
      el('div', { class: 'water-count' }, `${cups} / ${WATER_GOAL_CUPS} · ${(cups * WATER_CUP_ML / 1000).toFixed(2)} L`),
    ]),
    pips,
  ]);
}

function mealCard(dateKeyStr, mealKey, meta, entries, index) {
  const totals = sumMacros(entries);
  const list = el('div', { class: 'entry-list' });
  if (entries.length === 0) {
    list.append(el('div', { class: 'empty-state' }, [el('div', { html: EMPTY_ICON }), 'Nothing logged yet.']));
  } else {
    for (const entry of entries) {
      const m = scaleMacros(entry.per100, entry.qty, entry.unit);
      const detail = entry.quick
        ? `Quick add · P ${fmt1(m.protein)} C ${fmt1(m.carbs)} F ${fmt1(m.fat)}`
        : `${fmt1(entry.qty)} ${entry.unit} · P ${fmt1(m.protein)} C ${fmt1(m.carbs)} F ${fmt1(m.fat)}`;
      list.append(el('div', { class: 'entry-row' }, [
        el('div', { class: 'entry-main' }, [
          el('div', { class: 'entry-name' }, entry.name),
          el('div', { class: 'entry-qty' }, detail),
        ]),
        el('div', { class: 'entry-cals' }, `${fmt(m.calories)} kcal`),
        el('button', { class: 'entry-del', 'aria-label': `Remove ${entry.name}`, onclick: () => state.removeEntry(dateKeyStr, mealKey, entry.id) }, '✕'),
      ]));
    }
  }

  const actions = [el('button', { class: 'add-food-btn', onclick: () => openFoodPicker(dateKeyStr, mealKey) }, '+ Add food')];
  if (entries.length === 0) {
    actions.push(el('button', {
      class: 'copy-btn',
      html: `${ICONS.copy}<span>Copy yesterday</span>`,
      onclick: () => {
        const n = state.copyMealFromPrevious(dateKeyStr, mealKey);
        toast(n > 0 ? `Copied ${n} item${n === 1 ? '' : 's'} from a previous day` : `No earlier ${meta.label.toLowerCase()} to copy`);
      },
    }));
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
    el('div', { class: 'meal-actions' }, actions),
  ]);
}

export function renderDiary(container, dateKeyStr) {
  container.innerHTML = '';
  const day = state.getDiaryDay(dateKeyStr);
  const goals = state.getGoals(dateKeyStr);
  const allEntries = [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks];
  const totals = sumMacros(allEntries);

  container.append(summaryCard(container, dateKeyStr, totals, goals));

  let i = 0;
  for (const [key, meta] of Object.entries(MEAL_META)) {
    container.append(mealCard(dateKeyStr, key, meta, day[key], i++));
  }

  container.append(waterCard(dateKeyStr));
}
