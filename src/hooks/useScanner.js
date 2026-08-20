import { useEffect, useRef } from 'react';
import { scannerService } from 'services/scanner/scannerService';

/**
 * Subscribe a handler to barcode scans (from any adapter).
 * The latest handler is always used without re-subscribing.
 */
export function useScanner(onScan, { enabled = true } = {}) {
  const handlerRef = useRef(onScan);

  useEffect(() => {
    handlerRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return undefined;
    return scannerService.subscribe((scan) => {
      if (typeof handlerRef.current === 'function') {
        handlerRef.current(scan);
      }
    });
  }, [enabled]);
}

export default useScanner;
