/**
 * Keyboard-wedge adapter for REAL USB / Bluetooth barcode scanners.
 *
 * Such scanners emulate a keyboard: they "type" the barcode characters in a very fast
 * burst and finish with Enter (or Tab). This adapter collects rapid keystrokes and
 * emits the collected value into the ScannerService, so a physical scanner works
 * through the exact same path as the test panel.
 */
const DEFAULT_OPTIONS = {
  minLength: 4,
  maxKeyIntervalMs: 80,
  terminatorKeys: ['Enter', 'Tab'],
  flushTimeoutMs: 300,
  ignoreInputs: true, // don't capture while a text field is focused (e.g. the test barcode input)
};

const isEditableTarget = (target) => {
  if (!target || !target.tagName) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable === true;
};

export function createKeyboardWedgeAdapter(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let service = null;
  let buffer = '';
  let lastKeyAt = 0;
  let flushTimer = null;

  const clearFlushTimer = () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  };

  const reset = () => {
    buffer = '';
    lastKeyAt = 0;
    clearFlushTimer();
  };

  const flush = () => {
    const value = buffer;
    reset();
    if (service && value.length >= config.minLength) {
      console.log('[scanner] keyboard-wedge input:', value);
      service.emit(value, { source: 'keyboard-wedge', raw: value });
    }
  };

  const onKeyDown = (event) => {
    if (!service) return;
    if (event.defaultPrevented) return;
    if (config.ignoreInputs && isEditableTarget(event.target)) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const now = Date.now();

    if (config.terminatorKeys.includes(event.key)) {
      const burstCaptured = buffer.length > 0 && now - lastKeyAt <= config.maxKeyIntervalMs;
      if (burstCaptured) {
        // A scanner burst just ended: never let its Enter/Tab activate a focused button
        event.preventDefault();
      }
      if (buffer.length >= config.minLength) {
        flush();
      } else {
        reset();
      }
      return;
    }

    // Only printable single characters belong to a barcode
    if (event.key.length !== 1) return;

    if (lastKeyAt && now - lastKeyAt > config.maxKeyIntervalMs) {
      // Too slow to be a scanner burst → start over
      buffer = '';
    }
    buffer += event.key;
    lastKeyAt = now;

    clearFlushTimer();
    if (config.flushTimeoutMs > 0) {
      flushTimer = setTimeout(() => {
        if (buffer.length >= config.minLength) {
          flush();
        } else {
          reset();
        }
      }, config.flushTimeoutMs);
    }
  };

  return {
    name: 'keyboard-wedge',
    start(scannerService) {
      service = scannerService;
      reset();
      window.addEventListener('keydown', onKeyDown, true);
    },
    stop() {
      window.removeEventListener('keydown', onKeyDown, true);
      reset();
      service = null;
    },
    isActive() {
      return service !== null;
    },
  };
}

export default createKeyboardWedgeAdapter;
