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

        // Custom Project Specific Colors (see stack.md)
        "ot-bg-top": "#010a25",
        "ot-bg-mid": "#021e3b",
        "ot-bg-bottom": "#01112c",
        "ot-surface-top": "#203250",
        "ot-surface-bottom": "#03132e",
        "ot-surface-elev-top": "#234f7d",
        "ot-surface-elev-bottom": "#0e2e54",
        "ot-action": "#5fa6ff",
        "ot-action-hover": "#74b3ff",
        "ot-btn-secondary-top": "#425679",
        "ot-btn-secondary-bottom": "#03132e",
        "ot-border": "rgba(139, 175, 229, 0.35)",
        "ot-text-muted": "#a7bedf",
      },
      fontFamily: {
        sans: ["Bai Jamjuree"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
      screens: {
        // Kiosk helpers: the 10" panel is 1024x600 (landscape, short height),
        // the 12" portrait panel is 1200x1920 (extra tall, scaled-up root font)
        "h-short": { raw: "(max-height: 640px)" },
        "h-tall": { raw: "(min-height: 641px)" },
        "h-xtall": { raw: "(min-height: 1500px)" },
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
  plugins: [],
}
