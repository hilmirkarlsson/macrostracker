import { el } from './dom.js';
import * as state from './state.js';
import { todayKey, addDays, formatDisplayDate } from './util.js';
import { renderDiary } from './views/diary.js';
import { renderFoods } from './views/foods.js';
import { renderGoals } from './views/goals.js';
import { renderStats } from './views/stats.js';
import { renderSettings } from './views/settings.js';

const topbar = document.getElementById('topbar');
const view = document.getElementById('view');
const tabbar = document.getElementById('tabbar');
const tabButtons = document.querySelectorAll('.tab-btn');
const TAB_ORDER = Array.from(tabButtons).map((btn) => btn.dataset.tab);
tabbar.style.setProperty('--tab-count', String(TAB_ORDER.length));

const ctx = {
  tab: 'diary',
  dateKey: todayKey(),
};

const TAB_TITLES = { foods: 'Food database', goals: 'Daily goals', stats: 'Progress', settings: 'Settings' };

function renderTopbar() {
  topbar.innerHTML = '';
  if (ctx.tab === 'diary') {
    const isToday = ctx.dateKey === todayKey();
    topbar.append(el('div', { class: 'date-nav' }, [
      el('button', { class: 'icon-btn', onclick: () => { ctx.dateKey = addDays(ctx.dateKey, -1); render(); } },
        el('div', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>' })),
      el('div', { style: 'text-align:center' }, [
        el('div', { class: 'date-label' }, formatDisplayDate(ctx.dateKey)),
        !isToday ? el('button', { class: 'date-jump', onclick: () => { ctx.dateKey = todayKey(); render(); } }, 'Jump to today') : null,
      ]),
      el('button', { class: 'icon-btn', onclick: () => { ctx.dateKey = addDays(ctx.dateKey, 1); render(); } },
        el('div', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' })),
    ]));
  } else {
    topbar.append(el('h1', {}, TAB_TITLES[ctx.tab] || ''));
  }
}

function renderView() {
  view.innerHTML = '';
  if (ctx.tab === 'diary') renderDiary(view, ctx.dateKey);
  else if (ctx.tab === 'foods') renderFoods(view);
  else if (ctx.tab === 'goals') renderGoals(view);
  else if (ctx.tab === 'stats') renderStats(view);
  else if (ctx.tab === 'settings') renderSettings(view);
}

function renderTabbar() {
  tabButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === ctx.tab);
  });
  tabbar.style.setProperty('--active-index', String(TAB_ORDER.indexOf(ctx.tab)));
}

function render() {
  renderTopbar();
  renderView();
  renderTabbar();
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    ctx.tab = btn.dataset.tab;
    render();
  });
});

state.subscribe(render);

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
