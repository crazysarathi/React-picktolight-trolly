import React from 'react';
import { motion } from 'framer-motion';
import { ScanBarcode } from 'lucide-react';
import { Card } from 'components/ui/card';
import ScanArea from 'components/kiosk/ScanArea';
import { cardVariants } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

/**
 * Compact "Scan medicine barcode" card under the progress square (bottom-left), with the route map to its right.
 * The animated scan zone fills whatever height the card gets (the physical keyboard-wedge scanner needs nothing
 * else). There is no fixed sequence — any medicine of the order can be scanned next. `paused` freezes the
 * animation while a result overlay is shown.
 */
export default function ScanPrompt({ progress, paused = false, className }) {
  return (
    <motion.div
      className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="region"
      aria-label="Scan medicine barcode"
    >
      <Card className="flex min-h-0 flex-1 flex-col p-3 border-ot-action/40 shadow-[0_0_0_1px_rgb(var(--ot-action)/0.15),0_24px_60px_-30px_rgb(var(--ot-action)/0.5)]">
        {/* Header wraps on the narrow portrait card: the count drops to a second line instead of clipping the label */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
          <div className="flex min-w-0 items-center gap-2 text-ot-action">
            <ScanBarcode className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] h-xtall:tracking-[0.12em]">Scan barcode</span>
          </div>
          {progress && (
            <span className="ml-auto shrink-0 text-xs font-semibold text-ot-text tabular-nums">{progress.remaining} remaining</span>
          )}
        </div>

        <ScanArea paused={paused} label="Medicine here" className="mt-2 min-h-[4rem] flex-1" iconClassName="h-10 w-10 md:h-12 md:w-12" />

        <p className="mt-2 hidden h-tall:block h-xtall:hidden h-short:hidden shrink-0 text-center text-xs text-ot-text-muted">
          Hold the medicine barcode under the scanner
        </p>
      </Card>
    </motion.div>
  );
}
