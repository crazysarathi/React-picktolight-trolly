# Pharmacy Medicine Collection Kiosk

Touch-first self-service kiosk for medicine collection, built for a **Raspberry Pi with a
10-inch (1024 × 600) touchscreen**. React + Vite + Tailwind + framer-motion + lucide (see `stack.md`).

## Run

```bash
npm install
npm run dev            # http://localhost:3000  (also reachable on the LAN: --host is on)
npm run build          # production build → dist/
npm run preview        # serve dist/ on http://localhost:3000
npm run test:workflow  # unit tests for the pure workflow reducer + order resolver
```

## Flow

```
open → ORDER-SCAN screen (scan the MAIN barcode on the order slip)
     → order found → "Order found — START?" confirmation on the same screen (patient, medicine count, notice)
     → START → scanning screen: current medicine (patient → order · wall → cupboard → shelf · name · quantity)
                                · collection list (5 rows, scrolls) · progress ring · scan card
                                · ROUTE MAP of the picking room: one lit track from the first medicine's cupboard through every
                                  cupboard of the order to the last, the trolley moving along it to the current medicine
     → scan the medicines in ANY order → each ✓ success ticks its row off (tap a row for quantity / pack details)
     → last one collected → "All medicines collected" → COMPLETE → back to the order-scan screen (next customer)
```

Unknown / already-collected medicine scans show a warning; progress is kept.
An unknown order barcode shows "Order Not Found" and stays on the order-scan screen.
Set `kioskConfig.confirmOrderStart = false` to skip the START confirmation and open the collection screen directly.

## Change the pharmacy name / logo / medicines / orders

Edit **`src/data/data.js`** only:

```js
export const pharmacyData = { name, tagline, welcomeMessage, helpNote, logo };
export const medicines   = [ { id, barcode, name, form, pack, quantity, dosage, manufacturer, location: { wall, cupboard, shelf }, image }, … ]; // catalogue
export const storeLayout = { entranceLabel, walls: [ { id, label, side: left|back|right, cupboards, shelves }, … ] }; // the picking room on the route map
export const teamColors  = { red, yellow, green, violet, orange, blue }; // picking teams: { label, from, to } background colours
export const orders      = [ { barcode, reference, teamColor, patient: { name, age, gender, patientId, phone, doctor }, items: [{ medicineId, quantity }] }, … ];
export const kioskConfig = { timings, confirmOrderStart, layout, hideCursor, backgroundMotion, testScanner, scanner };
```

Every `patient` field is optional — `name` is shown on the START confirmation, in the PATIENT → ORDER strip of the
current-medicine card and on the completion screen; the other fields are kept for the record.
`location` says where a pack is kept: `wall` is a `storeLayout` wall id, `cupboard` is numbered from the entrance
(1…`cupboards` of that wall), `shelf` from the bottom. It is shown as WALL → CUPBOARD → SHELF above the medicine name,
and the route map beside the scanner lights that cupboard (one LED per cupboard) and animates the walk to it from the entrance.
`teamColor` is the picking team (trolley) of the order — one of the `teamColors` keys. From the START confirmation
through the whole collection screen the whole kiosk (page background, cards, tiles, accent text, borders, buttons) is
re-tinted in that colour, and so is the completion screen — only the order-scan page stays navy (the team name is shown on the
"Order found" card, under the screen title and on the completion panel); leave the field
out for the default navy theme. Each team only defines `from` / `to`; every other shade — including a readable text
colour for its buttons — is derived in `src/lib/teamTheme.js`.

Sample order barcodes: **111001 … 111006** (teams red · yellow · green · violet · orange · blue) ·
**1121125101363** (ORD-1363, 20-line order, scrolls, no team) · sample medicine barcodes: **891 … 910**.
The logo is `public/images/favicon-white.png` (white-on-transparent version of `public/favicon.ico`).

## Testing without a barcode scanner

While `kioskConfig.testScanner.enabled` is `true`:

* the order-scan screen shows a **barcode input box** — type `111001` and press Enter (or tap Scan);
* the scanning screen shows a **Test scanner** strip at the bottom with a barcode input box —
  type `891`, `892`, … in any order (the strip lists the barcodes still to collect).
* Scanning the order barcode opens the **START** confirmation first (or press Enter — the START button has focus).

Both inputs call `testScannerAdapter.scan(barcode)`, which publishes the barcode into the **same
`scannerService`** a physical scanner uses — the workflow cannot tell them apart.

You can also just type a barcode quickly on the keyboard and press **Enter** anywhere on the page
(without focusing the input): that is exactly the keyboard-wedge path a real scanner will use.

## Connecting the real barcode scanner

```
USB / Bluetooth scanner (keyboard wedge)  ─┐
Test input boxes (temporary)              ─┼─▶ scannerService.emit(barcode) ─▶ order lookup / workflow reducer ─▶ UI
Future serial / camera / backend adapter  ─┘
```

* Most USB/Bluetooth scanners type the barcode + Enter. `src/services/scanner/keyboardWedgeAdapter.js`
  already listens for that — plug the scanner in and scan; nothing else changes.
  Tune `kioskConfig.scanner.keyboardWedge` (`minLength`, `maxKeyIntervalMs`, terminator keys) if needed;
  `minLength` is automatically lowered to the shortest barcode in `data.js`.
* Then set `kioskConfig.testScanner.enabled = false` to hide the test inputs.
* For any other kind of scanner (serial, WebHID, camera, backend push), write an adapter
  `{ name, start(service), stop() }` that calls `service.emit(barcode, { source })` and register it in
  `src/services/scanner/index.js`.
* To fetch orders from a server instead of `data.js`, replace `findOrderByBarcode` in `src/lib/orders.js`
  (or resolve the order in `useCollectionWorkflow` before dispatching `START_ORDER`).

## Screen layout: portrait / landscape

The **Portrait | Landscape** toggle in the top-right corner of the order-scan page picks the layout of the whole kiosk:

* **Portrait** — the 12" tablet standing upright (1200 × 1920): one column, the big current-medicine card over the
  collection list, progress ring · scanner · route map in a row at the bottom.
* **Landscape** — the tablet on its side (1920 × 1200) or any wide screen: the same content in two compact columns —
  current medicine + collection list on the left (only the list scrolls), progress ring and scanner over the route
  map on the right — with everything sized down so it fits without page scrolling. This is also what the
  10" 1024 × 600 panel always shows.

The choice is remembered on the device (browser storage). `kioskConfig.layout = { default, toggle }` sets the layout
used until the toggle is tapped and `toggle: false` hides the buttons (e.g. on a fixed installation). Under the hood
the mode is `data-layout` on `<html>` (`src/lib/layoutMode.js`); the Tailwind `h-short` / `h-tall` / `h-xtall`
variants in `tailwind.config.js` and the root font-size in `src/index.css` key on it.

## Raspberry Pi notes

* Run Chromium in kiosk mode: `chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000`
  (or point it at a static server hosting `dist/`).
* Set `kioskConfig.hideCursor = true` to hide the pointer, `backgroundMotion = false` on the weakest boards.
* All animations use transforms/opacity only (no WebGL, no blur filters); fonts are self-hosted so the
  kiosk works offline. Abandoned orders reset after `timings.idleTimeoutMs` (default 3 min).
# React-picktolight-trolly
