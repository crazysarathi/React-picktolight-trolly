import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanBarcode, PackageCheck } from 'lucide-react';
import { Card } from 'components/ui/card';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import MedicineVisual from 'components/kiosk/MedicineVisual';
import { MEDICINE_STATUS } from 'lib/workflow';
import { EASE } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

/** Content swap when the highlighted medicine changes (after a scan or a tap in the list). */
const swapVariants = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE.out } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.18, ease: 'easeIn' } },
};

/**
 * The big "current medicine" card — the one thing the patient has to look at: picture, NAME and how many
 * packs to take. It follows the next un-collected medicine automatically and any row tapped in the list.
 * Takes the lion's share of the page (see ScannerScreen), at the top, with the compact list under it.
 */
export default function CurrentMedicine({ medicine, index, total, status, isNext, allCollected, className }) {
  const isCollected = status === MEDICINE_STATUS.COLLECTED;
  const qty = Number(medicine?.quantity) || 0;
  const eyebrow = allCollected
    ? 'All done'
    : isCollected
      ? 'Already collected'
      : isNext
        ? 'Collect this medicine now'
        : 'Selected medicine';
  const green = allCollected || isCollected;

  return (
    <Card
      role="region"
      aria-label="Current medicine"
      className={cn(
        'relative flex min-h-0 flex-col overflow-hidden p-3 h-tall:p-5 h-xtall:p-6',
        green
          ? 'border-emerald-400/40 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]'
          : 'border-ot-action/50 shadow-[0_0_0_1px_rgba(95,166,255,0.18),0_30px_80px_-40px_rgba(95,166,255,0.6)]',
        className
      )}
    >
      {/* Title row: what to do · position in the order */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className={cn('flex min-w-0 items-center gap-2.5', green ? 'text-emerald-400' : 'text-ot-action')}>
          {green ? (
            <PackageCheck className="h-5 w-5 h-xtall:h-6 h-xtall:w-6 shrink-0" strokeWidth={1.75} />
          ) : (
            <ScanBarcode className="h-5 w-5 h-xtall:h-6 h-xtall:w-6 shrink-0" strokeWidth={1.75} />
          )}
          <span className="truncate text-xs md:text-sm h-xtall:text-base font-bold uppercase tracking-[0.25em] h-xtall:tracking-[0.18em]">
            {eyebrow}
          </span>
        </div>
        {medicine && !allCollected && (
          <span className="shrink-0 rounded-full border border-ot-border/60 bg-ot-surface-bottom/60 px-3 py-1 text-xs md:text-sm h-xtall:text-base font-semibold text-ot-text-muted tabular-nums">
            Medicine {index + 1} of {total}
          </span>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {allCollected ? (
            <motion.div
              key="all-collected"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
              variants={swapVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AnimatedCheck className="h-24 w-24 h-tall:h-36 h-tall:w-36 text-emerald-400" />
              <p className="text-2xl h-tall:text-4xl font-semibold text-white">All medicines collected</p>
              <p className="text-base h-tall:text-xl text-ot-text-muted">
                {total} of {total} packs are in your bag
              </p>
            </motion.div>
          ) : medicine ? (
            <motion.div
              key={medicine.id}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 h-tall:gap-5 text-center h-short:flex-row h-short:gap-5 h-short:text-left"
              variants={swapVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* <MedicineVisual
                medicine={medicine}
                className={cn(
                  'shrink-0',
                  medicine.image
                    ? 'h-[52%] w-[88%] h-short:h-[92%] h-short:w-[46%]'
                    : 'aspect-square h-[42%] h-short:h-[80%]',
                  isCollected && 'opacity-60 saturate-50'
                )}
              /> */}

              <div className="flex min-w-0 max-w-full flex-col items-center gap-2 h-tall:gap-3 h-short:items-start">
                <h2
                  className={cn(
                    'line-clamp-2 break-words text-3xl h-tall:text-5xl h-xtall:text-7xl font-bold leading-tight',
                    isCollected ? 'text-ot-text-muted line-through decoration-emerald-400/50' : 'text-white'
                  )}
                >
                  {medicine.name}
                </h2>
                {medicine.pack && (
                  <p className="truncate max-w-full text-base h-tall:text-xl h-xtall:text-2xl text-ot-text-muted">{medicine.pack}</p>
                )}

                {/* Count — the second thing the patient must know */}
                <div
                  className={cn(
                    'mt-1 h-tall:mt-3 inline-flex items-baseline gap-3 h-tall:gap-4 rounded-2xl border px-5 py-2 h-tall:px-7 h-tall:py-3',
                    isCollected ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-ot-action/50 bg-ot-action/10'
                  )}
                >
                  <span className={cn('text-xs h-tall:text-sm h-xtall:text-base font-bold uppercase tracking-[0.25em]', isCollected ? 'text-emerald-400' : 'text-ot-action')}>
                    Quantity
                  </span>
                  <span className="text-5xl h-tall:text-7xl h-xtall:text-8xl font-bold leading-none text-white tabular-nums">{qty}</span>
                  <span className="text-base h-tall:text-xl h-xtall:text-2xl text-ot-text-muted">{qty === 1 ? 'pack' : 'packs'}</span>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Card>
  );
}
