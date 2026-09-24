import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRound, MapPin } from 'lucide-react';
import { Card } from 'components/ui/card';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import InfoStrip from 'components/kiosk/InfoStrip';
import { MEDICINE_STATUS } from 'lib/workflow';
import { locationSegments } from 'lib/locations';
import { EASE } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

/** Content swap when the highlighted medicine changes (after a scan or a tap in the list). */
const swapVariants = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE.out } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.18, ease: 'easeIn' } },
};

/**
 * The "current medicine" card — what the picker has to look at: NAME and how many packs to take, with two small
 * strips at the top: PATIENT → ORDER (who it is for) and WALL → CUPBOARD → SHELF (where the pack is kept,
 * `location` from lib/locations.js — the route map beside the scanner lights the same cupboard).
 * It follows the next un-collected medicine automatically and any row tapped in the list (see ScannerScreen).
 */
export default function CurrentMedicine({ medicine, index, total, status, isNext, allCollected, order, location, className, style }) {
  const isCollected = status === MEDICINE_STATUS.COLLECTED;
  const qty = Number(medicine?.quantity) || 0;
  const green = allCollected || isCollected;
  const patientName = order?.patient?.name;
  const segments = locationSegments(location);

  return (
    <Card
      role="region"
      aria-label="Current medicine"
      style={style}
      className={cn(
        'relative flex min-h-0 flex-col overflow-hidden p-3 h-tall:p-4 h-xtall:p-5',
        'transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        green
          ? 'border-emerald-400/40 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]'
          : 'border-ot-action/50 shadow-[0_0_0_1px_rgb(var(--ot-action)/0.18),0_30px_80px_-40px_rgb(var(--ot-action)/0.6)]',
        className
      )}
    >
      {/* Row 1: patient → order · position in the order */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <InfoStrip
          aria-label="Patient and order"
          Icon={UserRound}
          segments={[
            { label: 'Patient', value: patientName },
            { label: 'Order', value: order?.reference },
          ]}
          className="min-w-0"
        />
        {medicine && !allCollected && (
          <span className="shrink-0 rounded-full border border-ot-border/60 bg-ot-surface-bottom/60 px-3 py-1 text-xs md:text-sm h-xtall:text-base font-semibold text-ot-text-muted tabular-nums">
            Medicine {index + 1} of {total}
          </span>
        )}
      </div>

      {/* Row 2: where the pack is kept — Wall → Cupboard → Shelf */}
      {medicine && !allCollected && (
        <div className="mt-2 h-xtall:mt-3 flex shrink-0 items-center">
          {segments.length > 0 ? (
            <InfoStrip
              aria-label="Where to find it"
              tone={isCollected ? 'muted' : 'action'}
              size="md"
              Icon={MapPin}
              segments={segments}
              className="min-w-0"
            />
          ) : (
            <span className="text-xs md:text-sm text-ot-text-muted/70">Location not set for this medicine</span>
          )}
        </div>
      )}

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
              <div className="flex flex-col items-center gap-3">
                <AnimatedCheck className="h-20 w-20 h-tall:h-28 h-tall:w-28 text-emerald-400" />
                <p className="text-2xl h-tall:text-4xl font-semibold text-white">All medicines collected</p>
                <p className="text-base h-tall:text-xl text-ot-text-muted">
                  {total} of {total} packs are in your bag
                </p>
              </div>
            </motion.div>
          ) : medicine ? (
            <motion.div
              key={medicine.id}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 h-tall:gap-4 text-center"
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

              {/* Name + count block (kept ≤ 76 % wide so long names wrap inside the card's padding) */}
              <div className="flex min-w-0 max-w-[76%] flex-col items-center gap-1.5 h-tall:gap-2.5">
                <h2
                  className={cn(
                    'line-clamp-2 break-words text-2xl h-tall:text-4xl h-xtall:text-6xl font-bold leading-tight',
                    isCollected ? 'text-ot-text-muted line-through decoration-emerald-400/50' : 'text-white'
                  )}
                >
                  {medicine.name}
                </h2>
                {medicine.pack && (
                  <p className="truncate max-w-full text-sm h-tall:text-lg h-xtall:text-2xl text-ot-text-muted">{medicine.pack}</p>
                )}

                {/* Count — the second thing the picker must know */}
                <div
                  className={cn(
                    'mt-1 h-tall:mt-2 inline-flex items-baseline gap-2.5 h-tall:gap-3 rounded-2xl border px-4 py-1.5 h-tall:px-6 h-tall:py-2.5',
                    isCollected ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-ot-action/50 bg-ot-action/10'
                  )}
                >
                  <span className={cn('text-[0.65rem] h-tall:text-sm h-xtall:text-base font-bold uppercase tracking-[0.25em]', isCollected ? 'text-emerald-400' : 'text-ot-action')}>
                    Quantity
                  </span>
                  <span className="text-4xl h-tall:text-6xl h-xtall:text-7xl font-bold leading-none text-white tabular-nums">{qty}</span>
                  <span className="text-sm h-tall:text-lg h-xtall:text-2xl text-ot-text-muted">{qty === 1 ? 'pack' : 'packs'}</span>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Card>
  );
}
