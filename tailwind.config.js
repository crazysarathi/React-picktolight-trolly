const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Custom Project Specific Colors (see stack.md). Every token is an "r g b" CSS variable (defaults in
        // index.css :root) so that the kiosk can re-tint EVERYTHING — backgrounds, surfaces, accent text, borders,
        // buttons — in the active order's team colour (KioskPage sets them from data.js `teamColors`).
        "ot-bg-top": "rgb(var(--ot-bg-top) / <alpha-value>)",
        "ot-bg-mid": "rgb(var(--ot-bg-mid) / <alpha-value>)",
        "ot-bg-bottom": "rgb(var(--ot-bg-bottom) / <alpha-value>)",
        "ot-surface-top": "rgb(var(--ot-surface-top) / <alpha-value>)",
        "ot-surface-bottom": "rgb(var(--ot-surface-bottom) / <alpha-value>)",
        "ot-surface-elev-top": "rgb(var(--ot-surface-elev-top) / <alpha-value>)",
        "ot-surface-elev-bottom": "rgb(var(--ot-surface-elev-bottom) / <alpha-value>)",
        "ot-action": "rgb(var(--ot-action) / <alpha-value>)",             // accent: text, icons, borders, badges
        "ot-action-fill": "rgb(var(--ot-action-fill) / <alpha-value>)",   // solid buttons, brand tile, progress bar …
        "ot-action-fg": "rgb(var(--ot-action-fg) / <alpha-value>)",       // … and the text on them
        "ot-action-hover": "rgb(var(--ot-action-hover) / <alpha-value>)", // solid buttons, hovered / pressed
        "ot-btn-secondary-top": "rgb(var(--ot-btn-secondary-top) / <alpha-value>)",
        "ot-btn-secondary-bottom": "rgb(var(--ot-btn-secondary-bottom) / <alpha-value>)",
        "ot-border": "rgb(var(--ot-border) / <alpha-value>)",             // always with an alpha: `border-ot-border/35` is the standard border
        "ot-text-muted": "rgb(var(--ot-text-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Bai Jamjuree"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.94)", opacity: "0.55" },
          "70%": { transform: "scale(1.06)", opacity: "0" },
          "100%": { transform: "scale(1.06)", opacity: "0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "50%": { transform: "translate3d(0, -18px, 0) rotate(6deg)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "soft-pulse": "soft-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [
    // Kiosk panel variants. The 10" panel is 1024×600 (landscape, short height), the 12" tablet is 1200×1920
    // (portrait, extra tall, scaled-up root font — see index.css). `h-short` = the compact TWO-COLUMN layout,
    // `h-tall` / `h-xtall` = the roomier sizes of the taller screens.
    // LAYOUT MODE: the Portrait | Landscape toggle on the order-scan page puts `data-layout` on <html>
    // (src/lib/layoutMode.js). "landscape" switches the compact two-column layout on for ANY panel height
    // (h-short) and the extra-tall portrait sizes off (h-xtall); h-tall still follows the real height.
    // "portrait" = the media queries alone, exactly as before.
    // Precedence is by specificity (plugin variants are emitted BEFORE `md:` etc., so order cannot do it):
    // `&&` doubles the class → every h-* utility (0,2,0) beats `md:` (0,1,0); the html[data-layout] prefix adds
    // (0,1,1) more, so in the landscape mode h-short beats h-tall and h-xtall beats h-tall on the tall tablet.
    plugin(({ addVariant }) => {
      addVariant("h-tall", "@media (min-height: 641px) { && }");
      addVariant("h-xtall", '@media (min-height: 1500px) { html:not([data-layout="landscape"]) && }');
      addVariant("h-short", ["@media (max-height: 640px) { && }", 'html[data-layout="landscape"] &&']);
    }),
  ],
}
