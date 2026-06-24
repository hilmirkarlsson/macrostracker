import { el, fmt, fmt1 } from '../dom.js';
import * as state from '../state.js';
import { openModal, closeModal } from '../modal.js';
import { sumMacros, lastNDays, shortDayLabel, todayKey, clamp } from '../util.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

const flameIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5C9 10 9.5 11 11 11c-.5-2 .3-5 1-8Z"/></svg>';
const scaleIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 8h6M12 8l-2.5 4.5a2.5 2.5 0 0 0 5 0Z"/></svg>';
const chartIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16M8 16l3.5-4 3 2.5L20 8"/></svg>';

// ---------- logging streak ----------
function isLogged(dateKeyStr) {
  const d = state.getDiaryDay(dateKeyStr);
  return d.breakfast.length + d.lunch.length + d.dinner.length + d.snacks.length > 0;
}

function currentStreak() {
  const today = todayKey();
  // Don't penalise a not-yet-logged today: start counting from yesterday in that case.
  let cursor = isLogged(today) ? today : addKey(today, -1);
  let streak = 0;
  while (isLogged(cursor)) {
    streak++;
    cursor = addKey(cursor, -1);
    if (streak > 3650) break;
  }
  return streak;
}

function addKey(dateKeyStr, delta) {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// ---------- weekly calorie bar chart ----------
function weeklyCard() {
  const days = lastNDays(todayKey(), 7);
  const rows = days.map((dk) => {
    const day = state.getDiaryDay(dk);
    const totals = sumMacros([...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks]);
    const goals = state.getGoals(dk);
    const logged = day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length > 0;
    return { dk, cal: totals.calories, protein: totals.protein, goal: goals.calories, proteinGoal: goals.protein, logged };
  });

  const loggedRows = rows.filter((r) => r.logged);
  const avgCal = loggedRows.length ? loggedRows.reduce((s, r) => s + r.cal, 0) / loggedRows.length : 0;
  const proteinHits = loggedRows.filter((r) => r.protein >= r.proteinGoal && r.proteinGoal > 0).length;
  const goalRef = rows.find((r) => r.goal > 0)?.goal || 2000;
  const maxVal = Math.max(goalRef, ...rows.map((r) => r.cal), 1) * 1.1;

  const W = 320, H = 132, padB = 22, padT = 8;
  const plotH = H - padB - padT;
  const slot = W / 7;
  const barW = slot * 0.52;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'bar-chart', preserveAspectRatio: 'none' });

  // goal reference line
  const goalY = padT + plotH * (1 - clamp(goalRef / maxVal, 0, 1));
  svg.append(svgEl('line', { x1: 0, x2: W, y1: goalY, y2: goalY, class: 'chart-goal-line' }));

  rows.forEach((r, i) => {
    const cx = slot * i + slot / 2;
    const h = r.cal > 0 ? plotH * clamp(r.cal / maxVal, 0, 1) : 0;
    const y = padT + plotH - h;
    const over = r.goal > 0 && r.cal > r.goal;
    const rect = svgEl('rect', {
      x: cx - barW / 2, y: h > 0 ? y : padT + plotH - 1, width: barW, height: Math.max(h, r.cal > 0 ? 2 : 0),
      rx: 4, class: `chart-bar ${over ? 'over' : ''} ${r.logged ? '' : 'empty'}`,
    });
    svg.append(rect);
    const label = svgEl('text', { x: cx, y: H - 7, class: 'chart-x-label', 'text-anchor': 'middle' });
    label.textContent = shortDayLabel(r.dk).charAt(0);
    svg.append(label);
  });

  const head = el('div', { class: 'section-title' }, [
    el('div', { class: 'icon-chip', style: '--mc:var(--c-calories)' }, [el('div', { html: chartIcon })]),
    el('h2', {}, 'This week'),
  ]);

  const statRow = el('div', { class: 'stat-pills' }, [
    statPill(loggedRows.length ? fmt(avgCal) : '—', 'avg kcal/day', 'var(--c-calories)'),
    statPill(`${proteinHits}/${loggedRows.length || 0}`, 'protein goal days', 'var(--c-protein)'),
    statPill(`${loggedRows.length}/7`, 'days logged', 'var(--c-carbs)'),
  ]);

  return el('div', { class: 'card' }, [head, statRow, el('div', { class: 'chart-wrap' }, [svg])]);
}

function statPill(big, label, color) {
  return el('div', { class: 'stat-pill' }, [
    el('div', { class: 'stat-big', style: `color:${color}` }, big),
    el('div', { class: 'stat-label' }, label),
  ]);
}

// ---------- weight trend line chart ----------
function weightCard() {
  const weights = state.getWeights();
  const keys = Object.keys(weights).sort();
  const points = keys.map((k) => ({ dk: k, kg: weights[k] }));
  const profile = state.getProfile();
  const goalKg = profile.goalWeightKg > 0 ? profile.goalWeightKg : null;

  const head = el('div', { class: 'section-title', style: 'justify-content:space-between' }, [
    el('div', { style: 'display:flex;align-items:center;gap:11px' }, [
      el('div', { class: 'icon-chip', style: '--mc:var(--c-fiber)' }, [el('div', { html: scaleIcon })]),
      el('h2', {}, 'Weight'),
    ]),
    el('button', { class: 'chip-btn', onclick: openWeightModal }, '+ Log'),
  ]);

  if (points.length === 0) {
    return el('div', { class: 'card' }, [
      head,
      el('div', { class: 'empty-state' }, [
        el('div', { html: scaleIcon }),
        'No weigh-ins yet. Tap “+ Log” to record your weight and start a trend.',
      ]),
    ]);
  }

  const latest = points[points.length - 1];
  const first = points[0];
  const change = latest.kg - first.kg;
  const changeColor = change <= 0 ? 'var(--c-protein)' : 'var(--c-calories)';

  const headline = el('div', { class: 'weight-headline' }, [
    el('div', {}, [
      el('span', { class: 'weight-big' }, fmt1(latest.kg)),
      el('span', { class: 'weight-unit' }, ' kg'),
    ]),
    el('div', { class: 'weight-meta' }, [
      points.length > 1
        ? el('span', { style: `color:${changeColor};font-weight:700` }, `${change > 0 ? '+' : ''}${fmt1(change)} kg`)
        : el('span', { class: 'muted' }, 'first weigh-in'),
      goalKg ? el('span', { class: 'muted' }, `goal ${fmt1(goalKg)} kg`) : null,
    ]),
  ]);

  const card = el('div', { class: 'card' }, [head, headline]);

  if (points.length >= 2) {
    card.append(el('div', { class: 'chart-wrap' }, [lineChart(points, goalKg)]));
  }

  // recent list (latest 4), each removable
  const recent = points.slice(-4).reverse();
  const list = el('div', { class: 'weight-list' });
  for (const p of recent) {
    list.append(el('div', { class: 'weight-row' }, [
      el('span', { class: 'wr-date' }, formatShort(p.dk)),
      el('span', { class: 'wr-kg' }, `${fmt1(p.kg)} kg`),
      el('button', { class: 'entry-del', 'aria-label': 'Remove weigh-in', onclick: () => state.removeWeight(p.dk) }, '✕'),
    ]));
  }
  card.append(list);
  return card;
}

function formatShort(dateKeyStr) {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function lineChart(points, goalKg) {
  const W = 320, H = 130, padX = 10, padT = 12, padB = 14;
  const plotW = W - padX * 2;
  const plotH = H - padT - padB;

  const kgs = points.map((p) => p.kg);
  if (goalKg) kgs.push(goalKg);
  let min = Math.min(...kgs), max = Math.max(...kgs);
  if (max - min < 1) { min -= 0.5; max += 0.5; }
  const pad = (max - min) * 0.15;
  min -= pad; max += pad;

  const x = (i) => padX + (points.length === 1 ? plotW / 2 : (plotW * i) / (points.length - 1));
  const y = (kg) => padT + plotH * (1 - (kg - min) / (max - min));

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'line-chart', preserveAspectRatio: 'none' });

  if (goalKg) {
    const gy = y(goalKg);
    svg.append(svgEl('line', { x1: 0, x2: W, y1: gy, y2: gy, class: 'chart-goal-line' }));
  }

  const linePts = points.map((p, i) => `${x(i)},${y(p.kg)}`).join(' ');
  // area fill under the line
  const areaD = `M ${x(0)},${padT + plotH} L ` + points.map((p, i) => `${x(i)},${y(p.kg)}`).join(' L ') + ` L ${x(points.length - 1)},${padT + plotH} Z`;
  svg.append(svgEl('path', { d: areaD, class: 'line-area' }));
  svg.append(svgEl('polyline', { points: linePts, class: 'line-stroke' }));

  points.forEach((p, i) => {
    svg.append(svgEl('circle', { cx: x(i), cy: y(p.kg), r: 3.2, class: 'line-dot' }));
  });

  return svg;
}

// ---------- streak banner ----------
function streakBanner() {
  const streak = currentStreak();
  if (streak <= 0) {
    return el('div', { class: 'streak-banner muted-banner' }, [
      el('div', { class: 'icon-chip', style: '--mc:var(--text-faint)' }, [el('div', { html: flameIcon })]),
      el('div', {}, [
        el('div', { class: 'streak-num' }, 'Start a streak'),
        el('div', { class: 'streak-sub' }, 'Log any food today to begin.'),
      ]),
    ]);
  }
  return el('div', { class: 'streak-banner' }, [
    el('div', { class: 'streak-flame', html: flameIcon }),
    el('div', {}, [
      el('div', { class: 'streak-num' }, `${streak} day${streak === 1 ? '' : 's'}`),
      el('div', { class: 'streak-sub' }, 'logging streak — keep it going'),
    ]),
  ]);
}

// ---------- weight log modal ----------
function openWeightModal() {
  const weights = state.getWeights();
  const keys = Object.keys(weights).sort();
  const lastKg = keys.length ? weights[keys[keys.length - 1]] : (state.getProfile().weightKg || '');

  const dateInput = el('input', { type: 'date', value: todayKey() });
  const kgInput = el('input', { type: 'number', inputmode: 'decimal', min: '0', step: '0.1', value: lastKg ? String(lastKg) : '', placeholder: 'e.g. 78.5' });
  const err = el('div', { class: 'muted', style: 'color:var(--danger);display:none;margin-bottom:10px' });

  const body = el('div', {}, [
    el('div', { class: 'field' }, [el('label', {}, 'Date'), dateInput]),
    el('div', { class: 'field' }, [el('label', {}, 'Weight (kg)'), kgInput]),
    err,
  ]);

  const save = () => {
    const kg = parseFloat(kgInput.value);
    if (!Number.isFinite(kg) || kg <= 0) {
      err.textContent = 'Enter a valid weight.';
      err.style.display = 'block';
      return;
    }
    state.setWeight(dateInput.value || todayKey(), Math.round(kg * 10) / 10);
    closeModal();
  };

  const foot = el('button', { class: 'btn btn-primary', onclick: save }, 'Save weigh-in');
  openModal({ title: 'Log weight', body, foot });
  setTimeout(() => { kgInput.focus(); kgInput.select(); }, 50);
}

export function renderStats(container) {
  container.innerHTML = '';
  container.append(streakBanner(), weightCard(), weeklyCard());
}
