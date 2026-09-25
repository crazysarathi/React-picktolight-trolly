/**
 * Unit tests for the pure workflow reducer + order resolver (no React needed).
 * Run: npm run test:workflow
 */
import assert from 'node:assert/strict';
import {
  PHASES,
  SCAN_RESULT,
  MEDICINE_STATUS,
  createInitialState,
  evaluateScan,
  getMedicineStatus,
  getProgress,
  getRemainingMedicines,
  isOrderCollected,
  workflowReducer,
} from '../src/lib/workflow.js';
import { findOrderByBarcode, resolveOrder, resolvePatient, getKnownBarcodes } from '../src/lib/orders.js';
import { hexToRgb, mix, luminance, rgbToHsl, teamThemeVars, teamThemeMode } from '../src/lib/teamTheme.js';
import { normalizeLayout, resolveLocation, locationSegments, formatLocation } from '../src/lib/locations.js';

const catalogue = [
  { id: 'A', barcode: '891', name: 'Paracetamol 500mg', quantity: 1 },
  { id: 'B', barcode: '892', name: 'Vitamin D3', quantity: 2 },
  { id: 'C', barcode: '893', name: 'Amoxicillin 500mg', quantity: 1 },
];
const orders = [
  {
    barcode: '111001',
    reference: 'ORD-1001',
    teamColor: ' Red ',
    patient: { name: 'Kumar', age: 46, gender: 'Male', patientId: 'PT-1', phone: '98400 12345', doctor: 'Dr. N' },
    items: [{ medicineId: 'A' }, { medicineId: 'B', quantity: 3 }, { medicineId: 'C' }],
  },
  { barcode: '111002', reference: 'ORD-1002', items: [] },
  { barcode: '111003', reference: 'ORD-1003', customer: 'Legacy Name', items: [{ medicineId: 'B' }, { medicineId: 'C' }, { medicineId: 'B', quantity: 1 }] },
];
const meds = resolveOrder(orders[0], catalogue).medicines;

const r = workflowReducer;
const startOrder = (order = orders[0]) => {
  const resolved = resolveOrder(order, catalogue);
  return r(createInitialState(), { type: 'START_ORDER', order: resolved, medicines: resolved.medicines, at: 1 });
};
const collect = (s, barcode) => r(r(s, { type: 'SCAN', barcode }), { type: 'ADVANCE' });
let passed = 0;
const test = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
};

console.log('order resolver');

test('findOrderByBarcode resolves catalogue medicines, quantity overrides and patient details', () => {
  const o = findOrderByBarcode(' 111001 ', { orders, medicines: catalogue });
  assert.equal(o.reference, 'ORD-1001');
  assert.equal(o.medicines.length, 3);
  assert.equal(o.medicines[0].quantity, 1);
  assert.equal(o.medicines[1].quantity, 3);
  assert.equal(o.medicines[1].name, 'Vitamin D3');
  assert.deepEqual(o.patient, { name: 'Kumar', age: 46, gender: 'Male', patientId: 'PT-1', phone: '98400 12345', doctor: 'Dr. N' });
  assert.equal(o.teamColor, 'red'); // trimmed + lower-cased palette key
  assert.equal(resolveOrder(orders[1], catalogue).teamColor, null); // no teamColor → null
  assert.equal(findOrderByBarcode('119999', { orders, medicines: catalogue }), null);
  assert.equal(findOrderByBarcode('', { orders, medicines: catalogue }), null);
});

test('patient: legacy `customer` string becomes the name, missing details resolve to null', () => {
  assert.equal(resolveOrder(orders[2], catalogue).patient.name, 'Legacy Name');
  assert.equal(resolveOrder(orders[1], catalogue).patient, null);
  assert.equal(resolvePatient({ patient: { name: '  ' } }), null);
  assert.equal(resolvePatient({ patient: { phone: '1' } }).name, '');
});

test('same medicine twice in an order gets unique line ids', () => {
  const o = resolveOrder(orders[2], catalogue);
  assert.deepEqual(o.medicines.map((m) => m.id), ['B', 'C', 'B#2']);
  assert.equal(o.medicines[2].medicineId, 'B');
});

test('unknown medicineId lines are skipped, empty orders resolve to []', () => {
  const o = resolveOrder({ barcode: 'x', items: [{ medicineId: 'NOPE' }] }, catalogue);
  assert.deepEqual(o.medicines, []);
  assert.deepEqual(resolveOrder(orders[1], catalogue).medicines, []);
});

test('getKnownBarcodes lists order + medicine barcodes', () => {
  assert.deepEqual(getKnownBarcodes({ orders, medicines: catalogue }), ['111001', '111002', '111003', '891', '892', '893']);
});

console.log('workflow reducer');

test('kiosk opens on order-scan → START_ORDER → scanning with every medicine pending', () => {
  let s = createInitialState();
  assert.equal(s.phase, PHASES.ORDER_SCAN);
  s = startOrder();
  assert.equal(s.phase, PHASES.SCANNING);
  assert.equal(s.order.reference, 'ORD-1001');
  assert.equal(s.order.patient.name, 'Kumar');
  assert.equal(s.order.teamColor, 'red');
  assert.deepEqual(s.collectedIds, []);
  assert.equal(s.lastCollectedId, null);
  for (const m of meds) assert.equal(getMedicineStatus(s, m), MEDICINE_STATUS.PENDING);
  assert.deepEqual(getRemainingMedicines(s).map((m) => m.id), ['A', 'B', 'C']);
});

test('unknown main barcode (with 11 prefix) → order-not-found feedback, stays on order-scan; dismiss clears', () => {
  let s = createInitialState();
  s = r(s, { type: 'ORDER_NOT_FOUND', barcode: '114242', at: 5 });
  assert.equal(s.phase, PHASES.ORDER_SCAN);
  assert.equal(s.feedback.type, SCAN_RESULT.ORDER_NOT_FOUND);
  assert.equal(s.feedback.barcode, '114242');
  s = r(s, { type: 'DISMISS_FEEDBACK' });
  assert.equal(s.feedback, null);
  // ORDER_NOT_FOUND is ignored outside the order-scan/order-confirm phase
  const sc = startOrder();
  assert.equal(r(sc, { type: 'ORDER_NOT_FOUND', barcode: '111' }), sc);
});

test('invalid prescription prefix (not starting with 11) → invalid-prescription-prefix feedback', () => {
  let s = createInitialState();
  s = r(s, { type: 'INVALID_PRESCRIPTION_PREFIX', barcode: '156', at: 5 });
  assert.equal(s.phase, PHASES.ORDER_SCAN);
  assert.equal(s.feedback.type, SCAN_RESULT.INVALID_PRESCRIPTION_PREFIX);
  assert.equal(s.feedback.barcode, '156');
  s = r(s, { type: 'DISMISS_FEEDBACK' });
  assert.equal(s.feedback, null);
});

test('medicine scans are ignored outside the scanning phase', () => {
  const s = createInitialState();
  assert.equal(r(s, { type: 'SCAN', barcode: meds[0].barcode }), s);
});

test('scan → success feedback → ADVANCE marks that line collected', () => {
  let s = startOrder();
  s = r(s, { type: 'SCAN', barcode: ' 891 ' }); // whitespace tolerated
  assert.equal(s.feedback.type, SCAN_RESULT.SUCCESS);
  assert.equal(s.feedback.medicine.id, 'A');
  s = r(s, { type: 'ADVANCE' });
  assert.equal(s.feedback, null);
  assert.deepEqual(s.collectedIds, ['A']);
  assert.equal(s.lastCollectedId, 'A');
  assert.equal(getMedicineStatus(s, meds[0]), MEDICINE_STATUS.COLLECTED);
  assert.equal(getMedicineStatus(s, meds[1]), MEDICINE_STATUS.PENDING);
  assert.deepEqual(getProgress(s), { total: 3, collected: 1, remaining: 2, percent: 33 });
});

test('ANY order: the last medicine can be scanned first, then the middle one', () => {
  let s = startOrder();
  s = r(s, { type: 'SCAN', barcode: meds[2].barcode });
  assert.equal(s.feedback.type, SCAN_RESULT.SUCCESS);
  assert.equal(s.feedback.medicine.id, 'C');
  s = r(s, { type: 'ADVANCE' });
  s = collect(s, meds[1].barcode);
  assert.deepEqual(s.collectedIds, ['C', 'B']);
  assert.deepEqual(getRemainingMedicines(s).map((m) => m.id), ['A']);
  assert.equal(isOrderCollected(s), false);
  s = collect(s, meds[0].barcode);
  assert.equal(isOrderCollected(s), true);
});

test('unknown barcode → unknown, nothing changes', () => {
  let s = startOrder();
  s = r(s, { type: 'SCAN', barcode: '123' });
  assert.equal(s.feedback.type, SCAN_RESULT.UNKNOWN);
  assert.equal(s.feedback.medicine, null);
  s = r(s, { type: 'DISMISS_FEEDBACK' });
  assert.deepEqual(s.collectedIds, []);
});

test('already collected medicine → duplicate, nothing changes', () => {
  let s = collect(startOrder(), meds[0].barcode);
  s = r(s, { type: 'SCAN', barcode: meds[0].barcode });
  assert.equal(s.feedback.type, SCAN_RESULT.DUPLICATE);
  assert.equal(s.feedback.medicine.id, 'A');
  s = r(s, { type: 'DISMISS_FEEDBACK' });
  assert.deepEqual(s.collectedIds, ['A']);
  assert.equal(s.lastCollectedId, 'A');
});

test('same barcode re-fired while its result is on screen is ignored (double-fire)', () => {
  let s = startOrder();
  s = r(s, { type: 'SCAN', barcode: meds[0].barcode });
  const busy = s;
  s = r(s, { type: 'SCAN', barcode: meds[0].barcode });
  assert.equal(s, busy);
  assert.equal(s.scanCount, 1);
});

test('a different barcode scanned during a result is queued and processed when it closes', () => {
  let s = startOrder();
  s = r(s, { type: 'SCAN', barcode: meds[0].barcode });          // success shown
  s = r(s, { type: 'SCAN', barcode: meds[1].barcode });          // queued
  assert.equal(s.pendingScan.barcode, '892');
  s = r(s, { type: 'SCAN', barcode: '123' });                    // latest wins
  assert.equal(s.pendingScan.barcode, '123');
  s = r(s, { type: 'ADVANCE' });                                 // A collected, then pending 123 evaluated → unknown
  assert.deepEqual(s.collectedIds, ['A']);
  assert.equal(s.pendingScan, null);
  assert.equal(s.feedback.type, SCAN_RESULT.UNKNOWN);
  s = r(s, { type: 'DISMISS_FEEDBACK' });
  assert.equal(s.feedback, null);
});

test('queued medicine chains success → success', () => {
  let s = startOrder();
  s = r(s, { type: 'SCAN', barcode: meds[0].barcode });
  s = r(s, { type: 'SCAN', barcode: meds[2].barcode });
  s = r(s, { type: 'ADVANCE' });
  assert.equal(s.feedback.type, SCAN_RESULT.SUCCESS);
  assert.equal(s.feedback.medicine.id, 'C');
  s = r(s, { type: 'ADVANCE' });
  assert.deepEqual(s.collectedIds, ['A', 'C']);
});

test('DISMISS on success collects (tap-to-continue)', () => {
  let s = startOrder();
  s = r(s, { type: 'SCAN', barcode: meds[0].barcode });
  s = r(s, { type: 'DISMISS_FEEDBACK' });
  assert.deepEqual(s.collectedIds, ['A']);
});

test('ADVANCE without a success feedback is a no-op', () => {
  const s = startOrder();
  assert.equal(r(s, { type: 'ADVANCE' }), s);
  const unknown = r(s, { type: 'SCAN', barcode: '123' });
  assert.equal(r(unknown, { type: 'ADVANCE' }), unknown);
});

test('full run in reverse order: all collected → FINISH_ORDER → complete → RESET → order-scan', () => {
  let s = startOrder();
  for (const m of [...meds].reverse()) {
    s = r(s, { type: 'SCAN', barcode: m.barcode });
    assert.equal(s.feedback.type, SCAN_RESULT.SUCCESS, `expected success for ${m.id}`);
    s = r(s, { type: 'ADVANCE' });
  }
  assert.equal(isOrderCollected(s), true);
  assert.deepEqual(getRemainingMedicines(s), []);
  assert.equal(getProgress(s).percent, 100);
  assert.equal(r(s, { type: 'SCAN', barcode: meds[0].barcode }), s); // nothing left to collect → ignored
  s = r(s, { type: 'FINISH_ORDER', at: 5 });
  assert.equal(s.phase, PHASES.COMPLETE);
  s = r(s, { type: 'RESET' });
  assert.equal(s.phase, PHASES.ORDER_SCAN);
  assert.equal(s.order, null);
  assert.deepEqual(s.medicines, []);
  assert.deepEqual(s.collectedIds, []);
});

test('FINISH_ORDER before everything is collected is a no-op', () => {
  const s = startOrder();
  assert.equal(r(s, { type: 'FINISH_ORDER' }), s);
});

test('empty order: scanning phase, scans ignored, never "collected"', () => {
  const s = startOrder(orders[1]);
  assert.equal(s.phase, PHASES.SCANNING);
  assert.equal(isOrderCollected(s), false);
  assert.equal(r(s, { type: 'SCAN', barcode: '891' }), s);
  assert.equal(r(s, { type: 'FINISH_ORDER' }), s);
});

test('single-medicine order completes after one scan', () => {
  const s = collect(startOrder({ barcode: 'x', items: [{ medicineId: 'A' }] }), '891');
  assert.equal(isOrderCollected(s), true);
});

test('same product on two order lines: first open line is collected, then the second, then duplicate', () => {
  let s = startOrder(orders[2]); // B, C, B#2
  let res = evaluateScan(s, '892');
  assert.equal(res.type, SCAN_RESULT.SUCCESS);
  assert.equal(res.medicine.id, 'B');
  s = collect(s, '892');
  res = evaluateScan(s, '892');
  assert.equal(res.type, SCAN_RESULT.SUCCESS);
  assert.equal(res.medicine.id, 'B#2');
  s = collect(s, '892');
  assert.equal(evaluateScan(s, '892').type, SCAN_RESULT.DUPLICATE);
  s = collect(s, '893');
  assert.equal(isOrderCollected(s), true);
});

test('evaluateScan is case/whitespace tolerant', () => {
  const s = r(createInitialState(), { type: 'START_ORDER', medicines: [{ id: 'X', barcode: 'abc-123', name: 'X' }] });
  assert.equal(evaluateScan(s, ' ABC-123 ').type, SCAN_RESULT.SUCCESS);
  assert.equal(evaluateScan(s, '').type, SCAN_RESULT.IGNORED);
});

test('START_ORDER again mid-way starts a fresh order', () => {
  let s = collect(startOrder(), meds[0].barcode);
  s = r(s, { type: 'START_ORDER', medicines: meds });
  assert.deepEqual(s.collectedIds, []);
  assert.equal(s.lastCollectedId, null);
  assert.equal(s.feedback, null);
});

console.log('order confirmation (ORDER_FOUND → CONFIRM_ORDER)');

const foundOrder = (order = orders[0]) => {
  const resolved = resolveOrder(order, catalogue);
  return r(createInitialState(), { type: 'ORDER_FOUND', order: resolved, medicines: resolved.medicines, at: 7 });
};

test('ORDER_FOUND → order-confirm with the order loaded but nothing collected; CONFIRM_ORDER → scanning', () => {
  let s = foundOrder();
  assert.equal(s.phase, PHASES.ORDER_CONFIRM);
  assert.equal(s.order.reference, 'ORD-1001');
  assert.equal(s.medicines.length, 3);
  assert.equal(s.foundAt, 7);
  assert.equal(s.order.teamColor, 'red');
  assert.deepEqual(s.collectedIds, []);
  s = r(s, { type: 'CONFIRM_ORDER', at: 9 });
  assert.equal(s.phase, PHASES.SCANNING);
  assert.equal(s.startedAt, 9);
  assert.equal(s.order.reference, 'ORD-1001');
  for (const m of s.medicines) assert.equal(getMedicineStatus(s, m), MEDICINE_STATUS.PENDING);
});

test('while confirming: medicine scans are ignored, unknown order barcodes are ignored, another order replaces the pending one', () => {
  const s = foundOrder();
  assert.equal(r(s, { type: 'SCAN', barcode: meds[0].barcode }), s);
  assert.equal(r(s, { type: 'ORDER_NOT_FOUND', barcode: '4242' }), s);
  const other = resolveOrder(orders[2], catalogue);
  const s2 = r(s, { type: 'ORDER_FOUND', order: other, medicines: other.medicines, at: 8 });
  assert.equal(s2.phase, PHASES.ORDER_CONFIRM);
  assert.equal(s2.order.reference, 'ORD-1003');
  assert.equal(s2.medicines.length, 3);
});

test('CONFIRM_ORDER outside order-confirm is a no-op; ORDER_FOUND is ignored once scanning; RESET cancels the confirmation', () => {
  const idle = createInitialState();
  assert.equal(r(idle, { type: 'CONFIRM_ORDER' }), idle);
  const scanning = startOrder();
  assert.equal(r(scanning, { type: 'CONFIRM_ORDER' }), scanning);
  const resolved = resolveOrder(orders[2], catalogue);
  assert.equal(r(scanning, { type: 'ORDER_FOUND', order: resolved, medicines: resolved.medicines }), scanning);
  const cancelled = r(foundOrder(), { type: 'RESET', phase: PHASES.ORDER_SCAN });
  assert.equal(cancelled.phase, PHASES.ORDER_SCAN);
  assert.equal(cancelled.order, null);
  assert.deepEqual(cancelled.medicines, []);
});

test('confirmed order runs to completion like a direct start', () => {
  let s = r(foundOrder(), { type: 'CONFIRM_ORDER', at: 1 });
  for (const m of meds) s = collect(s, m.barcode);
  assert.equal(isOrderCollected(s), true);
  s = r(s, { type: 'FINISH_ORDER', at: 2 });
  assert.equal(s.phase, PHASES.COMPLETE);
});

console.log('team theme');

test('teamThemeVars derives every theme variable from the team\'s from/to colours (dark theme)', () => {
  const vars = teamThemeVars({ key: 'red', from: '#dc2626', to: '#7f1d1d' });
  const rgbKeys = [
    '--ot-bg-top', '--ot-bg-mid', '--ot-bg-bottom', '--ot-surface-top', '--ot-surface-bottom',
    '--ot-surface-elev-top', '--ot-surface-elev-bottom', '--ot-btn-secondary-top', '--ot-btn-secondary-bottom',
    '--ot-text', '--ot-text-muted', '--ot-action', '--ot-action-fill', '--ot-action-fg', '--ot-action-hover', '--ot-border',
    '--ot-ok-100', '--ot-ok-300', '--ot-ok-400', '--ot-warn-100', '--ot-warn-300', '--ot-warn-400',
  ];
  assert.deepEqual(Object.keys(vars), [...rgbKeys, '--ring', '--background']);
  for (const k of rgbKeys) assert.match(vars[k], /^\d{1,3} \d{1,3} \d{1,3}$/, k);
  for (const k of ['--ring', '--background']) assert.match(vars[k], /^\d{1,3} \d{1,3}% \d{1,3}%$/, k);
  const lum = (s) => s.split(' ').reduce((a, b) => a + Number(b), 0);
  assert.equal(teamThemeMode({ from: '#dc2626', to: '#7f1d1d' }), 'dark');
  assert.ok(lum(vars['--ot-surface-top']) < lum('127 29 29'), 'cards are darker than the page colour');
  assert.equal(vars['--ot-text'], '255 255 255', 'dark theme: white text');
  assert.ok(lum(vars['--ot-text-muted']) > lum('220 38 38'), 'muted text is a pale tint of the team colour');
  assert.ok(lum(vars['--ot-action']) > lum('220 38 38'), 'accent text is a light tint of the team colour');
  assert.equal(vars['--ot-action-fill'], '220 38 38', 'solid buttons use the vivid team colour');
  assert.equal(vars['--ot-action-fg'], '255 255 255', 'red buttons get white text');
  assert.equal(vars['--ot-ok-400'], '52 211 153', 'dark theme keeps emerald-400');
  assert.equal(vars['--ot-warn-300'], '252 211 77', 'dark theme keeps amber-300');
  const yellow = teamThemeVars({ key: 'yellow', from: '#ffff00', to: '#b39700' });
  assert.equal(teamThemeMode({ from: '#ffff00', to: '#b39700' }), 'dark', 'pure yellow (dark `to`) stays a dark theme');
  assert.equal(yellow['--ot-text'], '255 255 255');
  assert.equal(yellow['--ot-action-fill'], '255 255 0');
  assert.notEqual(yellow['--ot-action-fg'], '255 255 255', 'yellow buttons get dark text');
  assert.ok(luminance(hexToRgb('#ffff00')) > luminance(hexToRgb('#dc2626')));
  assert.equal(luminance([255, 255, 255]), 1);
  assert.equal(rgbToHsl([255, 0, 0]), '0 100% 50%');
  assert.equal(rgbToHsl([0, 0, 0]), '0 0% 0%');
  assert.deepEqual(hexToRgb('#7f1d1d'), [127, 29, 29]);
  assert.deepEqual(hexToRgb('#abc'), [170, 187, 204]);
  assert.equal(hexToRgb('red'), null);
  assert.deepEqual(mix([100, 100, 100], [0, 0, 0], 0.5), [50, 50, 50]);
  assert.equal(teamThemeVars({ from: 'red', to: '#000' }), null); // invalid colour → default theme
  assert.equal(teamThemeVars(null), null);
  assert.equal(teamThemeMode({ from: 'red', to: '#000' }), null);
  assert.equal(teamThemeMode(undefined), null);
});

test('a light team (white) flips to the light theme: light surfaces, black text, black accents and buttons', () => {
  const team = { key: 'white', from: '#ffffff', to: '#d4d4d8' };
  const vars = teamThemeVars(team);
  const dark = teamThemeVars({ key: 'red', from: '#dc2626', to: '#7f1d1d' });
  assert.deepEqual(Object.keys(vars), Object.keys(dark), 'same variable set as the dark theme');
  const lum = (s) => luminance(s.split(' ').map(Number));
  assert.equal(teamThemeMode(team), 'light');
  assert.equal(vars['--ot-text'], '0 0 0', 'text is black');
  assert.ok(lum(vars['--ot-surface-top']) > 0.7 && lum(vars['--ot-surface-bottom']) > 0.6, 'cards are light');
  assert.ok(lum(vars['--ot-bg-bottom']) > lum(vars['--ot-surface-top']), 'the scan zone is a lighter well inside the card');
  assert.ok(lum(vars['--ot-bg-top']) < lum(vars['--ot-surface-bottom']), 'header bar / overlay backdrop are a deeper grey');
  assert.ok(lum(vars['--ot-action']) < 0.05, 'accent (labels, icons, borders, scan frame) is near-black');
  assert.equal(vars['--ot-action-fill'], vars['--ot-action'], 'solid buttons are the same near-black');
  assert.equal(vars['--ot-action-fg'], '255 255 255', '… with white text on them');
  assert.ok(lum(vars['--ot-action-hover']) > lum(vars['--ot-action-fill']), 'hover lightens the black button a little');
  assert.ok(lum(vars['--ot-text-muted']) < 0.2, 'muted text is a dark grey');
  assert.ok(lum(vars['--ot-border']) < 0.3, 'borders are mid/dark grey');
  assert.equal(vars['--ot-ok-400'], '4 120 87', 'status green darkens to emerald-700');
  assert.equal(vars['--ot-ok-100'], '6 78 59');
  assert.equal(vars['--ot-warn-400'], '217 119 6', 'status amber darkens to amber-600');
  assert.equal(vars['--ot-warn-100'], '69 26 3', 'warning body text is a deep amber');
  for (const k of ['--ot-ok-100', '--ot-ok-300', '--ot-ok-400', '--ot-warn-100', '--ot-warn-300', '--ot-warn-400']) {
    assert.ok(lum(vars[k]) < lum(dark[k]), `${k} is darker on the light theme`);
  }
  // the flip is decided by `to`: a white team with a dark grey `to` is still a dark theme
  assert.equal(teamThemeMode({ from: '#ffffff', to: '#404040' }), 'dark');
  assert.equal(teamThemeVars({ from: '#ffffff', to: '#404040' })['--ot-text'], '255 255 255');
});

console.log('medicine locations (route map)');

const layout = {
  entranceLabel: ' Entrance ',
  walls: [
    { id: 'a', label: 'Wall A', side: 'left', cupboards: 3, shelves: 4 },
    { id: 'B', side: 'back', cupboards: 4, shelves: 5 },
    { id: 'C', label: 'Wall C', side: 'right', cupboards: 3, shelves: 4 },
  ],
};

test('normalizeLayout trims / upper-cases wall ids, fills labels, sides and counts, drops duplicates', () => {
  const l = normalizeLayout(layout);
  assert.equal(l.entranceLabel, 'Entrance');
  assert.deepEqual(l.walls.map((w) => w.id), ['A', 'B', 'C']);
  assert.equal(l.walls[1].label, 'Wall B');
  assert.deepEqual(l.walls.map((w) => w.side), ['left', 'back', 'right']);
  const loose = normalizeLayout({ walls: [{ id: 'x' }, { id: 'x' }, { id: 'y', side: 'top', cupboards: '2', shelves: 0 }] });
  assert.deepEqual(loose.walls.map((w) => [w.id, w.side, w.cupboards, w.shelves]), [['X', 'left', 1, 1], ['Y', 'back', 2, 1]]);
  assert.equal(loose.entranceLabel, 'Entrance');
  assert.deepEqual(normalizeLayout(null).walls, []);
});

test('resolveLocation maps a medicine onto its wall / cupboard / shelf and says whether the map can light it', () => {
  const loc = resolveLocation({ location: { wall: 'a', cupboard: 2, shelf: 3 } }, layout);
  assert.deepEqual(loc, { wallId: 'A', wallLabel: 'Wall A', side: 'left', cupboard: 2, shelf: 3, key: 'A2', onMap: true });
  assert.equal(resolveLocation({ location: { wall: 'B', cupboard: 4, shelf: 1 } }, layout).side, 'back');
  // unknown wall / cupboard out of range: text still available, nothing to light
  const off = resolveLocation({ location: { wall: 'Z', cupboard: 1, shelf: 1 } }, layout);
  assert.equal(off.onMap, false);
  assert.equal(off.wallLabel, 'Wall Z');
  assert.equal(off.side, null);
  assert.equal(resolveLocation({ location: { wall: 'A', cupboard: 9, shelf: 1 } }, layout).onMap, false);
  assert.equal(resolveLocation({ location: { wall: 'A', cupboard: '2', shelf: '1' } }, layout).key, 'A2'); // numeric strings accepted
  // no / empty location
  assert.equal(resolveLocation({ name: 'x' }, layout), null);
  assert.equal(resolveLocation({ location: {} }, layout), null);
  assert.equal(resolveLocation(null, layout), null);
});

test('order lines keep the catalogue location; strip segments + text formatting', () => {
  const cat = [{ id: 'A', barcode: '891', name: 'P', location: { wall: 'C', cupboard: 1, shelf: 4 } }];
  const line = resolveOrder({ barcode: '111009', items: [{ medicineId: 'A' }] }, cat).medicines[0];
  const loc = resolveLocation(line, layout);
  assert.deepEqual(locationSegments(loc), [
    { label: 'Wall', value: 'C' },
    { label: 'Cupboard', value: 1 },
    { label: 'Shelf', value: 4 },
  ]);
  assert.equal(formatLocation(loc), 'Wall C · Cupboard 1 · Shelf 4');
  assert.deepEqual(locationSegments(resolveLocation({ location: { wall: 'B' } }, layout)), [{ label: 'Wall', value: 'B' }]);
  assert.deepEqual(locationSegments(null), []);
  assert.equal(formatLocation(null), '');
});

console.log(`\n${passed} tests passed`);
