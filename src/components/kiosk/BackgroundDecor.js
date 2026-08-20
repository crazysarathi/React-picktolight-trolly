import React from 'react';
import { Cross, Pill, HeartPulse, Stethoscope, Syringe, Plus } from 'lucide-react';

/**
 * Subtle pharmacy shapes drifting in the background (transform-only CSS animation,
 * ~6 elements → negligible cost on Raspberry Pi). Disable via kioskConfig.backgroundMotion.
 */
const SHAPES = [
  { Icon: Cross, left: '7%', top: '16%', size: 64, duration: 11, delay: 0 },
  { Icon: Pill, left: '86%', top: '20%', size: 56, duration: 13, delay: 1.5 },
  { Icon: HeartPulse, left: '12%', top: '72%', size: 52, duration: 12, delay: 3 },
  { Icon: Stethoscope, left: '82%', top: '70%', size: 60, duration: 14, delay: 2 },
  { Icon: Syringe, left: '48%', top: '86%', size: 44, duration: 12, delay: 4 },
  { Icon: Plus, left: '62%', top: '9%', size: 34, duration: 10, delay: 0.5 },
];

function BackgroundDecor({ enabled = true }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft static glows (radial gradients — no filter blur, cheap to composite) */}
      <div className="absolute -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-[radial-gradient(circle,rgba(95,166,255,0.16),transparent_65%)]" />
      <div className="absolute -bottom-48 -right-32 w-[36rem] h-[36rem] rounded-full bg-[radial-gradient(circle,rgba(35,79,125,0.45),transparent_65%)]" />
      {enabled &&
        SHAPES.map(({ Icon, left, top, size, duration, delay }, i) => (
          <Icon
            key={i}
            className="absolute text-ot-action/[0.09] animate-float-slow"
            strokeWidth={1.25}
            style={{ left, top, width: size, height: size, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
          />
        ))}
    </div>
  );
}

export default React.memo(BackgroundDecor);
