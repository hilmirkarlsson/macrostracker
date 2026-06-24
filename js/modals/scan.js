import { el } from '../dom.js';
import { openModal, closeModal } from '../modal.js';

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'];
// Cross-browser barcode engine for browsers without the native BarcodeDetector
// (iOS Safari, Firefox). Loaded on demand so Chrome/Android stay zero-dependency.
const ZXING_URL = 'https://esm.sh/@zxing/browser@0.1.5';

// Opens a camera (or manual-entry) modal and resolves with the scanned
// barcode string, or null if the user cancels.
export function openBarcodeScanner() {
  return new Promise((resolve) => {
    let stream = null;
    let timer = null;
    let zxingControls = null;
    let done = false;

    function finish(code) {
      if (done) return;
      done = true;
      if (timer) clearInterval(timer);
      if (zxingControls) { try { zxingControls.stop(); } catch (e) { /* ignore */ } }
      if (stream) stream.getTracks().forEach((t) => t.stop());
      closeModal();
      resolve(code || null);
    }

    const manualInput = el('input', { type: 'text', inputmode: 'numeric', placeholder: 'e.g. 5901234123457' });
    const manualBtn = el('button', { type: 'button', class: 'btn btn-secondary', onclick: () => {
      const v = manualInput.value.trim();
      if (v) finish(v);
    } }, 'Look up');
    const manualBox = el('div', { class: 'field', style: 'margin-top:14px' }, [
      el('label', {}, 'Or type the number printed under the barcode'),
      el('div', { class: 'field-row' }, [manualInput, manualBtn]),
    ]);

    const cancelBtn = el('button', { class: 'btn btn-secondary', onclick: () => finish(null) }, 'Cancel');

    const canUseCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;

    if (!canUseCamera) {
      const body = el('div', {}, [
        el('div', { class: 'muted', style: 'margin-bottom:10px' },
          window.isSecureContext === false
            ? 'Camera needs a secure (https) connection. Type the barcode number below instead.'
            : "This browser can't open the camera. Type the barcode number below instead."),
        manualBox,
      ]);
      openModal({ title: 'Enter barcode', body, foot: cancelBtn });
      setTimeout(() => manualInput.focus(), 50);
      return;
    }

    const video = el('video', { autoplay: '', muted: '', playsinline: '', class: 'scan-video' });
    const statusEl = el('div', { class: 'muted', style: 'margin:10px 0' }, 'Point the camera at the barcode…');

    const body = el('div', {}, [
      el('div', { class: 'scan-frame' }, [video, el('div', { class: 'scan-reticle' })]),
      statusEl,
      manualBox,
    ]);

    openModal({ title: 'Scan barcode', body, foot: cancelBtn });

    startCamera();

    async function startCamera() {
      try {
        if ('BarcodeDetector' in window) {
          await startNative();
        } else {
          await startZxing();
        }
      } catch (err) {
        statusEl.textContent = 'Camera unavailable — type the barcode number below instead.';
      }
    }

    async function startNative() {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      if (done) { stream.getTracks().forEach((t) => t.stop()); return; }
      video.srcObject = stream;
      await video.play().catch(() => {});
      let detector;
      try { detector = new window.BarcodeDetector({ formats: FORMATS }); }
      catch (e) { detector = new window.BarcodeDetector(); }
      timer = setInterval(() => {
        detector.detect(video)
          .then((codes) => { if (codes.length > 0) finish(codes[0].rawValue); })
          .catch(() => {});
      }, 300);
    }

    async function startZxing() {
      statusEl.textContent = 'Loading scanner…';
      let mod;
      try {
        mod = await import(/* @vite-ignore */ ZXING_URL);
      } catch (e) {
        statusEl.textContent = 'Live scanning needs a connection — type the number below instead.';
        return;
      }
      if (done) return;
      const reader = new mod.BrowserMultiFormatReader();
      zxingControls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        video,
        (result) => { if (result) finish(result.getText()); },
      );
      if (done) { try { zxingControls.stop(); } catch (e) { /* ignore */ } return; }
      statusEl.textContent = 'Point the camera at the barcode…';
    }
  });
}
