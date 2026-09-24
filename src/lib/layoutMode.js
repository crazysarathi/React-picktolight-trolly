/**
 * Screen LAYOUT MODE of the kiosk — "portrait" or "landscape" (pure helpers + the tiny bit of DOM glue).
 *
 *  portrait   the 12" tablet standing upright: one column, the big current-medicine card over the list, the
 *             progress ring / scanner / route map in a row at the bottom (the media-query sizes of index.css and
 *             the h-tall / h-xtall Tailwind variants apply as before).
 *  landscape  the tablet on its side (or any wide screen): the compact TWO-COLUMN layout of the 10" panel is
 *             forced on whatever the panel height is — current medicine + list (the only thing that scrolls) on
 *             the left, ring + scanner over the route map on the right — and the extra-tall sizes are switched off.
 *
 * The mode lives as `data-layout` on <html> so that CSS can key on it (tailwind.config.js registers the
 * h-short / h-xtall variants against it, index.css picks the root font-size). The Portrait | Landscape toggle on
 * the order-scan page changes it; the choice is remembered on the device (localStorage) so a kiosk mounted on
 * its side keeps its layout after a reload. `kioskConfig.layout.default` (data.js) is used until then.
 */
export const LAYOUT_MODES = ['portrait', 'landscape'];
export const DEFAULT_LAYOUT_MODE = 'portrait';
export const LAYOUT_STORAGE_KEY = 'kiosk.layout';

/** Any value → a valid mode (trimmed, case-insensitive), or `fallback` when it is not one. */
export function normalizeLayoutMode(value, fallback = DEFAULT_LAYOUT_MODE) {
  const key = String(value ?? '').trim().toLowerCase();
  return LAYOUT_MODES.includes(key) ? key : fallback;
}

function storage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // storage blocked (private mode / policy) → the mode simply is not remembered
  }
}

/** The mode saved on this device, else the configured default (data.js `kioskConfig.layout.default`). */
export function loadLayoutMode(configDefault) {
  const fallback = normalizeLayoutMode(configDefault);
  const saved = storage()?.getItem(LAYOUT_STORAGE_KEY);
  return saved ? normalizeLayoutMode(saved, fallback) : fallback;
}

export function saveLayoutMode(mode) {
  try {
    storage()?.setItem(LAYOUT_STORAGE_KEY, normalizeLayoutMode(mode));
  } catch {
    /* quota / blocked storage: ignore, the mode still applies for this session */
  }
}

/** Put the mode on <html> (`data-layout`) so the stylesheet can switch layouts. */
export function applyLayoutMode(mode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-layout', normalizeLayoutMode(mode));
}
