/**
 * TEMPORARY test adapter used while no physical barcode scanner is available.
 *
 * `testScannerAdapter.scan("890000000001")` behaves exactly like a real scan:
 * it publishes the barcode into the ScannerService, and the workflow cannot tell
 * the difference. Remove/disable it (kioskConfig.testScanner.enabled = false)
 * once the real scanner is connected — nothing else needs to change.
 */
export function createTestScannerAdapter() {
  let service = null;

  return {
    name: 'test-scanner',
    start(scannerService) {
      service = scannerService;
    },
    stop() {
      service = null;
    },
    isActive() {
      return service !== null;
    },
    /** Simulate a barcode scan. Returns the emitted scan event (or null if inactive). */
    scan(barcode) {
      if (!service) {
        console.warn('[test-scanner] adapter is not registered; scan ignored');
        return null;
      }
      return service.emit(barcode, { source: 'test-scanner', raw: barcode });
    },
  };
}

/** Shared instance used by the TestScannerPanel UI. */
export const testScannerAdapter = createTestScannerAdapter();
export default testScannerAdapter;
