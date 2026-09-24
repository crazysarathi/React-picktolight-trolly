import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from 'lib/utils';

const SIZES = {
  sm: { label: 'text-[0.55rem] h-xtall:text-[0.65rem]', value: 'text-xs md:text-sm h-xtall:text-base', pad: 'px-2 py-1 h-xtall:px-2.5 h-xtall:py-1.5', icon: 'h-3.5 w-3.5 h-xtall:h-4 h-xtall:w-4' },
  md: { label: 'text-[0.6rem] h-xtall:text-xs', value: 'text-sm md:text-base h-xtall:text-xl', pad: 'px-2.5 py-1 h-xtall:px-3 h-xtall:py-1.5', icon: 'h-4 w-4 h-xtall:h-5 h-xtall:w-5' },
};

/**
 * Small segmented "tab" strip:  [ LABEL value ] → [ LABEL value ] → …
 * Used at the top of the current-medicine card for the patient / order line (tone "muted") and for where the
 * medicine is kept — Wall → Cupboard → Shelf (tone "action"). Segments without a value are skipped; the strip
 * renders nothing when no segment is left. `Icon` is drawn once, in front of the first segment.
 */
export default function InfoStrip({ segments, tone = 'muted', size = 'sm', Icon, className, 'aria-label': ariaLabel }) {
  const items = (segments || []).filter((s) => s && s.value !== null && s.value !== undefined && s.value !== '');
  if (items.length === 0) return null;
  const s = SIZES[size] || SIZES.sm;
  const action = tone === 'action';

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex min-w-0 max-w-full items-stretch overflow-hidden rounded-xl border',
        action ? 'border-ot-action/50 bg-ot-action/10' : 'border-ot-border/50 bg-ot-surface-bottom/50',
        className
      )}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && (
            <span aria-hidden="true" className={cn('flex shrink-0 items-center', action ? 'text-ot-action/70' : 'text-ot-text-muted/50')}>
              <ArrowRight className={s.icon} strokeWidth={2} />
            </span>
          )}
          <div className={cn('flex min-w-0 items-center gap-1.5', s.pad)}>
            {i === 0 && Icon && <Icon className={cn('shrink-0', s.icon, action ? 'text-ot-action' : 'text-ot-action/80')} strokeWidth={1.9} />}
            <span className={cn('shrink-0 font-bold uppercase tracking-[0.18em]', s.label, action ? 'text-ot-action' : 'text-ot-text-muted')}>{item.label}</span>
            <span className={cn('truncate font-semibold text-white tabular-nums', s.value)}>{item.value}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
