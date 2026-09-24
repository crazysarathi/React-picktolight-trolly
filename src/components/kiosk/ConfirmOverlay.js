import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from 'components/ui/button';
import { overlayVariants, cardVariants } from 'components/kiosk/motion';

/** Touch-sized yes/no confirmation (used for "Start over"). */
export default function ConfirmOverlay({
  title = 'Start over?',
  description = 'The current collection progress will be cleared.',
  confirmText = 'Yes, start over',
  cancelText = 'Continue scanning',
  onConfirm,
  onCancel,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ot-bg-top/85 p-6"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="w-full max-w-md rounded-3xl border border-ot-border/35 bg-gradient-to-b from-ot-surface-top to-ot-surface-bottom p-7 text-center shadow-2xl"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-ot-border/35 bg-ot-surface-bottom/60 text-ot-text-muted">
          <RotateCcw className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-base text-ot-text-muted">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button size="xl" variant="secondary" className="min-w-[11rem]" onClick={onCancel} autoFocus>
            {cancelText}
          </Button>
          <Button size="xl" variant="destructive" className="min-w-[11rem]" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
