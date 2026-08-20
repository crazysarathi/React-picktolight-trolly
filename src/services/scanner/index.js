import { scannerService } from './scannerService';
import { createKeyboardWedgeAdapter } from './keyboardWedgeAdapter';
import { testScannerAdapter } from './testScannerAdapter';

/**
 * Wire scanner sources according to configuration.
 * Returns a cleanup function that stops every adapter (safe under React StrictMode).
 *
 *   initScanner({ keyboardWedge: {...}, testScannerEnabled: true, knownBarcodes: ['1001', '891', …] })
 *
 * `knownBarcodes` (optional) lowers the keyboard-wedge minLength so a configured barcode can never be
 * rejected as "too short".
 */
export function initScanner({ keyboardWedge, testScannerEnabled = false, knownBarcodes = [] } = {}) {
  const cleanups = [];

  if (keyboardWedge?.enabled !== false) {
    const shortest = knownBarcodes.reduce((min, code) => Math.min(min, String(code).length), Infinity);
    const options = { ...keyboardWedge };
    if (Number.isFinite(shortest) && shortest > 0) {
      options.minLength = Math.max(1, Math.min(options.minLength ?? shortest, shortest));
    }
    cleanups.push(scannerService.registerAdapter(createKeyboardWedgeAdapter(options)));
  }

  if (testScannerEnabled) {
    cleanups.push(scannerService.registerAdapter(testScannerAdapter));
  }

  return () => {
    cleanups.forEach((stop) => stop());
  };
}

export { scannerService, testScannerAdapter, createKeyboardWedgeAdapter };
export { createTestScannerAdapter } from './testScannerAdapter';
