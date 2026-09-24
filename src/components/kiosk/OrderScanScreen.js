import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import BackgroundDecor from 'components/kiosk/BackgroundDecor';
import PharmacyBrand from 'components/kiosk/PharmacyBrand';
import ScanArea from 'components/kiosk/ScanArea';
import TestBarcodeInput from 'components/kiosk/TestBarcodeInput';
import LayoutToggle from 'components/kiosk/LayoutToggle';
import { screenVariants, fadeUp } from 'components/kiosk/motion';

/**
 * First screen when the kiosk opens: the customer scans the MAIN barcode (order slip / prescription).
 * The matching order's medicines are then listed on the scanning screen.
 * While the test scanner is enabled, a barcode input box is shown for testing.
 * Top-right: the Portrait | Landscape toggle (`layoutMode` / `onLayoutModeChange`, hidden without the handler) that
 * picks the screen layout of the whole kiosk — see src/lib/layoutMode.js.
 */
export default function OrderScanScreen({
  pharmacy,
  orders = [],
  showTestInput = false,
  backgroundMotion = true,
  feedbackActive = false,
  layoutMode = 'portrait',
  onLayoutModeChange,
}) {
  return (
    <motion.section
      className="kiosk-screen overflow-y-auto overflow-x-hidden"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <BackgroundDecor enabled={backgroundMotion} />

      {onLayoutModeChange && (
        <motion.div {...fadeUp(0.35)} className="absolute right-3 top-3 z-20 md:right-4 md:top-4">
          <LayoutToggle value={layoutMode} onChange={onLayoutModeChange} />
        </motion.div>
      )}

      <div className="relative z-10 m-auto flex w-full max-w-3xl flex-col items-center px-6 py-4 text-center">
        <motion.div {...fadeUp(0.05)} className="mb-3 md:mb-4">
          <PharmacyBrand name={pharmacy.name} logo={pharmacy.logo} showName={false} size="md" />
        </motion.div>

        <motion.p {...fadeUp(0.15)} className="text-xs md:text-sm uppercase tracking-[0.4em] text-ot-text-muted">
          Welcome to
        </motion.p>

        <motion.h1
          {...fadeUp(0.25)}
          className="mt-1 text-[clamp(1.6rem,4.5vw,3rem)] font-bold uppercase tracking-[0.06em] text-white leading-tight"
        >
          {pharmacy.name}
        </motion.h1>

        <motion.p {...fadeUp(0.35)} className="mt-2 text-[clamp(1rem,2.4vw,1.5rem)] text-ot-text-muted">
          {pharmacy.welcomeMessage}
        </motion.p>

        <motion.div {...fadeUp(0.45)} className="mt-4 md:mt-5 w-full max-w-[34rem]">
          <ScanArea paused={feedbackActive} label="Scan order barcode" className="h-36 md:h-44 h-short:h-32" />
        </motion.div>

        <motion.p {...fadeUp(0.55)} className="mt-2 md:mt-3 text-sm md:text-base text-ot-text-muted">
          Hold the barcode on your order slip under the scanner
        </motion.p>

        {showTestInput && (
          <motion.div
            {...fadeUp(0.65)}
            className="mt-3 md:mt-4 flex w-full max-w-[34rem] flex-col items-center gap-2 rounded-2xl border border-dashed border-amber-400/40 bg-ot-bg-bottom/70 px-4 py-2.5 md:py-3"
          >
            <div className="flex items-center gap-2 text-amber-300">
              <FlaskConical className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.25em]">Test scanner</span>
              <span className="text-xs text-ot-text-muted">· type an order barcode and press Enter</span>
            </div>
            <TestBarcodeInput size="lg" placeholder="Order barcode…" />
            {orders.length > 0 && (
              <p className="text-xs text-ot-text-muted tabular-nums">
                Sample order barcodes:{' '}
                {orders.map((o, i) => (
                  <span key={o.barcode}>
                    {i > 0 && ' · '}
                    <span className="font-semibold text-white">{o.barcode}</span>
                    {o.reference ? ` (${o.reference})` : ''}
                  </span>
                ))}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
