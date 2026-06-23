import { el } from '../dom.js';
import { openModal, closeModal } from '../modal.js';

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

// Opens a camera (or manual-entry) modal and resolves with the scanned
// barcode string, or null if the user cancels.
export function openBarcodeScanner() {
  return new Promise((resolve) => {
    let stream = null;
    let timer = null;
    let done = false;

    function finish(code) {
      if (done) return;
      done = true;
      if (timer) clearInterval(timer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      closeModal();
      resolve(code || null);
    }

    const manualInput = el('input', { type: 'text', inputmode: 'numeric', placeholder: 'e.g. 5901234123457' });
    const manualBtn = el('button', { type: 'button', class: 'btn btn-secondary', onclick: () => {
      const v = manualInput.value.trim();
      if (v) finish(v);
    } });
    const manualBox = el('div', { class: 'field', style: 'margin-top:14px' }, [
      el('label', {}, 'Or type the number printed under the barcode'),
      el('div', { class: 'field-row' }, [manualInput, manualBtn]),
    ]);
    manualBtn.textContent = 'Look up';

    const cancelBtn = el('button', { class: 'btn btn-secondary', onclick: () => finish(null) }, 'Cancel');

    if (!('BarcodeDetector' in window)) {
      const body = el('div', {}, [
        el('div', { class: 'muted', style: 'margin-bottom:10px' }, "Live camera scanning isn't supported in this browser."),
        manualBox,
      ]);
      openModal({ title: 'Enter barcode', body, foot: cancelBtn });
      setTimeout(() => manualInput.focus(), 50);
      return;
    }

    const video = el('video', { autoplay: '', muted: '', playsinline: '', class: 'scan-video' });
    const statusEl = el('div', { class: 'muted', style: 'margin:10px 0' }, 'Point the camera at the barcode…');

    const body = el('div', {}, [
      el('div', { class: 'scan-frame' }, [video]),
      statusEl,
      manualBox,
    ]);

    openModal({ title: 'Scan barcode', body, foot: cancelBtn });

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (done) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        video.srcObject = s;
        const detector = new window.BarcodeDetector({ formats: FORMATS });
        timer = setInterval(() => {
          detector.detect(video)
            .then((codes) => { if (codes.length > 0) finish(codes[0].rawValue); })
            .catch(() => {});
        }, 350);
      })
      .catch(() => {
        statusEl.textContent = 'Camera unavailable — type the barcode number below instead.';
      });
  });
}
