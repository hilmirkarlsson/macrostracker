import { el, esc, fmt, fmt1 } from '../dom.js';
import { openModal, closeModal } from '../modal.js';
import * as state from '../state.js';
import { scaleMacros, perUnitLabel, foodAvatar } from '../util.js';

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

export function openFoodPicker(dateKeyStr, meal) {
  renderSearchStep(dateKeyStr, meal, '');
}

function renderSearchStep(dateKeyStr, meal, query) {
  const foods = state.getFoods()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((f) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return f.name.toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q);
    });

  const list = el('div', { class: 'food-pick-list' });
  if (foods.length === 0) {
    list.append(el('div', { class: 'empty-state' }, 'No foods match. Try a different search, or add a new food from the Foods tab.'));
  } else {
    for (const f of foods) {
      const av = foodAvatar(f.name);
      const row = el('div', { class: 'food-list-item', onclick: () => renderQtyStep(dateKeyStr, meal, f, query) }, [
        el('div', { class: 'f-avatar', style: `background:color-mix(in srgb, ${av.color} 20%, transparent);color:${av.color}` }, av.letter),
        el('div', { class: 'f-main' }, [
          el('div', { class: 'f-name', html: `${esc(f.name)}${f.estimated ? '<span class="badge-est">est.</span>' : ''}` }),
          el('div', { class: 'f-brand' }, f.brand ? `${f.brand} · ${perUnitLabel(f.unit)}` : perUnitLabel(f.unit)),
        ]),
        el('div', { class: 'f-cals' }, `${fmt(f.per100.calories)} kcal`),
      ]);
      list.append(row);
    }
  }

  const searchInput = el('input', {
    type: 'text',
    placeholder: 'Search foods…',
    value: query,
    oninput: (e) => renderSearchStep(dateKeyStr, meal, e.target.value),
  });

  const body = el('div', {}, [
    el('div', { class: 'search-box' }, [
      el('div', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' }),
      searchInput,
    ]),
    list,
  ]);

  openModal({ title: `Add to ${MEAL_LABELS[meal]}`, body });
  setTimeout(() => searchInput.focus(), 50);
}

function renderQtyStep(dateKeyStr, meal, food, prevQuery) {
  let qty = food.defaultQty ?? (food.unit === 'piece' ? 1 : 100);

  const preview = el('div', { class: 'preview-box' });
  const renderPreview = () => {
    const m = scaleMacros(food.per100, qty, food.unit);
    preview.innerHTML = '';
    preview.append(
      el('div', { class: 'preview-row main' }, [el('span', {}, 'Calories'), el('span', { class: 'v' }, `${fmt(m.calories)} kcal`)]),
      el('div', { class: 'preview-row' }, [el('span', {}, 'Protein'), el('span', { class: 'v' }, `${fmt1(m.protein)} g`)]),
      el('div', { class: 'preview-row' }, [el('span', {}, 'Carbs'), el('span', { class: 'v' }, `${fmt1(m.carbs)} g`)]),
      el('div', { class: 'preview-row' }, [el('span', {}, 'Fat'), el('span', { class: 'v' }, `${fmt1(m.fat)} g`)]),
    );
  };

  const qtyInput = el('input', {
    type: 'number',
    inputmode: 'decimal',
    min: '0',
    step: '1',
    value: String(qty),
    oninput: (e) => {
      qty = parseFloat(e.target.value) || 0;
      renderPreview();
    },
  });

  renderPreview();

  const body = el('div', {}, [
    el('div', { class: 'field' }, [
      el('label', {}, `${food.name}${food.brand ? ' · ' + food.brand : ''}`),
      el('div', { class: 'field-row' }, [
        el('div', { class: 'field', style: 'flex:2' }, [qtyInput]),
        el('div', { class: 'field', style: 'flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:15px;' }, food.unit),
      ]),
    ]),
    preview,
    el('button', { class: 'btn btn-secondary', style: 'margin-bottom:10px', onclick: () => renderSearchStep(dateKeyStr, meal, prevQuery) }, '← Back to search'),
  ]);

  const foot = el('button', {
    class: 'btn btn-primary',
    onclick: () => {
      if (qty <= 0) return;
      state.addEntry(dateKeyStr, meal, food, qty);
      closeModal();
    },
  }, `Add to ${MEAL_LABELS[meal]}`);

  openModal({ title: 'Quantity', body, foot });
  setTimeout(() => { qtyInput.focus(); qtyInput.select(); }, 50);
}
