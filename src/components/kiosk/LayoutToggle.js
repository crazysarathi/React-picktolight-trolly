import React from 'react';
import { RectangleVertical, RectangleHorizontal } from 'lucide-react';
import { LAYOUT_MODES } from 'lib/layoutMode';
import { cn } from 'lib/utils';

const OPTIONS = {
  portrait: { label: 'Portrait', Icon: RectangleVertical },
  landscape: { label: 'Landscape', Icon: RectangleHorizontal },
};

/**
 * Portrait | Landscape switch (order-scan page, top-right corner): picks the screen layout of the whole kiosk —
 * see src/lib/layoutMode.js. A two-option segmented pill; the active side is filled in the action colour.
 */
export default function LayoutToggle({ value, onChange, className }) {
  return (
    <div
      role="radiogroup"
      aria-label="Screen layout"
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border border-ot-border/35 bg-ot-bg-bottom/70 p-1 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {LAYOUT_MODES.map((mode) => {
        const { label, Icon } = OPTIONS[mode];
        const active = mode === value;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange?.(mode)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full px-3 md:px-4 text-xs md:text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-ot-action-fill text-ot-action-fg shadow-[0_10px_30px_-10px_rgb(var(--ot-action-fill)/0.7)]'
                : 'text-ot-text-muted hover:text-ot-text'
            )}
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
