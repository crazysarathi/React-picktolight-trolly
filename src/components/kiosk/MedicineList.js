import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from 'components/ui/card';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import { MEDICINE_STATUS } from 'lib/workflow';
import { EASE } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

function MedicineListItem({ medicine, index, status, active, isNext, onSelect }) {
  const isCollected = status === MEDICINE_STATUS.COLLECTED;

  // Keep the highlighted row in view when it moves (after a scan the next pack is highlighted)
  const ref = useRef(null);
  useEffect(() => {
    if (active && ref.current?.scrollIntoView) ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [active]);

  return (
    <motion.li
      ref={ref}
      className={cn(
        'overflow-hidden rounded-xl border transition-colors duration-500',
        isCollected
          ? 'border-emerald-400/25 bg-emerald-400/[0.06]'
          : active
            ? 'border-ot-action/70 bg-ot-action/[0.12] shadow-[0_0_0_1px_rgba(95,166,255,0.2)]'
            : 'border-ot-border/50 bg-ot-surface-bottom/30'
      )}
      initial={false}
      animate={{ opacity: isCollected && !active ? 0.75 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className="flex w-full items-center gap-2.5 h-tall:gap-3 px-2.5 h-tall:px-3 py-1.5 h-tall:py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className={cn(
            'flex h-8 w-8 h-tall:h-9 h-tall:w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-500',
            isCollected ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400' : 'border-ot-action/50 bg-ot-action/10 text-ot-action'
          )}
        >
          {isCollected ? (
            <AnimatedCheck className="h-5 w-5 h-tall:h-6 h-tall:w-6" strokeWidth={4} ring={false} />
          ) : (
            <span className="text-sm h-tall:text-base font-semibold tabular-nums">{index + 1}</span>
          )}
        </div>

        <p
          className={cn(
            'min-w-0 flex-1 truncate text-base h-tall:text-lg font-semibold leading-tight',
            isCollected ? 'text-ot-text-muted line-through decoration-emerald-400/40' : 'text-white'
          )}
        >
          {medicine.name}
        </p>

        <span className="shrink-0 text-sm h-tall:text-base leading-none text-ot-text-muted tabular-nums">Qty {medicine.quantity}</span>

        <span
          className={cn(
            'hidden md:inline-block shrink-0 rounded-full border px-2 py-0.5 h-tall:px-2.5 text-[0.65rem] h-tall:text-xs font-semibold uppercase tracking-[0.12em]',
            isCollected
              ? 'border-emerald-400/30 text-emerald-400/90'
              : isNext
                ? 'border-ot-action/60 bg-ot-action/15 text-ot-action'
                : 'border-transparent text-ot-action/70'
          )}
        >
          {isCollected ? 'Collected' : isNext ? 'Scan next' : 'To collect'}
        </span>
      </button>
    </motion.li>
  );
}

/**
 * Compact "Your medicines are ready to collect" picker: ✓ collected · ○ to collect, scanned in any order.
 * One line per medicine; the highlighted row (`activeId`) is the one shown large in CurrentMedicine —
 * it follows the next pack to collect and any row the user taps (`onSelect`).
 */
export default function MedicineList({ medicines, statuses, progress, allCollected, activeId, onSelect, className }) {
  const nextIndex = statuses.findIndex((s) => s !== MEDICINE_STATUS.COLLECTED);
  const nextId = nextIndex >= 0 ? medicines[nextIndex].id : null;

  return (
    <Card className={cn('flex min-h-0 flex-col overflow-hidden', className)} role="region" aria-label="Collection list, any order">
      <div className="shrink-0 px-3 h-tall:px-4 pt-2.5 h-tall:pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-base md:text-lg h-xtall:text-xl font-semibold text-white leading-tight">
            Your medicines are ready to collect
          </h2>
          <div className="shrink-0 text-right leading-none">
            <span className="text-xl md:text-2xl h-xtall:text-3xl font-semibold text-white tabular-nums">{progress.collected}</span>
            <span className="text-ot-text-muted text-sm md:text-base h-xtall:text-lg tabular-nums"> / {progress.total}</span>
          </div>
        </div>
        <div className="mt-1.5 h-tall:mt-2 h-1.5 w-full overflow-hidden rounded-full border border-ot-border/50 bg-ot-surface-bottom">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-ot-action"
            initial={false}
            animate={{ scaleX: progress.percent / 100 }}
            transition={{ duration: 0.6, ease: EASE.out }}
          />
        </div>
      </div>

      <ul className="kiosk-scroll min-h-0 flex-1 space-y-1.5 px-2.5 h-tall:px-3 pb-2.5 h-tall:pb-3">
        {medicines.map((medicine, index) => (
          <MedicineListItem
            key={medicine.id}
            medicine={medicine}
            index={index}
            status={statuses[index]}
            isNext={!allCollected && medicine.id === nextId}
            active={activeId === medicine.id}
            onSelect={() => onSelect?.(medicine.id)}
          />
        ))}
      </ul>
    </Card>
  );
}
