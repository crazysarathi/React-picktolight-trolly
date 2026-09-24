import React from 'react';
import { cn } from 'lib/utils';

/** Sample illustration per `form` (public/images/medicines/*.svg) — used when the medicine has no `image` in data.js. */
const FORM_IMAGE = {
  tablet: '/images/medicines/tablet.svg',
  capsule: '/images/medicines/capsule.svg',
  syrup: '/images/medicines/syrup.svg',
  drops: '/images/medicines/drops.svg',
  injection: '/images/medicines/injection.svg',
  inhaler: '/images/medicines/inhaler.svg',
  cream: '/images/medicines/cream.svg',
  other: '/images/medicines/other.svg',
};

/**
 * Medicine picture. `image` from data.js is the real pack shot with a transparent background
 * (public/images/medicines/<id>.webp) and floats straight on the card, as big as the slot allows;
 * without one, the sample illustration for its `form` is shown on a dark tile.
 */
export default function MedicineVisual({ medicine, className }) {
  const photo = medicine?.image;
  const src = photo || FORM_IMAGE[medicine?.form] || FORM_IMAGE.other;
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden',
        !photo && 'rounded-2xl border border-ot-border/35 bg-gradient-to-b from-ot-surface-elev-top to-ot-surface-elev-bottom text-ot-action',
        className
      )}
    >
      <img
        src={src}
        alt=""
        className={cn(
          'h-full w-full object-contain',
          photo ? 'drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]' : 'p-1.5'
        )}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
