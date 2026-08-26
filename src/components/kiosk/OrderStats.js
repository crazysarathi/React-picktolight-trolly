import React from 'react';
import { Hash, Pill, PackageCheck, Hourglass } from 'lucide-react';
import { cn } from 'lib/utils';

const TONES = {
  blue: 'border-ot-action/40 bg-ot-action/10 text-ot-action',
  green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
};

const plural = (n, word) => `${n} ${n === 1 ? word : `${word}s`}`;

/** Small ring that fills with the completion percentage (stroke-dashoffset transition only — cheap on the Pi). */
function CompletionRing({ percent, className }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(100, Math.max(0, percent)) / 100)}
        transform="rotate(-90 12 12)"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
    </svg>
  );
}

function StatTile({ icon, tone = 'blue', label, value, className }) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2.5 h-tall:gap-3 rounded-xl border border-ot-border/50 bg-ot-surface-bottom/30 px-2.5 py-2 h-tall:p-3',
        className
      )}
    >
      {/* Icon badge only where there is vertical room (hidden on the short 1024×600 panel) */}
      <div className={cn('hidden h-tall:flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full border', TONES[tone] || TONES.blue)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs h-tall:text-sm text-ot-text-muted">{label}</p>
        <p className="truncate text-sm h-tall:text-lg font-semibold leading-tight text-white tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/**
 * Order summary tiles under the scan card: Order ID · Total Items · Collected · Pending · Completion.
 * Tall screens: two rows (order facts / progress). Short panel: one compact row (Order ID is already
 * shown in the header line, so that tile is hidden there).
 */
export default function OrderStats({ order, progress, className }) {
  const tiles = [
    {
      key: 'order',
      label: 'Order ID',
      value: order?.reference || '—',
      icon: <Hash className="h-5 w-5" strokeWidth={1.75} />,
      tone: 'blue',
      className: 'hidden h-tall:flex h-tall:col-span-3',
    },
    {
      key: 'total',
      label: 'Total Items',
      value: plural(progress.total, 'Item'),
      icon: <Pill className="h-5 w-5" strokeWidth={1.75} />,
      tone: 'blue',
      className: 'h-tall:col-span-3',
    },
    {
      key: 'collected',
      label: 'Collected',
      value: plural(progress.collected, 'Item'),
      icon: <PackageCheck className="h-5 w-5" strokeWidth={1.75} />,
      tone: 'green',
      className: 'h-tall:col-span-2 h-xtall:col-span-3',
    },
    {
      key: 'pending',
      label: 'Pending',
      value: plural(progress.remaining, 'Item'),
      icon: <Hourglass className="h-5 w-5" strokeWidth={1.75} />,
      tone: 'amber',
      className: 'h-tall:col-span-2 h-xtall:col-span-3',
    },
    {
      key: 'completion',
      label: 'Completion',
      value: `${progress.percent}%`,
      icon: <CompletionRing percent={progress.percent} className="h-6 w-6" />,
      tone: 'blue',
      className: 'h-tall:col-span-2 h-xtall:col-span-6',
    },
  ];

  return (
    <div
      className={cn('grid shrink-0 grid-cols-4 h-tall:grid-cols-6 gap-2 h-tall:gap-3', className)}
      role="region"
      aria-label="Order summary"
    >
      {tiles.map(({ key, ...tile }) => (
        <StatTile key={key} {...tile} />
      ))}
    </div>
  );
}
