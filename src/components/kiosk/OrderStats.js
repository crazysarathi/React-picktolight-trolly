import React from 'react';
import { Pill, PackageCheck, Hourglass } from 'lucide-react';
import { cn } from 'lib/utils';

const TONES = {
  blue: { badge: 'border-ot-action/40 bg-ot-action/10 text-ot-action', card: 'border-ot-action/30' },
  green: { badge: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400', card: 'border-emerald-400/25' },
  amber: { badge: 'border-amber-400/40 bg-amber-400/10 text-amber-300', card: 'border-amber-400/25' },
};

function StatTile({ icon, tone, label, value, hint, className }) {
  const t = TONES[tone] || TONES.blue;
  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 h-xtall:aspect-square rounded-[var(--radius)] border bg-gradient-to-b from-ot-surface-top to-ot-surface-bottom px-1.5 py-2 h-tall:p-3 text-center shadow-sm',
        t.card,
        className
      )}
    >
      {/* Icon badge only where there is vertical room (hidden on the short 1024×600 panel) */}
      <div className={cn('hidden h-tall:flex h-10 w-10 shrink-0 items-center justify-center rounded-full border', t.badge)}>{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl h-tall:text-3xl font-bold leading-none text-white tabular-nums">{value}</p>
        <p className="mt-1 truncate text-[0.65rem] h-tall:text-xs font-semibold uppercase tracking-[0.15em] text-ot-text-muted">{label}</p>
        {hint && <p className="hidden h-tall:block truncate text-xs text-ot-text-muted/80">{hint}</p>}
      </div>
    </div>
  );
}

/**
 * Total · Collected · Pending tiles next to the scanner (bottom of the page). Three small counters —
 * the order ID and patient data live in the patient panel.
 */
export default function OrderStats({ progress, className }) {
  const plural = (n) => (n === 1 ? 'item' : 'items');
  return (
    <div className={cn('grid grid-cols-3 gap-2 md:gap-3', className)} role="region" aria-label="Order summary">
      <StatTile tone="blue" label="Total" value={progress.total} hint="in this order" icon={<Pill className="h-5 w-5" strokeWidth={1.75} />} />
      <StatTile
        tone="green"
        label="Collected"
        value={progress.collected}
        hint={`of ${progress.total} ${plural(progress.total)}`}
        icon={<PackageCheck className="h-5 w-5" strokeWidth={1.75} />}
      />
      <StatTile
        tone="amber"
        label="Pending"
        value={progress.remaining}
        hint={progress.remaining === 0 ? 'all done' : 'left to scan'}
        icon={<Hourglass className="h-5 w-5" strokeWidth={1.75} />}
      />
    </div>
  );
}
