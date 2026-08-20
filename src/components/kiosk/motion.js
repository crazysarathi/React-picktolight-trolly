/** Shared framer-motion presets so every screen/card moves the same way.
 *  Only opacity / x / y are animated (no scale) — cheap to composite on Raspberry Pi. */
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
};

/** Whole-screen enter/exit (used with <AnimatePresence mode="wait">). */
export const screenVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE.out } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.28, ease: 'easeIn' } },
};

/** Card / dialog enter/exit (current-medicine card, overlays). */
export const cardVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE.out } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.22, ease: 'easeIn' } },
};

/** Backdrop fade for full-screen overlays. */
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.22 } },
};

/** Staggered "fade up" helper: <motion.p {...fadeUp(0.2)} /> */
export const fadeUp = (delay = 0, distance = 14) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: EASE.out },
});
