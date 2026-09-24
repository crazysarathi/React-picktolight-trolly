import { normalizeBarcode } from './workflow.js';

/**
 * Resolve the MAIN (order) barcode into the list of medicines to collect.
 * Pure function over data.js structures — swap it for an API call later without touching the UI.
 *
 * Returns null when the barcode is not a known order, otherwise
 *   { barcode, reference, patient, teamColor, medicines: [ { ...catalogueMedicine, id (unique per line), quantity } ] }
 */
export function findOrderByBarcode(rawBarcode, { orders = [], medicines = [] } = {}) {
  const code = normalizeBarcode(rawBarcode);
  if (!code) return null;
  const order = orders.find((o) => normalizeBarcode(o.barcode) === code);
  if (!order) return null;
  return resolveOrder(order, medicines);
}

/** Patient details as shown on the scanning screen. `customer` (older data files) is accepted as the name. */
export function resolvePatient(order = {}) {
  const raw = order.patient && typeof order.patient === 'object' ? order.patient : {};
  const patient = {
    name: String(raw.name ?? order.customer ?? '').trim(),
    age: raw.age ?? '',
    gender: String(raw.gender ?? '').trim(),
    patientId: String(raw.patientId ?? raw.id ?? '').trim(),
    phone: String(raw.phone ?? '').trim(),
    doctor: String(raw.doctor ?? '').trim(),
  };
  return Object.values(patient).some((v) => v !== '' && v !== null && v !== undefined) ? patient : null;
}

/** `teamColor` of an order as a `teamColors` key (trimmed, lower-case) — null when the order has none. */
export function resolveTeamColor(order = {}) {
  const key = String(order.teamColor ?? '').trim().toLowerCase();
  return key || null;
}

export function resolveOrder(order, catalogue = []) {
  const byId = new Map(catalogue.map((m) => [m.id, m]));
  const seen = new Map();
  const resolved = (order.items || [])
    .map((item, index) => {
      const med = byId.get(item.medicineId);
      if (!med) {
        console.warn(`[orders] order ${order.barcode}: unknown medicineId "${item.medicineId}" (line ${index + 1}) skipped`);
        return null;
      }
      // Same medicine listed twice → keep line ids unique for the workflow/list keys
      const count = (seen.get(med.id) || 0) + 1;
      seen.set(med.id, count);
      const id = count === 1 ? med.id : `${med.id}#${count}`;
      return {
        ...med,
        id,
        medicineId: med.id,
        quantity: Number(item.quantity ?? med.quantity ?? 1),
      };
    })
    .filter(Boolean);

  return {
    barcode: String(order.barcode),
    reference: order.reference || String(order.barcode),
    patient: resolvePatient(order),
    teamColor: resolveTeamColor(order),
    medicines: resolved,
  };
}

/** Every barcode the kiosk can expect (orders + medicines) — used to auto-tune the keyboard-wedge adapter. */
export function getKnownBarcodes({ orders = [], medicines = [] } = {}) {
  return [...orders.map((o) => o.barcode), ...medicines.map((m) => m.barcode)]
    .map(normalizeBarcode)
    .filter(Boolean);
}
