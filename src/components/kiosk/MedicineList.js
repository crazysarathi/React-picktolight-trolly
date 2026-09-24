import React, { forwardRef, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from 'components/ui/card';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import { MEDICINE_STATUS } from 'lib/workflow';
import { cn } from 'lib/utils';

const MedicineListItem = forwardRef(function MedicineListItem({ medicine, index, status, active, isNext, onSelect }, ref) {
  const isCollected = status === MEDICINE_STATUS.COLLECTED;

  return (
    <motion.li
      ref={ref}
      className={cn(
        'h-12 h-tall:h-14 shrink-0 overflow-hidden rounded-xl border transition-colors duration-500',
        isCollected
          ? 'border-emerald-400/25 bg-emerald-400/[0.06]'
          : active
            ? 'border-ot-action/70 bg-ot-action/[0.12] shadow-[0_0_0_1px_rgb(var(--ot-action)/0.2)]'
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
        className="flex h-full w-full items-center gap-2.5 h-tall:gap-3 px-2.5 h-tall:px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
});

// Tall portrait tablet: the box shows exactly FIVE rows and scrolls for the rest —
// 5 rows × 3.5rem (h-14) + 4 gaps × 0.375rem (space-y-1.5) + 2 × 0.75rem padding (py-3) = 20.5rem.
// Keep this a literal class — Tailwind only generates class names it finds verbatim in the source.
const XTALL_MAX_HEIGHT = 'h-xtall:max-h-[20.5rem]';

/**
 * Compact collection picker (no title bar — progress lives in the ProgressRing tile): ✓ collected · ○ to collect,
 * scanned in any order. One line per medicine; the highlighted row (`activeId`) is the one shown large in
 * CurrentMedicine — it follows the next pack to collect and any row the user taps (`onSelect`).
 * Rows have a fixed height (5 visible on the tall tablet, the rest scrolls); the highlighted row is kept in view.
 */
const MedicineList = forwardRef(function MedicineList(
  { medicines, statuses, allCollected, activeId, onSelect, className },
  ref
) {
  const nextIndex = statuses.findIndex((s) => s !== MEDICINE_STATUS.COLLECTED);
  const nextId = nextIndex >= 0 ? medicines[nextIndex].id : null;
  const rows = useRef(new Map());

  // Keep the highlighted row in view — it follows the next pack to collect, so the list scrolls along as rows tick off
  useEffect(() => {
    const row = activeId != null ? rows.current.get(activeId) : null;
    if (row?.scrollIntoView) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  return (
    <Card ref={ref} className={cn('flex min-h-0 flex-col overflow-hidden', className)} role="region" aria-label="Collection list, any order">
      <ul
        className={cn(
          'kiosk-scroll relative min-h-0 flex-1 space-y-1.5 px-2.5 h-tall:px-3 py-2.5 h-tall:py-3 [overflow-anchor:none]',
          XTALL_MAX_HEIGHT
        )}
      >
        {medicines.map((medicine, index) => (
          <MedicineListItem
            key={medicine.id}
            ref={(el) => (el ? rows.current.set(medicine.id, el) : rows.current.delete(medicine.id))}
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
});

export default MedicineList;
