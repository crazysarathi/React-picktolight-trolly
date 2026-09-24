import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, TriangleAlert, Play, ScanBarcode } from 'lucide-react';
import { Button } from 'components/ui/button';
import { overlayVariants, cardVariants } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

/**
 * Shown on the order-scan page right after the MAIN barcode is recognised: the customer sees whose order
 * it is, which picking team (colour) it belongs to and how many medicines are in it, reads the notice, and taps
 * START to open the collection screen.
 * Scanning another order slip while this is open replaces the pending order.
 */
export default function OrderConfirmOverlay({ order, medicines = [], team, onStart, onCancel }) {
  const patientName = order?.patient?.name;
  const count = medicines.length;
  const countLabel = `${count} ${count === 1 ? 'medicine' : 'medicines'} to collect`;

  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-6',
        // Lighter backdrop when the order has a team, so its colour already shows through behind the card
        team ? 'bg-ot-bg-top/60' : 'bg-ot-bg-top/85'
      )}
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirm-title"
    >
      <motion.div
        className="w-full max-w-lg rounded-3xl border border-emerald-400/40 bg-gradient-to-b from-ot-surface-top to-ot-surface-bottom p-6 md:p-7 text-center shadow-2xl"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="mx-auto mb-3 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-400">
          <ClipboardCheck className="h-8 w-8 md:h-10 md:w-10" strokeWidth={2} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/90">Order found</p>
        <h2 id="order-confirm-title" className="mt-1 text-2xl md:text-3xl font-semibold text-white">
          {patientName || `Order ${order?.reference ?? ''}`.trim()}
        </h2>
        <p className="mt-1 text-base md:text-lg text-ot-text-muted tabular-nums">
          {order?.reference ? `Order ${order.reference} · ` : ''}
          {countLabel}
        </p>
        {team && (
          <p className="mt-3 flex justify-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-ot-bg-top/60 px-4 py-1.5 text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white">
              <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full ring-2 ring-white/40" style={{ backgroundColor: team.from }} />
              {team.label} team
            </span>
          </p>
        )}

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-left">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" strokeWidth={2} />
          <p className="text-sm md:text-base text-amber-100">
            Please make sure this is your order. Tap <span className="font-semibold text-white">START</span> to begin — on the
            next screen, scan the barcode on each medicine pack to collect it.
          </p>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button size="xl" variant="secondary" className="min-w-[12rem]" onClick={onCancel}>
            <ScanBarcode className="mr-2 h-5 w-5" />
            Scan another order
          </Button>
          <Button
            size="xl"
            className="min-w-[12rem] font-semibold tracking-wide shadow-[0_18px_50px_-12px_rgb(var(--ot-action-fill)/0.65)]"
            onClick={onStart}
            autoFocus
          >
            START
            <Play className="ml-2 h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
