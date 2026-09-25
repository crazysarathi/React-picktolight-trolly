/**
 * Team colour theming (pure, framework-free — unit-tested by scripts/workflow.test.mjs).
 *
 * A team in data.js `teamColors` only defines two colours: `from` (top of the page) and `to` (bottom).
 * Everything else — cards, elevated tiles, buttons and their text colour, overlay backdrops, text, muted text,
 * accent text / icons, borders, the focus ring, the status greens / ambers — is derived from those two here, as the
 * "r g b" CSS variables that tailwind.config.js / index.css use for the default navy theme. KioskPage puts them on
 * .kiosk-root while such an order is open, so the whole kiosk re-tints without any component knowing about teams.
 *
 * Two flavours, picked by how light the team's `to` colour is:
 *   DARK  (red, blue, violet, green, yellow …) — surfaces are dark shades of `to`, the text WHITE and the accent a
 *         pale tint of `from`, exactly like the navy default.
 *   LIGHT (white) — the mirror image: surfaces are light greys of `to`, the text BLACK and the accent (labels, icons,
 *         borders, solid buttons, the scan frame, the route map) a near-black shade of `from`, so nothing pale ever
 *         sits on the white page. The fixed status colours switch to their darker shades too.
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

/** Solid team-coloured buttons on a DARK theme: light fills (yellow, green) need dark text, deep ones (red, blue, violet) white. */
const LIGHT_FILL_LUMINANCE = 0.3;

/** A team whose `to` colour is lighter than this gets the LIGHT theme (white page, black text). */
export const LIGHT_THEME_LUMINANCE = 0.5;

/**
 * Fixed status colours (Tailwind emerald = collected / success, amber = pending / warning) as "r g b": the shades the
 * dark themes use (also the index.css defaults) and their darker counterparts that stay readable on the light theme.
 * tailwind.config.js maps emerald-100/300/400 and amber-100/300/400 onto these variables.
 */
const STATUS = {
  dark: {
    '--ot-ok-100': '209 250 229',   // emerald-100
    '--ot-ok-300': '110 231 183',   // emerald-300
    '--ot-ok-400': '52 211 153',    // emerald-400
    '--ot-warn-100': '254 243 199', // amber-100
    '--ot-warn-300': '252 211 77',  // amber-300
    '--ot-warn-400': '251 191 36',  // amber-400
  },
  light: {
    '--ot-ok-100': '6 78 59',       // emerald-900
    '--ot-ok-300': '6 95 70',       // emerald-800
    '--ot-ok-400': '4 120 87',      // emerald-700
    '--ot-warn-100': '69 26 3',     // amber-950
    '--ot-warn-300': '180 83 9',    // amber-700
    '--ot-warn-400': '217 119 6',   // amber-600
  },
};

/** "dark" | "light" for a team with valid colours, null otherwise. */
export function teamThemeMode(team) {
  const to = hexToRgb(team?.to);
  if (!to || !hexToRgb(team?.from)) return null;
  return luminance(to) > LIGHT_THEME_LUMINANCE ? 'light' : 'dark';
}

function darkTheme(from, to) {
  const accent = mix(from, WHITE, 0.45); // accent text / icons / badges: a light tint that reads on the dark team surfaces
  const darkText = mix(to, BLACK, 0.7);
  return {
    '--ot-bg-top': channels(mix(to, BLACK, 0.62)),             // overlay backdrops, collection-screen header bar
    '--ot-bg-mid': channels(mix(to, BLACK, 0.45)),
    '--ot-bg-bottom': channels(mix(to, BLACK, 0.55)),          // scan zone, test-scanner strip
    '--ot-surface-top': channels(mix(to, BLACK, 0.3)),         // cards / tiles (top of their gradient)
    '--ot-surface-bottom': channels(mix(to, BLACK, 0.52)),     // cards (bottom), pills, inputs
    '--ot-surface-elev-top': channels(mix(from, BLACK, 0.25)), // elevated tiles, hover fills, the trolley on the map
    '--ot-surface-elev-bottom': channels(mix(to, BLACK, 0.2)),
    '--ot-btn-secondary-top': channels(mix(from, BLACK, 0.4)), // secondary buttons
    '--ot-btn-secondary-bottom': channels(mix(to, BLACK, 0.52)),
    '--ot-text': channels(WHITE),                              // headings, names, values
    '--ot-text-muted': channels(mix(from, WHITE, 0.72)),       // secondary text: a pale tint of the team colour
    '--ot-action': channels(accent),                           // accent text, icons, pills, card borders, scan frame
    '--ot-action-fill': channels(from),                        // solid buttons (START), brand tile, progress bar
    '--ot-action-fg': channels(luminance(from) > LIGHT_FILL_LUMINANCE ? darkText : WHITE), // text on those buttons
    '--ot-action-hover': channels(mix(from, WHITE, 0.12)),     // solid buttons, hovered / pressed
    '--ot-border': channels(mix(from, WHITE, 0.55)),           // borders (used with an alpha, e.g. /35)
    ...STATUS.dark,
    '--ring': rgbToHsl(accent),                                // keyboard focus ring
    '--background': rgbToHsl(mix(to, BLACK, 0.62)),            // focus-ring offset colour
  };
}

function lightTheme(from, to) {
  const accent = mix(from, BLACK, 0.85); // accent = a near-black shade of the team colour: reads on the light surfaces
  return {
    '--ot-bg-top': channels(mix(to, BLACK, 0.2)),              // header bar, overlay backdrops, completion panel: grey
    '--ot-bg-mid': channels(mix(to, WHITE, 0.5)),
    '--ot-bg-bottom': channels(mix(to, WHITE, 0.7)),           // scan zone, test-scanner strip: a near-white well
    '--ot-surface-top': channels(mix(to, WHITE, 0.45)),        // cards / tiles: light greys of `to`
    '--ot-surface-bottom': channels(mix(to, WHITE, 0.25)),
    '--ot-surface-elev-top': channels(mix(to, BLACK, 0.05)),   // elevated tiles / hover fills: a shade deeper than the cards
    '--ot-surface-elev-bottom': channels(mix(to, BLACK, 0.15)),
    '--ot-btn-secondary-top': channels(mix(to, WHITE, 0.15)),  // secondary buttons
    '--ot-btn-secondary-bottom': channels(mix(to, BLACK, 0.12)),
    '--ot-text': channels(BLACK),                              // headings, names, values: black on the white page
    '--ot-text-muted': channels(mix(from, BLACK, 0.62)),       // secondary text: dark grey
    '--ot-action': channels(accent),                           // accent text, icons, borders, scan frame: near-black
    '--ot-action-fill': channels(accent),                      // solid buttons (START), brand tile, progress bar: near-black …
    '--ot-action-fg': channels(WHITE),                         // … with white text on them
    '--ot-action-hover': channels(mix(accent, WHITE, 0.12)),
    '--ot-border': channels(mix(from, BLACK, 0.55)),           // borders (used with an alpha, e.g. /35): mid grey
    ...STATUS.light,
    '--ring': rgbToHsl(accent),
    '--background': rgbToHsl(mix(to, WHITE, 0.45)),
  };
}

/**
 * CSS custom properties that re-tint the whole kiosk in a team colour (`{ '--ot-…': 'r g b' }`, plus the
 * shadcn `--ring` / `--background` as "h s% l%"). Returns null when the team has no valid `from` / `to`
 * hex colours (→ the default navy theme stays).
 */
export function teamThemeVars(team) {
  const from = hexToRgb(team?.from);
  const to = hexToRgb(team?.to);
  if (!from || !to) return null;
  return luminance(to) > LIGHT_THEME_LUMINANCE ? lightTheme(from, to) : darkTheme(from, to);
}
