import React from 'react';
import { Cross } from 'lucide-react';
import { cn } from 'lib/utils';

const SIZES = {
  sm: { box: 'w-10 h-10 rounded-xl p-1.5', icon: 'w-5 h-5', text: 'text-base md:text-lg' },
  md: { box: 'w-14 h-14 md:w-16 md:h-16 rounded-2xl p-2 md:p-2.5', icon: 'w-7 h-7 md:w-8 md:h-8', text: 'text-xl md:text-2xl' },
  lg: { box: 'w-24 h-24 md:w-28 md:h-28 h-short:w-20 h-short:h-20 rounded-3xl p-3 md:p-4 h-short:p-3', icon: 'w-1/2 h-1/2', text: 'text-2xl' },
};

/** Brand logo tile (image from data.js `pharmacyData.logo`, lucide Cross fallback) — no drop shadow. */
export function BrandLogo({ logo, name, size = 'md', className }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div
      className={cn(
        'bg-ot-action-fill text-ot-action-fg flex items-center justify-center shrink-0 shadow-[0_10px_30px_-10px_rgb(var(--ot-action-fill)/0.6)]',
        s.box,
        className
      )}
    >
      {logo ? (
        <img src={logo} alt={name ? `${name} logo` : 'Pharmacy logo'} className="w-full h-full object-contain" draggable={false} decoding="async" />
      ) : (
        <Cross className={s.icon} strokeWidth={2.5} />
      )}
    </div>
  );
}

/** Pharmacy logo tile + name. Both come from data.js via props. */
export default function PharmacyBrand({ name, logo, size = 'md', showName = true, className }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={cn('flex items-center gap-3 min-w-0', className)}>
      <BrandLogo logo={logo} name={name} size={size} />
      {showName && (
        <span className={cn('font-bold uppercase tracking-[0.12em] text-ot-text truncate', s.text)}>{name}</span>
      )}
    </div>
  );
}
