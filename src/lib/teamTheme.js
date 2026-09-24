/**
 * Team colour theming (pure, framework-free — unit-tested by scripts/workflow.test.mjs).
 *
 * A team in data.js `teamColors` only defines two colours: `from` (top of the page) and `to` (bottom).
 * Everything else — cards, elevated tiles, buttons and their text colour, overlay backdrops, muted text,
 * accent text / icons, borders, the focus ring — is derived from those two here, as the "r g b" CSS
 * variables that tailwind.config.js / index.css use for the default navy theme. KioskPage puts them on .kiosk-root while such an order is open, so the whole
 * kiosk re-tints without any component knowing about teams.
 */
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));

/** "#rgb" / "#rrggbb" → [r, g, b], or null when it is not a hex colour. */
export function hexToRgb(hex) {
  const m = String(hex ?? '').trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** Move `rgb` towards `target` by `amount` (0 = unchanged, 1 = target). */
export function mix(rgb, target, amount) {
  return rgb.map((c, i) => clamp(c + (target[i] - c) * amount));
}

/** WCAG relative luminance (0 = black … 1 = white) of an [r, g, b] colour. */
export function luminance([r, g, b]) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** [r, g, b] → "h s% l%" (the format of the shadcn `--ring` / `--background` variables). */
export function rgbToHsl([r, g, b]) {
  const [rr, gg, bb] = [r, g, b].map((c) => c / 255);
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const channels = (rgb) => rgb.join(' ');

/** Solid team-coloured buttons: light fills (yellow, green, orange) need dark text, deep ones (red, blue, violet) white. */
const LIGHT_FILL_LUMINANCE = 0.3;

/**
 * CSS custom properties that re-tint the whole kiosk in a team colour (`{ '--ot-…': 'r g b' }`, plus the
 * shadcn `--ring` / `--background` as "h s% l%"). Returns null when the team has no valid `from` / `to`
 * hex colours (→ the default navy theme stays).
 */
export function teamThemeVars(team) {
  const from = hexToRgb(team?.from);
  const to = hexToRgb(team?.to);
  if (!from || !to) return null;
  const accent = mix(from, WHITE, 0.45); // accent text / icons / badges: a light tint that reads on the dark team surfaces
  const darkText = mix(to, BLACK, 0.7);
  return {
    '--ot-bg-top': channels(mix(to, BLACK, 0.62)),             // overlay backdrops, collection-screen header bar
    '--ot-bg-mid': channels(mix(to, BLACK, 0.45)),
    '--ot-bg-bottom': channels(mix(to, BLACK, 0.55)),          // scan zone, test-scanner strip
    '--ot-surface-top': channels(mix(to, BLACK, 0.3)),         // cards / tiles (top of their gradient)
    '--ot-surface-bottom': channels(mix(to, BLACK, 0.52)),     // cards (bottom), pills, inputs
    '--ot-surface-elev-top': channels(mix(from, BLACK, 0.25)), // elevated tiles, patient toggle
    '--ot-surface-elev-bottom': channels(mix(to, BLACK, 0.2)),
    '--ot-btn-secondary-top': channels(mix(from, BLACK, 0.4)), // secondary buttons
    '--ot-btn-secondary-bottom': channels(mix(to, BLACK, 0.52)),
    '--ot-text-muted': channels(mix(from, WHITE, 0.72)),       // secondary text: a pale tint of the team colour
    '--ot-action': channels(accent),                           // accent text, icons, pills, card borders, scan frame
    '--ot-action-fill': channels(from),                        // solid buttons (START), brand tile, progress bar
    '--ot-action-fg': channels(luminance(from) > LIGHT_FILL_LUMINANCE ? darkText : WHITE), // text on those buttons
    '--ot-action-hover': channels(mix(from, WHITE, 0.12)),     // solid buttons, hovered / pressed
    '--ot-border': channels(mix(from, WHITE, 0.55)),           // borders (used with an alpha, e.g. /35)
    '--ring': rgbToHsl(accent),                                // keyboard focus ring
    '--background': rgbToHsl(mix(to, BLACK, 0.62)),            // focus-ring offset colour
  };
}
