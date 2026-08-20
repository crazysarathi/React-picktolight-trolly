/**
 * Pure, framework-free collection workflow.
 * (Unit-tested by scripts/workflow.test.mjs — keep this file free of React/DOM.)
 *
 * Phases:  order-scan (main barcode) → order-confirm (customer taps START) → scanning (medicines, in ANY order)
 *          → complete → order-scan
 *          (ORDER_FOUND → CONFIRM_ORDER is the confirmed path; START_ORDER skips the confirmation.)
 *
 * State shape:
 *   phase            order-scan | order-confirm | scanning | complete
 *   order            { barcode, reference, patient } of the active order (null before a main barcode is scanned)
 *   medicines        list to collect for the current order (display order only — scan them in any sequence)
 *   collectedIds     ids already collected
 *   lastCollectedId  id of the most recently collected line (null until the first scan)
 *   feedback         null | { id, type: success|unknown|duplicate|order-not-found, medicine?, barcode }
 *   pendingScan      a scan that arrived while feedback was on screen; processed as soon as it closes
 *   scanCount        total scans evaluated in this order
 */

export const PHASES = Object.freeze({
  ORDER_SCAN: 'order-scan',
  ORDER_CONFIRM: 'order-confirm', // order barcode recognised, waiting for the customer to tap START
  SCANNING: 'scanning',
  COMPLETE: 'complete',
});

export const SCAN_RESULT = Object.freeze({
  SUCCESS: 'success',                 // scanned a medicine of the order that was still to collect
  UNKNOWN: 'unknown',                 // barcode not part of this order
  DUPLICATE: 'duplicate',             // medicine already collected
  ORDER_NOT_FOUND: 'order-not-found', // main barcode does not match any order
  IGNORED: 'ignored',                 // not in scanning phase / empty order / everything already collected
});

export const MEDICINE_STATUS = Object.freeze({
  COLLECTED: 'collected',
  PENDING: 'pending',
});

export function normalizeBarcode(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

export function createInitialState({ phase = PHASES.ORDER_SCAN } = {}) {
  return {
    phase,
    order: null,
    medicines: [],
    collectedIds: [],
    lastCollectedId: null,
    feedback: null,
    pendingScan: null,
    scanCount: 0,
    foundAt: null,
    startedAt: null,
    completedAt: null,
  };
}

/** { order, medicines } of a START_ORDER / ORDER_FOUND action, normalised. */
const orderPayload = (action) => ({
  medicines: Array.isArray(action.medicines) ? action.medicines.filter(Boolean) : [],
  order: action.order
    ? {
        barcode: action.order.barcode,
        reference: action.order.reference,
        patient: action.order.patient ?? null,
      }
    : null,
});

const isCollected = (state, medicine) => state.collectedIds.includes(medicine.id);

/** Medicines of the order that still have to be collected (in display order). */
export function getRemainingMedicines(state) {
  return state.medicines.filter((m) => !isCollected(state, m));
}

/** True when every medicine of a non-empty order is collected. */
export function isOrderCollected(state) {
  return state.medicines.length > 0 && state.medicines.every((m) => isCollected(state, m));
}

export function getMedicineStatus(state, medicine) {
  if (medicine && isCollected(state, medicine)) return MEDICINE_STATUS.COLLECTED;
  return MEDICINE_STATUS.PENDING;
}

export function getProgress(state) {
  const total = state.medicines.length;
  const collected = state.medicines.filter((m) => isCollected(state, m)).length;
  return {
    total,
    collected,
    remaining: Math.max(0, total - collected),
    percent: total === 0 ? 0 : Math.round((collected / total) * 100),
  };
}

/**
 * Classify a medicine barcode against the current workflow state (no side effects).
 * Order does not matter: any not-yet-collected medicine of the order is a success.
 */
export function evaluateScan(state, rawBarcode) {
  const barcode = normalizeBarcode(rawBarcode);

  if (state.phase !== PHASES.SCANNING || !barcode || state.medicines.length === 0 || isOrderCollected(state)) {
    return { type: SCAN_RESULT.IGNORED, barcode, medicine: null };
  }

  const candidates = state.medicines.filter((m) => normalizeBarcode(m.barcode) === barcode);
  if (candidates.length === 0) {
    return { type: SCAN_RESULT.UNKNOWN, barcode, medicine: null };
  }
  // An order may list the same product twice → collect the first line that is still open
  const open = candidates.find((m) => !isCollected(state, m));
  if (!open) {
    return { type: SCAN_RESULT.DUPLICATE, barcode, medicine: candidates[0] };
  }
  return { type: SCAN_RESULT.SUCCESS, barcode, medicine: open };
}

const withFeedback = (state, result, action) => {
  const scanCount = state.scanCount + 1;
  return {
    ...state,
    scanCount,
    feedback: {
      id: scanCount,
      at: action.at ?? null,
      source: action.source ?? 'unknown',
      ...result,
    },
  };
};

/** After feedback closes, process the scan that arrived meanwhile (if any). */
const drainPending = (state) => {
  if (!state.pendingScan) return state;
  const pending = state.pendingScan;
  return workflowReducer({ ...state, pendingScan: null }, { type: 'SCAN', ...pending });
};

export function workflowReducer(state, action) {
  switch (action.type) {
    case 'START_ORDER': {
      // Direct start (no confirmation step)
      const { order, medicines } = orderPayload(action);
      return {
        ...createInitialState({ phase: PHASES.SCANNING }),
        order,
        medicines,
        startedAt: action.at ?? null,
      };
    }

    case 'ORDER_FOUND': {
      // Main barcode recognised: show the order and wait for START. Scanning another order slip
      // while the confirmation is open simply replaces the pending order.
      if (state.phase !== PHASES.ORDER_SCAN && state.phase !== PHASES.ORDER_CONFIRM) return state;
      const { order, medicines } = orderPayload(action);
      return {
        ...createInitialState({ phase: PHASES.ORDER_CONFIRM }),
        order,
        medicines,
        foundAt: action.at ?? null,
      };
    }

    case 'CONFIRM_ORDER': {
      if (state.phase !== PHASES.ORDER_CONFIRM) return state;
      return { ...state, phase: PHASES.SCANNING, feedback: null, pendingScan: null, startedAt: action.at ?? null };
    }

    case 'ORDER_NOT_FOUND': {
      if (state.phase !== PHASES.ORDER_SCAN) return state;
      const barcode = normalizeBarcode(action.barcode);
      if (!barcode) return state;
      return withFeedback(state, { type: SCAN_RESULT.ORDER_NOT_FOUND, barcode, medicine: null }, action);
    }

    case 'SCAN': {
      if (state.phase !== PHASES.SCANNING) return state;
      const barcode = normalizeBarcode(action.barcode);
      if (!barcode) return state;
      if (state.feedback) {
        // A result is on screen: the same barcode again is a scanner double-fire → ignore;
        // a different barcode is kept and processed as soon as the result closes.
        if (state.feedback.barcode === barcode) return state;
        return { ...state, pendingScan: { barcode, at: action.at ?? null, source: action.source ?? 'unknown' } };
      }
      const result = evaluateScan(state, barcode);
      if (result.type === SCAN_RESULT.IGNORED) return state;
      return withFeedback(state, result, action);
    }

    case 'ADVANCE': {
      // Called when the success confirmation has been shown: mark the scanned line collected
      const fb = state.feedback;
      if (!fb || fb.type !== SCAN_RESULT.SUCCESS || !fb.medicine) return state;
      const collectedIds = state.collectedIds.includes(fb.medicine.id)
        ? state.collectedIds
        : [...state.collectedIds, fb.medicine.id];
      return drainPending({
        ...state,
        collectedIds,
        lastCollectedId: fb.medicine.id,
        feedback: null,
      });
    }

    case 'DISMISS_FEEDBACK': {
      if (!state.feedback) return state;
      if (state.feedback.type === SCAN_RESULT.SUCCESS) {
        return workflowReducer(state, { type: 'ADVANCE' });
      }
      return drainPending({ ...state, feedback: null });
    }

    case 'FINISH_ORDER': {
      if (state.phase !== PHASES.SCANNING || !isOrderCollected(state)) return state;
      return { ...state, phase: PHASES.COMPLETE, feedback: null, pendingScan: null, completedAt: action.at ?? null };
    }

    case 'RESET': {
      return createInitialState({ phase: action.phase ?? PHASES.ORDER_SCAN });
    }

    default:
      return state;
  }
}
