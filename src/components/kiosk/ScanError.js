import React from 'react';
import { motion } from 'framer-motion';
import { ScanLine, PackageCheck, FileQuestion } from 'lucide-react';
import { overlayVariants } from 'components/kiosk/motion';
import { SCAN_RESULT } from 'lib/workflow';
import { cn } from 'lib/utils';

const CONTENT = {
  [SCAN_RESULT.UNKNOWN]: {
    Icon: ScanLine,
    tone: 'amber',
    title: 'Barcode Not Recognised',
    body: () => 'This item is not part of your order.',
    hint: () => 'Please scan one of the medicines in your collection list.',
  },
  [SCAN_RESULT.DUPLICATE]: {
    Icon: PackageCheck,
    tone: 'blue',
    title: 'Medicine Already Collected',
    body: (fb) => `${fb.medicine?.name ?? 'This medicine'} is already in your bag.`,
    hint: (_, remaining) =>
      remaining > 0
        ? `Please scan one of the ${remaining === 1 ? 'remaining medicine' : `${remaining} remaining medicines`}.`
        : '',
  },
  [SCAN_RESULT.ORDER_NOT_FOUND]: {
    Icon: FileQuestion,
    tone: 'amber',
    title: 'Order Not Found',
    body: (fb) => `Barcode ${fb.barcode} does not match any order.`,
    hint: (helpNote) => `Please scan the barcode on your order slip. ${helpNote || ''}`.trim(),
  },
  [SCAN_RESULT.INVALID_PRESCRIPTION_PREFIX]: {
    Icon: FileQuestion,
    tone: 'amber',
    title: 'Prescription Code Not Matched',
    body: (fb) => `Barcode ${fb.barcode} is not a valid prescription barcode.`,
    hint: (helpNote) => `Main prescription barcodes must start with prefix '11'. ${helpNote || ''}`.trim(),
  },
};

const TONES = {
  amber: {
    border: 'border-amber-400/40',
    iconBox: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    eyebrow: 'text-amber-300/90',
  },
  blue: {
    border: 'border-ot-action/40',
    iconBox: 'border-ot-action/40 bg-ot-action/10 text-ot-action',
    eyebrow: 'text-ot-action/90',
  },
};

/**
 * Friendly warning for unknown / already-collected / order-not-found scans.
 * The workflow stays where it is; overlay auto-dismisses (tap to dismiss sooner).
 */
export default function ScanError({ feedback, helpNote, remaining = 0, onDismiss }) {
  const content = CONTENT[feedback.type] || CONTENT[SCAN_RESULT.UNKNOWN];
  const tone = TONES[content.tone];
  const { Icon } = content;
  const hint = content.hint ? content.hint(helpNote, remaining) : '';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ot-bg-top/85 p-6"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onDismiss}
      role="alert"
    >
      <motion.div
        className={cn(
          'relative w-full max-w-md rounded-3xl border bg-gradient-to-b from-ot-surface-top to-ot-surface-bottom px-7 py-6 md:px-8 md:py-7 text-center shadow-2xl',
          tone.border
        )}
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {/* Shake runs on a plain inner wrapper (no gradient/shadow) — cheap to repaint */}
        <motion.div
          animate={{ x: [0, -10, 10, -7, 7, -3, 3, 0] }}
          transition={{ delay: 0.2, duration: 0.55, ease: 'easeInOut' }}
        >
          <div className={cn('mx-auto mb-3 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full border', tone.iconBox)}>
            <Icon className="h-8 w-8 md:h-10 md:w-10" strokeWidth={2} />
          </div>

          <p className={cn('text-xs font-semibold uppercase tracking-[0.35em]', tone.eyebrow)}>Please check</p>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-ot-text">{content.title}</h2>
          <p className="mt-2 text-base md:text-lg text-ot-text-muted">{content.body(feedback)}</p>
          {hint && <p className="mt-2 text-sm md:text-base text-ot-text-muted">{hint}</p>}

          <p className="mt-4 text-xs text-ot-text-muted/80">Tap anywhere to continue</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
