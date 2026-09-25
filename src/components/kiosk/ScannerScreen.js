import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, PackageOpen, ArrowLeft } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import PharmacyBrand from 'components/kiosk/PharmacyBrand';
import MedicineList from 'components/kiosk/MedicineList';
import CurrentMedicine from 'components/kiosk/CurrentMedicine';
import ScanPrompt from 'components/kiosk/ScanPrompt';
import ProgressRing from 'components/kiosk/ProgressRing';
import RoomMap from 'components/kiosk/RoomMap';
import AnimatedCheck from 'components/kiosk/AnimatedCheck';
import { screenVariants, cardVariants } from 'components/kiosk/motion';
import { MEDICINE_STATUS } from 'lib/workflow';
import { resolveLocation } from 'lib/locations';
import { cn } from 'lib/utils';

function EmptyOrder({ pharmacy, order, onBack }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-ot-border/35 bg-ot-surface-bottom/60 text-ot-text-muted">
          <PackageOpen className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-ot-text">No medicines to collect</h2>
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
      <Card className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-3 text-center border-emerald-400/30">
        <AnimatedCheck className="h-14 w-14 h-tall:h-16 h-tall:w-16 text-emerald-400" />
        <h2 className="text-lg md:text-xl font-semibold text-ot-text">All medicines collected</h2>
        <p className="text-xs md:text-sm text-ot-text-muted">Preparing your summary…</p>
      </Card>
    </motion.div>
  );
}

/**
 * Current-medicine card over the collection list. On the tall tablet the list is content-sized (5 rows) and the
 * card takes the rest of the slot; elsewhere the two share it 4:4 (3:2 on the short landscape panel).
 */
function MedicinePanel({ medicines, statuses, allCollected, nextIndex, activeIndex, activeMedicine, activeStatus, order, location, onSelect }) {
  return (
    <motion.div className="flex min-h-0 flex-1 flex-col gap-3 md:gap-4 h-short:gap-3" variants={cardVariants} initial="initial" animate="animate" exit="exit">
      <CurrentMedicine
        medicine={activeMedicine}
        index={activeIndex}
        total={medicines.length}
        status={activeStatus}
        isNext={!allCollected && activeIndex === nextIndex}
        allCollected={allCollected}
        order={order}
        location={location}
        className="min-h-0 flex-[4] basis-0 h-short:flex-[3]"
      />
      <MedicineList
        medicines={medicines}
        statuses={statuses}
        allCollected={allCollected}
        activeId={activeMedicine?.id ?? null}
        onSelect={onSelect}
        className="min-h-0 flex-[4] basis-0 h-short:flex-[2] h-xtall:flex-none"
      />
    </motion.div>
  );
}

/**
 * Main workflow screen (portrait-first):
 *   header  — brand · "Collect Your Medicines" (+ team name when the order has a `teamColor`) · Start over
 *   body    — the "current medicine" card: PATIENT → ORDER strip, WALL → CUPBOARD → SHELF strip, NAME and QUANTITY
 *             of the pack to collect next, with the compact collection list under it (5 rows on the tall tablet,
 *             the rest scrolls). The card follows the next un-collected medicine and any row tapped in the list.
 *   bottom  — progress square (completed %) above the compact scanner card | ROUTE MAP of the picking room
 *             (data.js `storeLayout`): one lit track through the cupboards of the order, first medicine → last,
 *             every cupboard on it lit (the current one brightly, collected ones green) and the trolley moving
 *             along the track to the current medicine.
 * On the short landscape panel (1024×600) — and on every screen in the LANDSCAPE layout mode (`h-short`, see
 * src/lib/layoutMode.js) — the same pieces sit in two columns instead: current medicine + list (the only thing
 * that scrolls) on the left, ring + scanner over the route map on the right.
 * Medicines can be scanned in any order. Result overlays (success / warning) are rendered by KioskPage.
 */
export default function ScannerScreen({
  pharmacy,
  order,
  team,
  layout,
  medicines,
  statuses,
  progress,
  allCollected,
  feedbackActive,
  onCancelRequest,
  onBackEmpty,
}) {
  const isEmpty = medicines.length === 0;

  // Which medicine the big card shows: the next un-collected one, unless the user tapped another row.
  // `undefined` = follow the next pack automatically; an id = the user's own choice (until the next scan).
  const nextIndex = statuses.findIndex((s) => s !== MEDICINE_STATUS.COLLECTED);
  const [manualId, setManualId] = useState(undefined);
  const currentIndex = manualId !== undefined ? medicines.findIndex((m) => m.id === manualId) : -1;
  const activeIndex = currentIndex >= 0 ? currentIndex : nextIndex;
  const activeMedicine = activeIndex >= 0 ? medicines[activeIndex] : null;
  const activeStatus = activeIndex >= 0 ? statuses[activeIndex] : undefined;
  const activeLocation = useMemo(() => resolveLocation(activeMedicine, layout), [activeMedicine, layout]);

  // A new scan should always re-follow the next pack to collect
  useEffect(() => {
    setManualId(undefined);
  }, [progress.collected]);

  return (
    <motion.section className="kiosk-screen" variants={screenVariants} initial="initial" animate="animate" exit="exit">
      <header
        className={cn(
          'relative flex h-16 h-short:h-14 shrink-0 items-center justify-between gap-3 border-b border-ot-border/60 px-4 md:px-5',
          // On a team-coloured page the header gets a translucent bar (dark on the dark teams, grey on the white team) so its text stays readable on every colour
          team && 'bg-ot-bg-top/60'
        )}
      >
        <PharmacyBrand name={pharmacy.name} logo={pharmacy.logo} size="sm" className="min-w-0 flex-1 max-w-[55%] md:max-w-[38%]" />

        {/* Title block is absolutely centred so it sits in the true middle of the page regardless of the side widths */}
        <div className="absolute left-1/2 top-1/2 hidden md:flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-tight whitespace-nowrap">
          <span className="text-lg font-semibold text-ot-text">Collect Your Medicines</span>
          {team && (
            <span className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-ot-text/85">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full ring-2 ring-ot-text/40" style={{ backgroundColor: team.from }} />
              {team.label} team
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="xl"
          className="h-11 shrink-0 px-3 md:px-4 text-base text-ot-text-muted hover:text-ot-text"
          onClick={onCancelRequest}
          aria-label="Start over"
        >
          <RotateCcw className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Start over</span>
        </Button>
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
          {/* Main slot: current medicine + collection list */}
          <MedicinePanel
            medicines={medicines}
            statuses={statuses}
            allCollected={allCollected}
            nextIndex={nextIndex}
            activeIndex={activeIndex}
            activeMedicine={activeMedicine}
            activeStatus={activeStatus}
            order={order}
            location={activeLocation}
            onSelect={setManualId}
          />

          {/* Bottom (tall / portrait): [progress square over the scanner] | route map.
              Short panel / landscape layout: right column — ring + scanner in one row on top (taller on taller
              screens), the map fills the rest. `h-short:h-auto` cancels the portrait row height there. */}
          <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-3 md:gap-4 h-tall:h-[28vh] h-xtall:h-[32vh] h-short:flex h-short:h-auto h-short:min-h-0 h-short:flex-col h-short:gap-3">
            <div className="flex min-h-0 min-w-0 flex-col gap-3 md:gap-4 h-short:h-[max(9.5rem,26vh)] h-short:shrink-0 h-short:flex-row">
              <ProgressRing progress={progress} className="w-full shrink-0 h-short:h-full h-short:w-auto" />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <AnimatePresence mode="wait" initial={false}>
                  {allCollected ? (
                    <AllCollectedCard key="all-collected" />
                  ) : (
                    <ScanPrompt key="scan-prompt" progress={progress} paused={feedbackActive} />
                  )}
                </AnimatePresence>
              </div>
            </div>
            <RoomMap
              layout={layout}
              medicines={medicines}
              statuses={statuses}
              activeIndex={activeIndex}
              allCollected={allCollected}
              className="min-h-0 h-short:flex-1"
            />
          </div>
        </div>
      )}
    </motion.section>
  );
}
