import { el } from '../dom.js';
import * as state from '../state.js';

const FIELDS = [
  ['calories', 'Calories (kcal)'],
  ['protein', 'Protein (g)'],
  ['carbs', 'Carbs (g)'],
  ['fat', 'Fat (g)'],
];

export function renderGoals(container) {
  container.innerHTML = '';
  const goals = state.getGoals();
  const inputs = {};

  const proteinInput = el('input', {
    type: 'number', inputmode: 'decimal', min: '0', step: '1',
    value: String(goals.protein),
    style: 'font-size:22px;font-weight:700;color:var(--c-protein)',
  });
  inputs.protein = proteinInput;

  const proteinCard = el('div', { class: 'card' }, [
    el('h2', {}, 'Daily protein target'),
    el('div', { class: 'field' }, [proteinInput]),
    el('div', { class: 'muted' }, 'Tracked closely — shown as the bold bar on your diary.'),
  ]);

  const otherGrid = el('div', { class: 'macro-grid' });
  for (const [key, label] of FIELDS) {
    if (key === 'protein') continue;
    const input = el('input', {
      type: 'number', inputmode: 'decimal', min: '0', step: '1',
      value: String(goals[key]),
    });
    inputs[key] = input;
    otherGrid.append(el('div', { class: 'field' }, [el('label', {}, label), input]));
  }

  const otherCard = el('div', { class: 'card' }, [
    el('h2', {}, 'Other daily targets'),
    otherGrid,
  ]);

  const savedNote = el('div', { class: 'muted', style: 'text-align:center;display:none' }, 'Saved.');

  const saveBtn = el('button', {
    class: 'btn btn-primary',
    onclick: () => {
      const next = {};
      for (const [key] of FIELDS) {
        const v = parseFloat(inputs[key].value);
        next[key] = Number.isFinite(v) && v >= 0 ? v : 0;
      }
      state.updateGoals(next);
      savedNote.style.display = 'block';
      setTimeout(() => { savedNote.style.display = 'none'; }, 1500);
    },
  }, 'Save goals');

  container.append(proteinCard, otherCard, saveBtn, el('div', { style: 'height:10px' }), savedNote);
}
