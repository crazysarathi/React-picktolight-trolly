import React from 'react';
import { motion } from 'framer-motion';
import { EASE } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

const RADIUS = 42; // in a 100×100 box

/**
 * ONE square tile with a progress RING (replaces the Total · Collected · Pending tiles): the ring fills up
 * clockwise from the top as medicines are collected, the completed percentage sits in the middle with the order
 * total in small text under it. Green once everything is collected.
 */
export default function ProgressRing({ progress, className }) {
  const done = progress.total > 0 && progress.collected >= progress.total;
  return (
    <div
      role="region"
      aria-label={`Progress: ${progress.percent} percent collected, ${progress.collected} of ${progress.total} total`}
      className={cn(
        'relative aspect-square overflow-hidden rounded-[var(--radius)] border bg-gradient-to-b from-ot-surface-top to-ot-surface-bottom shadow-sm',
        done ? 'border-emerald-400/40' : 'border-ot-border/35',
        className
      )}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="6" className="stroke-ot-border/25" />
        <motion.circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={done ? 'stroke-emerald-400' : 'stroke-ot-action-fill'}
          initial={false}
          animate={{ pathLength: Math.max(0.001, progress.percent / 100), opacity: progress.percent > 0 ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE.out }}
        />
      </svg>

      <div className="absolute inset-[16%] flex flex-col items-center justify-center text-center leading-none">
        <p className={cn('font-bold tabular-nums text-2xl h-tall:text-4xl h-xtall:text-5xl', done ? 'text-emerald-400' : 'text-ot-text')}>
          {progress.percent}
          <span className="text-[0.5em] font-semibold text-ot-text-muted">%</span>
        </p>
        <p className="mt-1.5 h-xtall:mt-2 text-[0.55rem] md:text-[0.65rem] h-xtall:text-xs font-semibold uppercase tracking-[0.18em] text-ot-text-muted">
          of {progress.total} total
        </p>
      </div>
    </div>
  );
}
