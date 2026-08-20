import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Card } from 'components/ui/card';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import { MEDICINE_STATUS } from 'lib/workflow';
import { EASE } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

const ROW_STYLES = {
  [MEDICINE_STATUS.COLLECTED]: 'border-emerald-400/25 bg-emerald-400/[0.06]',
  [MEDICINE_STATUS.PENDING]: 'border-ot-border/50 bg-ot-surface-bottom/30',
};

const FORM_LABEL = {
  tablet: 'Tablet',
  capsule: 'Capsule',
  syrup: 'Syrup',
  drops: 'Drops',
  injection: 'Injection',
  inhaler: 'Inhaler',
  cream: 'Cream',
  other: 'Other',
};

/** Expanded row details: quantity + everything known about the pack. */
function MedicineDetails({ medicine }) {
  const qty = Number(medicine.quantity) || 0;
  const rows = [
    ['Pack', medicine.pack],
    ['Dosage', medicine.dosage],
    ['Manufacturer', medicine.manufacturer],
    ['Barcode', medicine.barcode],
  ].filter(([, v]) => v);

  return (
    <div className="border-t border-ot-border/40 px-3 pb-3 pt-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-ot-action/40 bg-ot-action/10 px-2.5 py-1">
          <span className="text-xs uppercase tracking-[0.2em] text-ot-action">Quantity</span>
          <span className="text-xl font-bold leading-none text-white tabular-nums">{qty}</span>
          <span className="text-xs text-ot-text-muted">{qty === 1 ? 'pack' : 'packs'}</span>
        </span>
        {medicine.form && (
          <span className="rounded-lg border border-ot-border/60 bg-ot-surface-bottom/60 px-2.5 py-1.5 text-xs uppercase tracking-[0.2em] text-ot-text-muted">
            {FORM_LABEL[medicine.form] || medicine.form}
          </span>
        )}
      </div>
      <dl className="mt-2 space-y-1 text-sm leading-snug">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="w-24 shrink-0 text-ot-text-muted">{label}</dt>
            <dd className={cn('min-w-0 flex-1 text-white', label === 'Barcode' && 'tabular-nums')}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function MedicineListItem({ medicine, index, status, expanded, onToggle }) {
  const isCollected = status === MEDICINE_STATUS.COLLECTED;

  return (
    <motion.li
      className={cn('relative overflow-hidden rounded-xl border transition-colors duration-500', ROW_STYLES[status])}
      initial={false}
      animate={{ opacity: isCollected ? 0.8 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-3 py-2 h-tall:py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className={cn(
            'flex h-9 w-9 h-tall:h-11 h-tall:w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-500',
            isCollected ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400' : 'border-ot-action/50 bg-ot-action/10 text-ot-action'
          )}
        >
          {isCollected ? (
            <AnimatedCheck className="h-6 w-6 h-tall:h-7 h-tall:w-7" strokeWidth={4} ring={false} />
          ) : (
            <span className="text-sm font-semibold tabular-nums">{index + 1}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'line-clamp-2 break-words text-base h-tall:text-lg font-semibold leading-tight',
              isCollected ? 'text-ot-text-muted line-through decoration-emerald-400/40' : 'text-white'
            )}
          >
            {medicine.name}
          </p>
          <p className="mt-0.5 truncate text-sm leading-tight text-ot-text-muted">
            Qty {medicine.quantity}
            {medicine.pack ? ` · ${medicine.pack}` : ''}
          </p>
        </div>

        <span
          className={cn(
            'shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.1em]',
            isCollected ? 'text-emerald-400/90' : 'text-ot-action/80'
          )}
        >
          {isCollected ? 'Collected' : 'To collect'}
        </span>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-ot-text-muted transition-transform duration-300', expanded && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE.out }}
          >
            <MedicineDetails medicine={medicine} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/**
 * Collection list: ✓ collected · ○ to collect. There is no fixed sequence — scan the packs in any order
 * and the matching row ticks off. Any row can be tapped to see quantity + pack details.
 */
export default function MedicineList({ medicines, statuses, progress, allCollected, className }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <Card className={cn('flex min-h-0 flex-col overflow-hidden', className)}>
      <div className="flex shrink-0 items-end justify-between gap-3 px-4 md:px-5 pt-2.5 pb-2 h-tall:pt-4 h-tall:pb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-ot-text-muted">Your medicines · any order</p>
          <h2 className="text-lg md:text-xl font-semibold text-white leading-tight">Collection list</h2>
        </div>
        <div className="shrink-0 text-right leading-none">
          <span className="text-2xl md:text-3xl font-semibold text-white tabular-nums">{progress.collected}</span>
          <span className="text-ot-text-muted text-base md:text-lg tabular-nums"> / {progress.total}</span>
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-1.5 h-tall:space-y-2 overflow-y-auto px-3 pb-1 h-tall:pb-2">
        {medicines.map((medicine, index) => (
          <MedicineListItem
            key={medicine.id}
            medicine={medicine}
            index={index}
            status={statuses[index]}
            expanded={expandedId === medicine.id}
            onToggle={() => setExpandedId((id) => (id === medicine.id ? null : medicine.id))}
          />
        ))}
      </ul>

      <div className="flex shrink-0 items-center gap-3 px-4 md:px-5 pb-3 pt-1.5 h-tall:pb-4 h-tall:pt-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full border border-ot-border/50 bg-ot-surface-bottom">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-ot-action"
            initial={false}
            animate={{ scaleX: progress.percent / 100 }}
            transition={{ duration: 0.6, ease: EASE.out }}
          />
        </div>
        <p className="shrink-0 text-xs md:text-sm text-ot-text-muted tabular-nums">
          {allCollected ? 'All collected' : `${progress.remaining} remaining`}
        </p>
      </div>
    </Card>
  );
}
