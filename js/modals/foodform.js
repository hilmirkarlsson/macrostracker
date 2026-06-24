import { el } from '../dom.js';
import { openModal, closeModal } from '../modal.js';
import * as state from '../state.js';
import { openBarcodeScanner } from './scan.js';
import { lookupBarcode } from '../lookup.js';

const MACRO_FIELDS = [
  ['calories', 'Calories (kcal)'],
  ['protein', 'Protein (g)'],
  ['carbs', 'Carbs (g)'],
  ['fat', 'Fat (g)'],
];

const MICRO_FIELDS = [
  ['sugar', 'Sugar (g)'],
  ['fiber', 'Fiber (g)'],
  ['satFat', 'Sat fat (g)'],
];

export function openFoodForm(existing, opts = {}) {
  const prefill = opts.prefill || null;
  let unit = existing?.unit || prefill?.unit || 'g';

  const nameInput = el('input', { type: 'text', placeholder: 'e.g. Greek yogurt', value: existing?.name ?? prefill?.name ?? '' });
  const brandInput = el('input', { type: 'text', placeholder: 'Optional', value: existing?.brand ?? prefill?.brand ?? '' });

  const gBtn = el('button', { type: 'button', class: unit === 'g' ? 'active' : '', onclick: () => setUnit('g') }, 'grams (g)');
  const mlBtn = el('button', { type: 'button', class: unit === 'ml' ? 'active' : '', onclick: () => setUnit('ml') }, 'milliliters (ml)');
  function setUnit(u) {
    unit = u;
    gBtn.className = unit === 'g' ? 'active' : '';
    mlBtn.className = unit === 'ml' ? 'active' : '';
  }

  const macroInputs = {};
  const source = existing ? existing.per100 : prefill?.per100;
  const macroGrid = el('div', { class: 'macro-grid' });
  for (const [key, label] of MACRO_FIELDS) {
    const input = el('input', {
      type: 'number', inputmode: 'decimal', min: '0', step: '0.1',
      value: source ? String(source[key] ?? '') : '',
      placeholder: '0',
    });
    macroInputs[key] = input;
    macroGrid.append(el('div', { class: 'field' }, [el('label', {}, label), input]));
  }

  const microGrid = el('div', { class: 'macro-grid' });
  for (const [key, label] of MICRO_FIELDS) {
    const input = el('input', {
      type: 'number', inputmode: 'decimal', min: '0', step: '0.1',
      value: source && source[key] ? String(source[key]) : '',
      placeholder: '0',
    });
    macroInputs[key] = input;
    microGrid.append(el('div', { class: 'field' }, [el('label', {}, label), input]));
  }

  const errorBox = el('div', { class: 'muted', style: 'color:var(--danger);margin-bottom:10px;display:none' });

  const noticeBox = opts.notice
    ? el('div', { class: 'muted', style: 'margin-bottom:14px' }, opts.notice)
    : null;

  async function startScan() {
    const code = await openBarcodeScanner();
    if (!code) {
      openFoodForm(existing, opts);
      return;
    }
    openModal({ title: 'Looking up…', body: el('div', { class: 'muted' }, `Looking up barcode ${code}…`) });
    try {
      const result = await lookupBarcode(code);
      if (!result) {
        openFoodForm(null, { notice: `No match found for barcode ${code} — fill it in manually below.` });
        return;
      }
      openFoodForm(null, { prefill: result, notice: 'Auto-filled from Open Food Facts — double-check against the label.' });
    } catch (e) {
      openFoodForm(null, { notice: "Couldn't reach the lookup service. Check your connection or fill this in manually." });
    }
  }

  const scanBtn = !existing
    ? el('button', { type: 'button', class: 'btn btn-secondary', style: 'margin-bottom:14px', onclick: startScan }, [
        el('div', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a1 1 0 0 1 1-1h1.5l1-1.5h7l1 1.5H17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><circle cx="12" cy="12.5" r="3.2"/></svg>' }),
        'Scan barcode',
      ])
    : null;

  const body = el('div', {}, [
    scanBtn,
    noticeBox,
    el('div', { class: 'field' }, [el('label', {}, 'Name'), nameInput]),
    el('div', { class: 'field' }, [el('label', {}, 'Brand'), brandInput]),
    el('div', { class: 'field' }, [
      el('label', {}, 'Logged in'),
      el('div', { class: 'unit-toggle' }, [gBtn, mlBtn]),
    ]),
    el('div', { class: 'field' }, [el('label', {}, `Per 100 ${unit === 'g' ? 'grams' : 'ml'}`)]),
    macroGrid,
    el('div', { class: 'field', style: 'margin-top:6px' }, [el('label', {}, 'Optional — sugar, fiber, saturated fat')]),
    microGrid,
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
    for (const [key] of [...MACRO_FIELDS, ...MICRO_FIELDS]) {
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
