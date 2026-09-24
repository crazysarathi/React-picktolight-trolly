import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Full-screen background in the colour of the active order's picking team (data.js `teamColors`).
 * Rendered as the first child of .kiosk-root, under every screen, so the whole page reads as that colour.
 * It cross-fades in when an order opens and out when the order is cancelled or completed
 * (`team` null → nothing is painted and the default navy gradient from index.css shows through).
 * Opacity-only animation, no filters — cheap to composite on the Raspberry Pi.
 */
export default function TeamBackdrop({ team }) {
  return (
    <AnimatePresence>
      {team && (
        <motion.div
          key={team.key}
          aria-hidden="true"
          data-team={team.key}
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 70% 55% at 50% 40%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 70%), linear-gradient(to bottom, ${team.from}, ${team.to})`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.45 } }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        />
      )}
    </AnimatePresence>
  );
}
