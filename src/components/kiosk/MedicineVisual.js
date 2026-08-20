import React from 'react';
import { Tablets, Pill, FlaskConical, Droplets, Syringe, Wind, Package } from 'lucide-react';
import { cn } from 'lib/utils';

const FORM_ICON = {
  tablet: Tablets,
  capsule: Pill,
  syrup: FlaskConical,
  drops: Droplets,
  injection: Syringe,
  inhaler: Wind,
  cream: Package,
  other: Package,
};

/** Medicine picture: `image` from data.js if provided, otherwise an icon for its `form`. */
export default function MedicineVisual({ medicine, className, iconClassName }) {
  const Icon = FORM_ICON[medicine?.form] || Package;
  return (
    <div
      className={cn(
        'rounded-2xl border border-ot-border bg-gradient-to-b from-ot-surface-elev-top to-ot-surface-elev-bottom text-ot-action flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {medicine?.image ? (
        <img
          src={medicine.image}
          alt=""
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : (
        <Icon className={cn('w-1/2 h-1/2', iconClassName)} strokeWidth={1.75} />
      )}
    </div>
  );
}
