import { el, esc, fmt } from '../dom.js';
import * as state from '../state.js';
import { openFoodForm } from '../modals/foodform.js';

export function renderFoods(container) {
  let query = '';

  function draw() {
    container.innerHTML = '';

    const searchInput = el('input', {
      type: 'text',
      placeholder: 'Search your food database…',
      value: query,
      oninput: (e) => { query = e.target.value; drawList(); },
    });

    const searchBox = el('div', { class: 'search-box' }, [
      el('div', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' }),
      searchInput,
    ]);

    const listCard = el('div', { class: 'card' });
    const list = el('div', {});
    listCard.append(list);

    function drawList() {
      list.innerHTML = '';
      const foods = state.getFoods()
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((f) => {
          if (!query) return true;
          const q = query.toLowerCase();
          return f.name.toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q);
        });

      if (foods.length === 0) {
        list.append(el('div', { class: 'empty-state' }, 'No foods found.'));
        return;
      }
      for (const f of foods) {
        list.append(el('div', { class: 'food-list-item', onclick: () => openFoodForm(f) }, [
          el('div', { class: 'f-main' }, [
            el('div', { class: 'f-name', html: `${esc(f.name)}${f.estimated ? '<span class="badge-est">est.</span>' : ''}` }),
            el('div', { class: 'f-brand' }, f.brand ? `${f.brand} · per 100${f.unit}` : `per 100${f.unit}${f.custom ? ' · custom' : ''}`),
          ]),
          el('div', { class: 'f-cals' }, `${fmt(f.per100.calories)} kcal`),
        ]));
      }
    }

    drawList();

    container.append(
      el('div', { style: 'margin-bottom:4px' }, searchBox),
      listCard,
      el('button', { class: 'fab', onclick: () => openFoodForm(null) }, '+'),
    );
  }

  draw();
}
