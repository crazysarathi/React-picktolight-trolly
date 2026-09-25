import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import { overlayVariants } from 'components/kiosk/motion';

/** "✓ Medicine Found — Added to bag" confirmation. Auto-dismissed by the workflow; tap to continue sooner. */
export default function ScanSuccess({ feedback, collectedAfter, total, onContinue }) {
  const medicine = feedback.medicine;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ot-bg-top/85 p-6"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onContinue}
      role="status"
      aria-live="assertive"
    >
      <motion.div
        className="relative w-full max-w-md rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-ot-surface-top to-ot-surface-bottom px-8 py-7 md:py-8 text-center shadow-2xl"
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="relative mx-auto mb-4 h-24 w-24 h-short:h-24 h-short:w-24 md:h-32 md:w-32">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-emerald-400/25"
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
          />
          <div className="absolute inset-0 rounded-full border border-emerald-400/30 bg-emerald-400/10" />
          <AnimatedCheck className="relative h-full w-full text-emerald-400" strokeWidth={3.5} />
        </div>

        <p className="text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/90">Medicine found</p>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-ot-text">{medicine.name}</h2>

        <motion.div
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-base md:text-lg font-semibold text-emerald-300"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <ShoppingBag className="h-5 w-5" />
          Added to bag
          <span className="text-emerald-300/70">· Qty {medicine.quantity}</span>
        </motion.div>

        <p className="mt-4 text-sm text-ot-text-muted tabular-nums">
          {collectedAfter} of {total} collected
        </p>
      </motion.div>
    </motion.div>
  );
}
