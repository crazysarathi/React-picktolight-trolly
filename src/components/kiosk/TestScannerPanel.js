import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import TestBarcodeInput from 'components/kiosk/TestBarcodeInput';

/**
 * TEMPORARY development strip on the scanning screen: a barcode input box only.
 * It goes through `testScannerAdapter.scan()` → ScannerService, i.e. the same path a
 * physical scanner uses. Nothing here touches workflow state.
 */
export default function TestScannerPanel({ remainingBarcodes = [] }) {
  const unique = Array.from(new Set(remainingBarcodes.filter(Boolean)));

  return (
    <motion.div
      className="relative z-20 flex h-14 h-short:h-12 shrink-0 items-center justify-between gap-3 border-t border-dashed border-amber-400/40 bg-ot-bg-bottom/90 px-3 md:px-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex min-w-0 items-center gap-2 text-amber-300">
        <FlaskConical className="h-4 w-4 shrink-0" />
        <span className="shrink-0 whitespace-nowrap text-xs font-bold uppercase tracking-[0.25em]">Test scanner</span>
        <span className="hidden md:inline truncate text-xs text-ot-text-muted">
          · type a medicine barcode and press Enter (any order)
          {unique.length > 0 ? (
            <>
              {' '}· still to collect:{' '}
              <span className="font-semibold text-ot-text tabular-nums">{unique.join(' · ')}</span>
            </>
          ) : null}
        </span>
      </div>
      <TestBarcodeInput size="md" placeholder="Medicine barcode…" />
    </motion.div>
  );
}
