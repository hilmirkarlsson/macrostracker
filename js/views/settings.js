import { el } from '../dom.js';
import * as state from '../state.js';
import * as storage from '../storage.js';
import { todayKey } from '../util.js';

export function renderSettings(container) {
  container.innerHTML = '';

  const status = el('div', { class: 'muted', style: 'margin-top:8px;display:none' });
  function flash(msg, isError) {
    status.textContent = msg;
    status.style.color = isError ? 'var(--danger)' : 'var(--c-protein)';
    status.style.display = 'block';
    setTimeout(() => { status.style.display = 'none'; }, 2500);
  }

  const fileInput = el('input', { type: 'file', accept: 'application/json', style: 'display:none' });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = storage.importJSON(text);
      state.replaceState(parsed);
      flash('Data imported successfully.');
    } catch (err) {
      flash(err.message || 'Could not import that file.', true);
    }
    fileInput.value = '';
  });

  const backupCard = el('div', { class: 'card settings-section' }, [
    el('h2', {}, 'Backup & restore'),
    el('div', { class: 'muted', style: 'margin-bottom:12px' },
      'Everything is stored locally in this browser. Export a backup occasionally, or before switching devices/browsers — the exported file is the same JSON shape a future cloud sync (e.g. Google Drive) would use.'),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn btn-secondary', onclick: () => {
        const data = storage.exportJSON(state.getState());
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = el('a', { href: url, download: `macros-backup-${todayKey()}.json` });
        document.body.append(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } }, 'Export JSON'),
      el('button', { class: 'btn btn-secondary', onclick: () => fileInput.click() }, 'Import JSON'),
    ]),
    fileInput,
    status,
  ]);

  const aboutCard = el('div', { class: 'card settings-section' }, [
    el('h2', {}, 'About'),
    el('div', { class: 'muted' }, [
      'Local-first food diary — your data never leaves this device unless you export it. ',
      'On your phone, use your browser’s "Add to Home Screen" option to install this as an app.',
    ]),
  ]);

  container.append(backupCard, aboutCard);
}
