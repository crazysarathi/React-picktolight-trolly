/**
 * ScannerService — the single entry point for every barcode source.
 *
 *   Test buttons / input      ┐
 *   USB keyboard-wedge scanner├──▶ scannerService.emit(barcode) ──▶ subscribers (workflow)
 *   Future serial/camera/API  ┘
 *
 * Adapters implement:  { name, start(service), stop() }
 * Subscribers receive: { barcode, source, timestamp, raw }
 */
class ScannerService {
  constructor() {
    this.listeners = new Set();
    this.adapters = new Map();
    this.lastScan = null;
  }

  /** Subscribe to scan events. Returns an unsubscribe function. */
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Publish a barcode to all subscribers.
   * Every source (test panel, HID scanner, …) must call this and nothing else.
   */
  emit(barcode, meta = {}) {
    const value = String(barcode ?? '').trim();
    if (!value) return null;

    const scan = {
      barcode: value,
      source: meta.source || 'unknown',
      timestamp: typeof meta.timestamp === 'number' ? meta.timestamp : Date.now(),
      raw: meta.raw ?? barcode,
    };
    this.lastScan = scan;

    this.listeners.forEach((listener) => {
      try {
        listener(scan);
      } catch (error) {
        console.error('[scanner] listener error', error);
      }
    });
    return scan;
  }

  /** Register and start an adapter. Returns a function that stops & removes it. */
  registerAdapter(adapter) {
    if (!adapter || !adapter.name) {
      throw new Error('[scanner] adapter must have a name');
    }
    if (this.adapters.has(adapter.name)) {
      this.unregisterAdapter(adapter.name);
    }
    this.adapters.set(adapter.name, adapter);
    if (typeof adapter.start === 'function') {
      adapter.start(this);
    }
    return () => this.unregisterAdapter(adapter.name);
  }

  unregisterAdapter(name) {
    const adapter = this.adapters.get(name);
    if (!adapter) return;
    if (typeof adapter.stop === 'function') {
      try {
        adapter.stop();
      } catch (error) {
        console.error(`[scanner] failed to stop adapter "${name}"`, error);
      }
    }
    this.adapters.delete(name);
  }

  getAdapterNames() {
    return Array.from(this.adapters.keys());
  }
}

export const scannerService = new ScannerService();
export default scannerService;
