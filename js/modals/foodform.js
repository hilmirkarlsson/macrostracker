import { el } from '../dom.js';
import { openModal, closeModal } from '../modal.js';
import * as state from '../state.js';

const MACRO_FIELDS = [
  ['calories', 'Calories (kcal)'],
  ['protein', 'Protein (g)'],
  ['carbs', 'Carbs (g)'],
  ['sugar', 'Sugar (g)'],
  ['fiber', 'Fiber (g)'],
  ['fat', 'Fat (g)'],
  ['satFat', 'Sat. fat (g)'],
];

export function openFoodForm(existing) {
  let unit = existing?.unit || 'g';

  const nameInput = el('input', { type: 'text', placeholder: 'e.g. Greek yogurt', value: existing?.name || '' });
  const brandInput = el('input', { type: 'text', placeholder: 'Optional', value: existing?.brand || '' });

  const gBtn = el('button', { type: 'button', class: unit === 'g' ? 'active' : '', onclick: () => setUnit('g') }, 'grams (g)');
  const mlBtn = el('button', { type: 'button', class: unit === 'ml' ? 'active' : '', onclick: () => setUnit('ml') }, 'milliliters (ml)');
  function setUnit(u) {
    unit = u;
    gBtn.className = unit === 'g' ? 'active' : '';
    mlBtn.className = unit === 'ml' ? 'active' : '';
  }

  const macroInputs = {};
  const macroGrid = el('div', { class: 'macro-grid' });
  for (const [key, label] of MACRO_FIELDS) {
    const input = el('input', {
      type: 'number', inputmode: 'decimal', min: '0', step: '0.1',
      value: existing ? String(existing.per100[key]) : '',
      placeholder: '0',
    });
    macroInputs[key] = input;
    macroGrid.append(el('div', { class: 'field' }, [el('label', {}, label), input]));
  }

  const errorBox = el('div', { class: 'muted', style: 'color:var(--danger);margin-bottom:10px;display:none' });

  const body = el('div', {}, [
    el('div', { class: 'field' }, [el('label', {}, 'Name'), nameInput]),
    el('div', { class: 'field' }, [el('label', {}, 'Brand'), brandInput]),
    el('div', { class: 'field' }, [
      el('label', {}, 'Logged in'),
      el('div', { class: 'unit-toggle' }, [gBtn, mlBtn]),
    ]),
    el('div', { class: 'field' }, [el('label', {}, `Per 100 ${unit === 'g' ? 'grams' : 'ml'}`)]),
    macroGrid,
    errorBox,
  ]);

  const saveBtn = el('button', { class: 'btn btn-primary', onclick: save }, existing ? 'Save changes' : 'Add food');

  const footChildren = [saveBtn];
  if (existing?.custom) {
    footChildren.unshift(el('button', { class: 'btn btn-danger', style: 'margin-bottom:10px', onclick: () => {
      if (confirm(`Delete "${existing.name}" from your food database?`)) {
        state.deleteFood(existing.id);
        closeModal();
      }
    } }, 'Delete this food'));
  }

  const foot = el('div', {}, footChildren);

  function save() {
    const name = nameInput.value.trim();
    if (!name) {
      errorBox.textContent = 'Name is required.';
      errorBox.style.display = 'block';
      return;
    }
    const per100 = {};
    for (const [key] of MACRO_FIELDS) {
      const v = parseFloat(macroInputs[key].value);
      per100[key] = Number.isFinite(v) && v >= 0 ? v : 0;
    }
    const payload = { name, brand: brandInput.value, unit, per100 };
    if (existing) state.updateFood(existing.id, payload);
    else state.addFood(payload);
    closeModal();
  }

  openModal({ title: existing ? 'Edit food' : 'Add new food', body, foot });
  setTimeout(() => nameInput.focus(), 50);
}
