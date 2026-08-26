import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, PackageOpen, ArrowLeft } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import PharmacyBrand from 'components/kiosk/PharmacyBrand';
import MedicineList from 'components/kiosk/MedicineList';
import PatientCard from 'components/kiosk/PatientCard';
import ScanPrompt from 'components/kiosk/ScanPrompt';
import OrderStats from 'components/kiosk/OrderStats';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import { screenVariants, cardVariants } from 'components/kiosk/motion';

function EmptyOrder({ pharmacy, order, onBack }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-ot-border bg-ot-surface-bottom/60 text-ot-text-muted">
          <PackageOpen className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-white">No medicines to collect</h2>
        <p className="text-ot-text-muted">
          {order?.reference ? `Order ${order.reference} has no medicines. ` : 'This order has no medicines. '}
          {pharmacy.helpNote}
        </p>
        <Button size="xl" variant="secondary" onClick={onBack} className="mt-2 min-w-[12rem]">
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </Button>
      </Card>
    </div>
  );
}

/** Shown for a moment after the last medicine is collected, before the completion screen. */
function AllCollectedCard() {
  return (
    <motion.div className="flex min-h-0 flex-1 flex-col" variants={cardVariants} initial="initial" animate="animate" exit="exit">
      <Card className="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-3 p-6 text-center border-emerald-400/30">
        <AnimatedCheck className="h-20 w-20 text-emerald-400" />
        <h2 className="text-2xl md:text-3xl font-semibold text-white">All medicines collected</h2>
        <p className="text-ot-text-muted">Preparing your summary…</p>
      </Card>
    </motion.div>
  );
}

/**
 * Main workflow screen: header · collection list (tap a row for details) · patient details + order summary tiles
 * + scan card (fills the rest of the column). Medicines can be scanned in any order. Result overlays
 * (success / warning) are rendered by KioskPage on top.
 */
export default function ScannerScreen({
  pharmacy,
  order,
  medicines,
  statuses,
  progress,
  allCollected,
  feedbackActive,
  onCancelRequest,
  onBackEmpty,
}) {
  const isEmpty = medicines.length === 0;
  const patientName = order?.patient?.name;

  return (
    <motion.section className="kiosk-screen" variants={screenVariants} initial="initial" animate="animate" exit="exit">
      <header className="relative flex h-16 h-short:h-14 shrink-0 items-center justify-between gap-3 border-b border-ot-border/60 px-4 md:px-5">
        <PharmacyBrand name={pharmacy.name} logo={pharmacy.logo} size="sm" className="min-w-0 flex-1 max-w-[62%] md:max-w-[40%]" />

        {/* Title block is absolutely centred so it sits in the true middle of the page regardless of the side widths */}
        <div className="absolute left-1/2 top-1/2 hidden md:flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-tight whitespace-nowrap">
          <span className="text-lg font-semibold text-white">Collect Your Medicines</span>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="xl"
            className="h-11 px-3 md:px-4 text-base text-ot-text-muted hover:text-white"
            onClick={onCancelRequest}
            aria-label="Start over"
          >
            <RotateCcw className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Start over</span>
          </Button>
        </div>
      </header>

      {/* Screen-reader announcement of progress (persistent, not remounted per scan) */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {isEmpty
          ? ''
          : allCollected
            ? 'All medicines collected'
            : `${progress.collected} of ${progress.total} medicines collected. Scan any remaining medicine.`}
      </p>

      {isEmpty ? (
        <EmptyOrder pharmacy={pharmacy} order={order} onBack={onBackEmpty} />
      ) : (
        <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-1 gap-3 md:gap-4 overflow-y-auto p-3 md:p-4 h-short:p-3 md:auto-rows-auto md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden">
          <MedicineList
            medicines={medicines}
            statuses={statuses}
            progress={progress}
            allCollected={allCollected}
            className="order-2 md:order-1 max-h-[50vh] md:max-h-none"
          />

          {/* Right column: patient details · order tiles · scan card (fills the remaining height down to the bottom of the page) */}
          <div className="order-1 md:order-2 flex min-h-0 flex-col gap-3 md:gap-4 h-short:gap-2.5 md:max-h-full md:overflow-y-auto md:overflow-x-hidden">
            <PatientCard order={order} />
            <OrderStats order={order} progress={progress} />
            <div className="flex min-h-0 flex-1 flex-col">
              <AnimatePresence mode="wait" initial={false}>
                {allCollected ? (
                  <AllCollectedCard key="all-collected" />
                ) : (
                  <ScanPrompt key="scan-prompt" progress={progress} paused={feedbackActive} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
