import React from 'react';
import { motion } from 'framer-motion';

/**
 * Check-mark drawn with SVG pathLength (GPU friendly, no layout).
 * Colour comes from `currentColor` → set text-* on className.
 */
export default function AnimatedCheck({ className, strokeWidth = 3.5, delay = 0, ring = true, style }) {
  return (
    <motion.svg
      viewBox="0 0 52 52"
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      aria-hidden="true"
    >
      {ring && (
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.7}
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { delay, duration: 0.5, ease: 'easeOut' } },
          }}
        />
      )}
      <motion.path
        d="M15 27 L23 35 L38 19"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { delay: delay + (ring ? 0.35 : 0), duration: 0.4, ease: 'easeOut' },
          },
        }}
      />
    </motion.svg>
  );
}
