# Development Stack & Design System

## 1. Technology Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Icons**: Lucide Icons (`lucide-react`)
- **3D / Animation**:
  - Three.js (`three`)
  - React Three Fiber (`@react-three/fiber`)
  - Drei (`@react-three/drei`)
  - Motion / Framer Motion for UI transitions
- **Target Device**: Raspberry Pi with 10-inch touchscreen display
- **Primary Target Resolution**: 1024 × 600
- **Interaction**: Touch-first kiosk interface
- **Application Type**: Pharmacy Medicine Scanning & Collection Kiosk

## 2. Typography
- **Primary Font**: `Bai Jamjuree`
  - *Weights: 300, 400, 500, 600, 700*

## 3. Color Palette & Design Tokens

### Project Specific Colors (HEX/RGBA)
| Category | Element | Color Codes |
| :--- | :--- | :--- |
| **Backgrounds (ot-bg)** | Top / Mid / Bottom | ` #010a25` / ` #021e3b` / ` #01112c` |
| **Surfaces (ot-surface)** | Top / Bottom | ` #203250` / ` #03132e` |
| **Elevated (ot-surface-elev)**| Top / Bottom | `#234f7d` / `#0e2e54` |
| **Buttons (ot-action)** | Primary / Hover | `#5fa6ff` / `#74b3ff` |
| **Buttons (Secondary)** | Top / Bottom | `#425679` / `#03132e` |
| **Borders** | Standard (rgba) | `rgba(139, 175, 229, 0.35)` |
| **Text** | Muted | `#a7bedf` |

Every `ot-*` token is a CSS variable ("r g b" channels, defaults in `src/index.css :root`; `ot-border` is always used with
an alpha, `/35` being the standard border). Primary text is `ot-text` (white by default — never a literal `text-white`, except
on the red destructive button). While an order with a `teamColor` is open, `KioskPage` overrides them all with shades derived
from that team's colour (`src/lib/teamTheme.js`): surfaces, accent text (`ot-action`, a light tint), borders, solid buttons
(`ot-action-fill` = the team colour, `ot-action-fg` = white or dark text depending on its luminance) and the focus ring.
A team whose `to` colour is light (the **white** team) gets the mirror-image LIGHT theme instead: light-grey surfaces,
`ot-text` black, `ot-action` / `ot-action-fill` near-black with white button text. The semantic status colours
(emerald = collected / success, amber = pending / warning) are routed through `--ot-ok-100/300/400` and `--ot-warn-100/300/400`
(defaults = Tailwind's emerald/amber 100/300/400) so the light theme can swap in darker shades; everything else about them stays fixed.

### Shadcn Base Variables (HSL)
- **Background**: `222 47% 7%`
- **Foreground**: `210 40% 98%`
- **Primary**: `217 100% 69%`
- **Secondary / Muted / Accent**: `217 19% 27%`
- **Destructive**: `0 62% 30%`
- **Border / Input**: `217 19% 27%`
- **Ring**: `217 100% 69%`
- **Radius**: `0.75rem`
