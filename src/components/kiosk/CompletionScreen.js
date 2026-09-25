import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { Button } from 'components/ui/button';
import BackgroundDecor from 'components/kiosk/BackgroundDecor';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import PharmacyBrand from 'components/kiosk/PharmacyBrand';
import { screenVariants, fadeUp } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

const MAX_CHIPS = 6;

/**
 * "All Medicines Collected" — strong but calm success animation + COMPLETE button.
 * With a `team` the page is in the team colour (KioskPage keeps the theme on until COMPLETE is tapped), so the
 * content sits on a dark translucent panel — like the collection-screen header — to stay readable on yellow too.
 */
export default function CompletionScreen({ pharmacy, order, team, medicines, backgroundMotion = true, onComplete }) {
  const totalPacks = medicines.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
  const showChips = medicines.length > 0 && medicines.length <= MAX_CHIPS;

  return (
    <motion.section
      className="kiosk-screen overflow-y-auto overflow-x-hidden"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <BackgroundDecor enabled={backgroundMotion} />
      <div className="absolute left-4 top-4 md:left-5 md:top-5 z-10 max-w-[calc(50%-5.5rem)]">
        <PharmacyBrand name={pharmacy.name} logo={pharmacy.logo} size="sm" />
      </div>

      <div
        className={cn(
          'relative z-10 m-auto flex w-full max-w-2xl flex-col items-center px-6 py-4 text-center',
          team && 'rounded-3xl border border-ot-text/10 bg-ot-bg-top/55 py-8 md:py-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]'
        )}
      >
        <div className="relative mb-4 h-28 w-28 md:h-36 md:w-36 h-short:h-28 h-short:w-28">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
              initial={{ scale: 0.5, opacity: 0.9 }}
              animate={{ scale: 1.9 + i * 0.35, opacity: 0 }}
              transition={{ duration: 1.4, delay: 0.25 + i * 0.18, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            className="absolute inset-0 rounded-full border border-emerald-400/30 bg-emerald-400/10"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <AnimatedCheck className="relative h-full w-full text-emerald-400" strokeWidth={3.5} delay={0.2} />
        </div>

        <motion.p {...fadeUp(0.5)} className="text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300/90">
          Order complete
        </motion.p>
        <motion.h1 {...fadeUp(0.6)} className="mt-1 text-[clamp(1.8rem,4.5vw,3rem)] font-bold leading-tight text-ot-text">
          All Medicines Collected
        </motion.h1>
        <motion.p {...fadeUp(0.7)} className="mt-2 text-lg md:text-xl text-ot-text-muted">
          {order?.patient?.name ? `${order.patient.name} · ` : ''}Your order is ready{order?.reference ? ` · ${order.reference}` : ''}
        </motion.p>
        {team && (
          <motion.p {...fadeUp(0.75)} className="mt-2 flex items-center gap-1.5 text-[0.65rem] md:text-xs font-bold uppercase tracking-[0.25em] text-ot-text/85">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full ring-2 ring-ot-text/40" style={{ backgroundColor: team.from }} />
            {team.label} team
          </motion.p>
        )}

        <motion.div {...fadeUp(0.85)} className="mt-4 flex max-w-xl flex-wrap justify-center gap-2">
          {showChips ? (
            medicines.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs md:text-sm text-emerald-100"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                {m.name}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm md:text-base text-emerald-100">
              <ShoppingBag className="h-4 w-4" />
              {medicines.length} medicines · {totalPacks} packs collected
            </span>
          )}
        </motion.div>

        <motion.div {...fadeUp(1.0)} className="relative mt-6 md:mt-8">
          <Button
            size="2xl"
            onClick={onComplete}
            className="relative min-w-[16rem] shadow-[0_18px_50px_-12px_rgb(var(--ot-action-fill)/0.65)]"
            aria-label="Complete and start a new order"
          >
            COMPLETE
            <Check className="ml-3 h-7 w-7" strokeWidth={3} />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
