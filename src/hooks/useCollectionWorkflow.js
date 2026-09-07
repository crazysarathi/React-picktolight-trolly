import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useScanner } from 'hooks/useScanner';
import { findOrderByBarcode } from 'lib/orders';
import {
  PHASES,
  createInitialState,
  getMedicineStatus,
  getProgress,
  getRemainingMedicines,
  isOrderCollected,
  workflowReducer,
} from 'lib/workflow';

/**
 * Connects the pure workflow reducer to React, the scanner service and timers.
 *
 *   scanner → (order-scan / order-confirm phase) look the MAIN barcode up in `orders`
 *             → ORDER_FOUND (customer taps START → CONFIRM_ORDER) or, with confirmOrderStart=false, START_ORDER
 *             → unknown barcode → ORDER_NOT_FOUND
 *   scanner → (scanning phase)   dispatch(SCAN) → feedback shown → (timer) ADVANCE / DISMISS
 *   medicines may be scanned in any order; once every line is collected → FINISH_ORDER
 */
export function useCollectionWorkflow({ orders, medicines, config, scanEnabled = true }) {
  const [state, dispatch] = useReducer(workflowReducer, undefined, () => createInitialState());

  const stateRef = useRef(state);
  stateRef.current = state;

  // Every scanner source (test input, USB keyboard-wedge, …) ends up here
  useScanner(
    useCallback(
      (scan) => {
        const phase = stateRef.current.phase;
        if (phase === PHASES.ORDER_SCAN || phase === PHASES.ORDER_CONFIRM) {
          const code = String(scan.barcode ?? '').trim().replace(/\s+/g, '');
          if (!code.startsWith('11')) {
            dispatch({ type: 'INVALID_PRESCRIPTION_PREFIX', barcode: scan.barcode, at: scan.timestamp, source: scan.source });
          } else {
            const order = findOrderByBarcode(scan.barcode, { orders, medicines });
            if (order) {
              const type = config.confirmOrderStart === false ? 'START_ORDER' : 'ORDER_FOUND';
              dispatch({ type, order, medicines: order.medicines, at: scan.timestamp });
            } else {
              dispatch({ type: 'ORDER_NOT_FOUND', barcode: scan.barcode, at: scan.timestamp, source: scan.source });
            }
          }
        } else if (phase === PHASES.SCANNING) {
          dispatch({ type: 'SCAN', barcode: scan.barcode, at: scan.timestamp, source: scan.source });
        }
        // complete: scans are ignored
      },
      [orders, medicines, config.confirmOrderStart]
    ),
    { enabled: scanEnabled }
  );

  // Auto-dismiss feedback: success → mark collected, otherwise → just close the message
  const { feedback } = state;
  const timings = config.timings;
  useEffect(() => {
    if (!feedback) return undefined;
    const duration =
      feedback.type === 'success'
        ? timings.successMs
        : feedback.type === 'duplicate'
          ? timings.duplicateMs
          : timings.errorMs;
    const timer = setTimeout(() => {
      dispatch({ type: feedback.type === 'success' ? 'ADVANCE' : 'DISMISS_FEEDBACK' });
    }, duration);
    return () => clearTimeout(timer);
  }, [feedback, timings]);

  // When the last medicine is collected, pause briefly (final check-mark) then show completion
  const allCollected = isOrderCollected(state);
  useEffect(() => {
    if (state.phase !== PHASES.SCANNING || !allCollected) return undefined;
    const timer = setTimeout(() => dispatch({ type: 'FINISH_ORDER', at: Date.now() }), timings.completionDelayMs);
    return () => clearTimeout(timer);
  }, [state.phase, allCollected, timings.completionDelayMs]);

  // Abandoned order: no touch / scan for idleTimeoutMs while confirming, scanning or on the completion screen → start fresh
  const idleMs = timings.idleTimeoutMs || 0;
  const activePhase =
    state.phase === PHASES.ORDER_CONFIRM || state.phase === PHASES.SCANNING || state.phase === PHASES.COMPLETE;
  useEffect(() => {
    if (!idleMs || !activePhase) return undefined;
    let timer = null;
    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => dispatch({ type: 'RESET', phase: PHASES.ORDER_SCAN }), idleMs);
    };
    arm();
    const events = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, arm));
    };
    // re-arm whenever a scan changes state (scanCount) as well as on user input
  }, [idleMs, activePhase, state.scanCount]);

  const actions = useMemo(
    () => ({
      dismissFeedback: () => dispatch({ type: 'DISMISS_FEEDBACK' }),
      confirmOrder: () => dispatch({ type: 'CONFIRM_ORDER', at: Date.now() }),
      cancelOrder: () => dispatch({ type: 'RESET', phase: PHASES.ORDER_SCAN }),
      completeOrder: () => dispatch({ type: 'RESET', phase: PHASES.ORDER_SCAN }),
    }),
    []
  );

  const progress = getProgress(state);
  const statuses = useMemo(() => state.medicines.map((m) => getMedicineStatus(state, m)), [state]);
  const remaining = useMemo(() => getRemainingMedicines(state), [state]);

  return { state, actions, progress, statuses, remaining, allCollected };
}

export default useCollectionWorkflow;
