import React, { useEffect, useLayoutEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { pharmacyData, medicines, orders, kioskConfig, teamColors, storeLayout } from 'data/data';
import { initScanner } from 'services/scanner';
import { useCollectionWorkflow } from 'hooks/useCollectionWorkflow';
import { getKnownBarcodes } from 'lib/orders';
import { PHASES } from 'lib/workflow';
import OrderScanScreen from 'components/kiosk/OrderScanScreen';
import ScannerScreen from 'components/kiosk/ScannerScreen';
import ScanSuccess from 'components/kiosk/ScanSuccess';
import ScanError from 'components/kiosk/ScanError';
import CompletionScreen from 'components/kiosk/CompletionScreen';
import TestScannerPanel from 'components/kiosk/TestScannerPanel';
import ConfirmOverlay from 'components/kiosk/ConfirmOverlay';
import OrderConfirmOverlay from 'components/kiosk/OrderConfirmOverlay';
import TeamBackdrop from 'components/kiosk/TeamBackdrop';
import { teamThemeVars } from 'lib/teamTheme';
import { loadLayoutMode, saveLayoutMode, applyLayoutMode } from 'lib/layoutMode';
import { cn } from 'lib/utils';

/**
 * Kiosk orchestration:
 *   order-scan (main barcode) → order-confirm ("Order found — START?" on the same page)
 *   → scanning (medicines in any order, with success / warning overlays)
 *   → complete → COMPLETE → order-scan (next customer)
 * All data comes from data.js; all scans come through the scanner service.
 */
export default function KioskPage() {
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Screen layout — portrait (one column) or landscape (compact two columns), see lib/layoutMode.js. Chosen with
  // the toggle on the order-scan page, remembered on the device; applied as `data-layout` on <html> before paint.
  const [layoutMode, setLayoutMode] = useState(() => loadLayoutMode(kioskConfig.layout?.default));
  useLayoutEffect(() => {
    applyLayoutMode(layoutMode);
  }, [layoutMode]);
  const changeLayoutMode = useCallback((mode) => {
    setLayoutMode(mode);
    saveLayoutMode(mode);
  }, []);

  const { state, actions, progress, statuses, remaining, allCollected } = useCollectionWorkflow({
    orders,
    medicines,
    config: kioskConfig,
    scanEnabled: !confirmCancel, // pause scanning while the "Start over?" question is open
  });

  // Wire scanner sources once (keyboard-wedge for a real scanner + the temporary test adapter)
  const knownBarcodes = useMemo(() => getKnownBarcodes({ orders, medicines }), []);
  useEffect(
    () =>
      initScanner({
        keyboardWedge: kioskConfig.scanner.keyboardWedge,
        testScannerEnabled: kioskConfig.testScanner.enabled,
        knownBarcodes,
      }),
    [knownBarcodes]
  );

  useEffect(() => {
    document.title = `${pharmacyData.name} · Medicine Collection Kiosk`;
  }, []);

  const { phase, feedback } = state;
  const confirmingOrder = phase === PHASES.ORDER_CONFIRM;

  // Picking team of the active order (data.js `teamColors`): from the START confirmation through the collection
  // and completion screens the WHOLE kiosk is re-tinted in its colour (only the order-scan page stays navy) — the page background (TeamBackdrop) plus every card, tile,
  // button and overlay via the theme CSS variables (lib/teamTheme.js) set on .kiosk-root below.
  // Unknown keys fall back to the default navy theme.
  const teamKey = state.order?.teamColor ?? null;
  const orderRef = state.order?.reference;
  const team = useMemo(() => (teamKey && teamColors[teamKey] ? { key: teamKey, ...teamColors[teamKey] } : null), [teamKey]);
  useEffect(() => {
    if (teamKey && !teamColors[teamKey]) {
      console.warn(`[orders] order ${orderRef}: unknown teamColor "${teamKey}" — add it to teamColors in data.js`);
    }
  }, [teamKey, orderRef]);
  const showTeam = Boolean(team) && (confirmingOrder || phase === PHASES.SCANNING || phase === PHASES.COMPLETE);
  const themeVars = useMemo(() => (showTeam ? teamThemeVars(team) : null), [showTeam, team]);

  // The confirmation only makes sense while scanning (idle reset / completion close it)
  useEffect(() => {
    if (phase !== PHASES.SCANNING) setConfirmCancel(false);
  }, [phase]);

  const requestCancel = useCallback(() => setConfirmCancel(true), []);
  const confirmCancelOrder = useCallback(() => {
    setConfirmCancel(false);
    actions.cancelOrder();
  }, [actions]);

  const testEnabled = kioskConfig.testScanner.enabled;
  const showTestPanel = testEnabled && phase === PHASES.SCANNING && state.medicines.length > 0;
  const remainingBarcodes = useMemo(() => remaining.map((m) => m.barcode), [remaining]);

  return (
    <div
      className={cn('kiosk-root', kioskConfig.hideCursor && 'kiosk-no-cursor')}
      data-team={showTeam ? team.key : undefined}
      style={themeVars || undefined}
    >
      {/* Team-coloured page background (under every screen) while an order is open */}
      <TeamBackdrop team={showTeam ? team : null} />

      <AnimatePresence mode="wait">
        {(phase === PHASES.ORDER_SCAN || confirmingOrder) && (
          <OrderScanScreen
            key="order-scan"
            pharmacy={pharmacyData}
            orders={orders}
            showTestInput={testEnabled}
            backgroundMotion={kioskConfig.backgroundMotion}
            feedbackActive={Boolean(feedback) || confirmingOrder}
            layoutMode={layoutMode}
            onLayoutModeChange={kioskConfig.layout?.toggle === false ? undefined : changeLayoutMode}
          />
        )}
        {phase === PHASES.SCANNING && (
          <ScannerScreen
            key="scanning"
            pharmacy={pharmacyData}
            order={state.order}
            team={team}
            layout={storeLayout}
            medicines={state.medicines}
            statuses={statuses}
            progress={progress}
            allCollected={allCollected}
            feedbackActive={Boolean(feedback)}
            onCancelRequest={requestCancel}
            onBackEmpty={actions.cancelOrder}
          />
        )}
        {phase === PHASES.COMPLETE && (
          <CompletionScreen
            key="complete"
            pharmacy={pharmacyData}
            order={state.order}
            team={team}
            medicines={state.medicines}
            backgroundMotion={kioskConfig.backgroundMotion}
            onComplete={actions.completeOrder}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTestPanel && <TestScannerPanel key="test-panel" remainingBarcodes={remainingBarcodes} />}
      </AnimatePresence>

      {/* Result overlays sit above everything (fixed) so they are never clipped by screen transitions */}
      <AnimatePresence>
        {confirmingOrder && (
          <OrderConfirmOverlay
            key="order-confirm"
            order={state.order}
            team={team}
            medicines={state.medicines}
            onStart={actions.confirmOrder}
            onCancel={actions.cancelOrder}
          />
        )}
        {feedback && feedback.type === 'success' && (
          <ScanSuccess
            key={`success-${feedback.id}`}
            feedback={feedback}
            collectedAfter={progress.collected + 1}
            total={progress.total}
            onContinue={actions.dismissFeedback}
          />
        )}
        {feedback && feedback.type !== 'success' && (
          <ScanError
            key={`error-${feedback.id}`}
            feedback={feedback}
            helpNote={pharmacyData.helpNote}
            remaining={progress.remaining}
            onDismiss={actions.dismissFeedback}
          />
        )}
        {confirmCancel && phase === PHASES.SCANNING && (
          <ConfirmOverlay
            key="confirm-cancel"
            onConfirm={confirmCancelOrder}
            onCancel={() => setConfirmCancel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
