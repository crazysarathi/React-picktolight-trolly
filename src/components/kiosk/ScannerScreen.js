import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, PackageOpen, ArrowLeft, IdCard, X } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import PharmacyBrand from 'components/kiosk/PharmacyBrand';
import MedicineList from 'components/kiosk/MedicineList';
import CurrentMedicine from 'components/kiosk/CurrentMedicine';
import PatientCard from 'components/kiosk/PatientCard';
import ScanPrompt from 'components/kiosk/ScanPrompt';
import OrderStats from 'components/kiosk/OrderStats';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import { screenVariants, cardVariants } from 'components/kiosk/motion';
import { MEDICINE_STATUS } from 'lib/workflow';
import { cn } from 'lib/utils';

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
      <Card className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 h-tall:gap-3 p-4 text-center border-emerald-400/30">
        <AnimatedCheck className="h-16 w-16 h-tall:h-20 h-tall:w-20 text-emerald-400" />
        <h2 className="text-xl md:text-2xl font-semibold text-white">All medicines collected</h2>
        <p className="text-sm md:text-base text-ot-text-muted">Preparing your summary…</p>
      </Card>
    </motion.div>
  );
}

/**
 * Main workflow screen (portrait-first):
 *   header  — brand · "Collect Your Medicines" · Start over · patient-details toggle
 *   body    — ONE big "current medicine" card (≈70 %): picture, NAME and QUANTITY of the pack to collect
 *             next, with the compact "Your medicines are ready to collect" list (≈30 %) under it.
 *             The big card follows the next un-collected medicine and any row tapped in the list.
 *             Tapping the patient button swaps both for the patient details in the same slot.
 *   bottom  — Total / Collected / Pending tiles beside the scanner card.
 * On the short landscape panel (1024×600) the same pieces sit in two columns instead.
 * Medicines can be scanned in any order. Result overlays (success / warning) are rendered by KioskPage.
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
  const [showPatient, setShowPatient] = useState(false);

  // Which medicine the big card shows: the next un-collected one, unless the user tapped another row.
  // `undefined` = follow the next pack automatically; an id = the user's own choice (until the next scan).
  const nextIndex = statuses.findIndex((s) => s !== MEDICINE_STATUS.COLLECTED);
  const [manualId, setManualId] = useState(undefined);
  const currentIndex = manualId !== undefined ? medicines.findIndex((m) => m.id === manualId) : -1;
  const activeIndex = currentIndex >= 0 ? currentIndex : nextIndex;
  const activeMedicine = activeIndex >= 0 ? medicines[activeIndex] : null;

  // A new scan should always bring the collection list back (tick visible) and re-follow the next pack
  useEffect(() => {
    setShowPatient(false);
    setManualId(undefined);
  }, [progress.collected]);

  const patientName = order?.patient?.name;

  return (
    <motion.section className="kiosk-screen" variants={screenVariants} initial="initial" animate="animate" exit="exit">
      <header className="relative flex h-16 h-short:h-14 shrink-0 items-center justify-between gap-3 border-b border-ot-border/60 px-4 md:px-5">
        <PharmacyBrand name={pharmacy.name} logo={pharmacy.logo} size="sm" className="min-w-0 flex-1 max-w-[55%] md:max-w-[38%]" />

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

          {/* Patient-details button: toggles between the medicine list and the patient data */}
          {!isEmpty && (
            <button
              type="button"
              onClick={() => setShowPatient((v) => !v)}
              aria-pressed={showPatient}
              aria-label={showPatient ? 'Back to medicines' : `Show patient details${patientName ? ` for ${patientName}` : ''}`}
              className={cn(
                'flex h-11 h-tall:h-12 shrink-0 items-center gap-2 rounded-full border px-3 md:px-4 text-sm md:text-base font-semibold transition-colors duration-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                showPatient
                  ? 'border-ot-action bg-ot-action text-white shadow-[0_10px_30px_-10px_rgba(95,166,255,0.7)]'
                  : 'border-ot-border bg-gradient-to-b from-ot-surface-elev-top to-ot-surface-elev-bottom text-ot-action hover:border-ot-action/70'
              )}
            >
              {showPatient ? <X className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} /> : <IdCard className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.9} />}
              <span className="hidden md:inline">{showPatient ? 'Close' : 'Patient details'}</span>
            </button>
          )}
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
        <div className="flex min-h-0 flex-1 flex-col gap-3 md:gap-4 p-3 md:p-4 h-short:gap-3 h-short:p-3 h-short:grid h-short:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] h-short:grid-rows-[minmax(0,1fr)]">
          {/* Main slot: medicine list ⇄ patient details (same place, one at a time) */}
          <div className="flex min-h-0 flex-1 flex-col">
            <AnimatePresence mode="wait" initial={false}>
              {showPatient ? (
                <motion.div key="patient" className="flex min-h-0 flex-1 flex-col" variants={cardVariants} initial="initial" animate="animate" exit="exit">
                  <PatientCard order={order} progress={progress} onClose={() => setShowPatient(false)} className="min-h-0 flex-1" />
                </motion.div>
              ) : (
                <motion.div key="medicines" className="flex min-h-0 flex-1 flex-col gap-3 md:gap-4 h-short:gap-3" variants={cardVariants} initial="initial" animate="animate" exit="exit">
                  {/* ≈70 %: the medicine to collect now — name and count, big */}
                  <CurrentMedicine
                    medicine={activeMedicine}
                    index={activeIndex}
                    total={medicines.length}
                    status={activeIndex >= 0 ? statuses[activeIndex] : undefined}
                    isNext={!allCollected && activeIndex === nextIndex}
                    allCollected={allCollected}
                    className="min-h-0 flex-[7] basis-0 h-short:flex-[3]"
                  />
                  {/* ≈30 %: compact picker list */}
                  <MedicineList
                    medicines={medicines}
                    statuses={statuses}
                    progress={progress}
                    allCollected={allCollected}
                    activeId={activeMedicine?.id ?? null}
                    onSelect={setManualId}
                    className="min-h-0 flex-[3] basis-0 h-short:flex-[2]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom row (tall / portrait): Collected · Pending tiles | scanner.  Short panel: right column, scanner fills the rest */}
          <div className="grid shrink-0 grid-cols-2 gap-3 md:gap-4 h-tall:h-[19vh] h-xtall:h-auto h-short:flex h-short:min-h-0 h-short:flex-col h-short:gap-3">
            <OrderStats progress={progress} className="min-h-0" />
            <div className="flex min-h-0 flex-col h-short:flex-1">
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
