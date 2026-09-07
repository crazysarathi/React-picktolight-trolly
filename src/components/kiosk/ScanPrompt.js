import React from 'react';
import { motion } from 'framer-motion';
import { ScanBarcode } from 'lucide-react';
import { Card } from 'components/ui/card';
import ScanArea from 'components/kiosk/ScanArea';
import { cardVariants } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

/**
 * "Scan medicine barcode" card at the bottom of the right column. It grows to fill whatever height is
 * left under the patient details and the order tiles, so the animated scan zone is as large as the
 * screen allows (the physical keyboard-wedge scanner needs nothing else). There is no fixed sequence —
 * any medicine of the order can be scanned next. `paused` freezes the animation while a result overlay is shown.
 */
export default function ScanPrompt({ progress, paused = false, className }) {
  return (
    <motion.div
      className={cn('flex min-h-0 flex-1 flex-col', className)}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="region"
      aria-label="Scan medicine barcode"
    >
      <Card className="flex min-h-0 flex-1 flex-col p-3 h-tall:p-4 border-ot-action/40 shadow-[0_0_0_1px_rgba(95,166,255,0.15),0_24px_60px_-30px_rgba(95,166,255,0.5)]">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5 text-ot-action">
            <ScanBarcode className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="truncate text-xs md:text-sm font-bold uppercase tracking-[0.25em] h-xtall:tracking-[0.15em]">Scan medicine barcode</span>
          </div>
          {progress && (
            <span className="shrink-0 text-xs md:text-sm font-semibold text-white tabular-nums">{progress.remaining} remaining</span>
          )}
        </div>

        <ScanArea paused={paused} label="Scan barcode here" className="mt-2 h-tall:mt-3 min-h-[5rem] flex-1" iconClassName="h-xtall:w-10 h-xtall:h-10" />

        <p className="mt-2 h-tall:mt-3 shrink-0 text-center text-xs md:text-sm text-ot-text-muted h-xtall:hidden">
          Hold the medicine barcode under the scanner
        </p>
      </Card>
    </motion.div>
  );
}
