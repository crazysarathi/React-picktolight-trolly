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
     → START → scanning screen: collection list · patient details · order tiles · scan card
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
export const medicines   = [ { id, barcode, name, form, pack, quantity, dosage, manufacturer, image }, … ]; // catalogue
export const orders      = [ { barcode, reference, patient: { name, age, gender, patientId, phone, doctor }, items: [{ medicineId, quantity }] }, … ];
export const kioskConfig = { timings, confirmOrderStart, hideCursor, backgroundMotion, testScanner, scanner };
```

Every `patient` field is optional — only the ones present are shown in the "Patient details" card.

Sample order barcodes: **1001**, **1002**, **1003**, **1004** (20-line order, scrolls) · sample medicine barcodes: **891 … 910**.
The logo is `public/images/favicon-white.png` (white-on-transparent version of `public/favicon.ico`).

## Testing without a barcode scanner

While `kioskConfig.testScanner.enabled` is `true`:

* the order-scan screen shows a **barcode input box** — type `1001` and press Enter (or tap Scan);
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

## Raspberry Pi notes

* Run Chromium in kiosk mode: `chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000`
  (or point it at a static server hosting `dist/`).
* Set `kioskConfig.hideCursor = true` to hide the pointer, `backgroundMotion = false` on the weakest boards.
* All animations use transforms/opacity only (no WebGL, no blur filters); fonts are self-hosted so the
  kiosk works offline. Abandoned orders reset after `timings.idleTimeoutMs` (default 3 min).
