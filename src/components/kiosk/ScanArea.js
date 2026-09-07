import React from 'react';
import { ScanBarcode } from 'lucide-react';
import { cn } from 'lib/utils';

/**
 * Visual scanning zone: bracket corners, pulsing outline and an animated scan line.
 * Pure CSS animations (transform/opacity only). `paused` freezes the line while
 * a result overlay is displayed. Give it a height (or let it flex) via `className`.
 */
export default function ScanArea({ paused = false, label = 'Scan barcode', className, iconClassName }) {
  return (
    <div className={cn('relative w-full', className)}>
      <span
        aria-hidden="true"
        className={cn('absolute -inset-1 rounded-[1.25rem] border-2 border-ot-action/50 animate-pulse-ring', paused && '[animation-play-state:paused]')}
      />
      <div className="relative h-full w-full rounded-2xl border border-ot-border/70 bg-ot-bg-bottom/70 overflow-hidden">
        <span className="scan-corner tl" />
        <span className="scan-corner tr" />
        <span className="scan-corner bl" />
        <span className="scan-corner br" />

        <div className="absolute inset-3 overflow-hidden rounded-lg">
          <div className={cn('scan-line', paused && 'is-paused')} />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <ScanBarcode className={cn('w-12 h-12 md:w-16 md:h-16 text-ot-action/75', iconClassName)} strokeWidth={1.5} />
          <div className="flex items-center gap-3 text-ot-text-muted">
            <span className="h-px w-8 md:w-12 bg-ot-border" />
            <span className="text-[0.65rem] md:text-xs font-semibold tracking-[0.35em] uppercase">{label}</span>
            <span className="h-px w-8 md:w-12 bg-ot-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
