/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  KIOSK DATA & CONFIGURATION
 *  Everything the UI displays about the pharmacy, the medicines and the orders
 *  lives here. Change values in this file only — no UI component hardcodes them.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Pharmacy branding shown on the order-scan, header and completion screens. */
export const pharmacyData = {
  name: "Raster Pharmacy",
  tagline: "Your Health, Our Priority",
  welcomeMessage: "Scan your order barcode to collect your medicines",
  helpNote: "Need assistance? Please ask our pharmacist.",
  /** Logo shown in the brand tile (order-scan, header, completion). White-on-transparent image in public/images/. */
  logo: "/images/favicon-white.png",
};

/**
 * TEAM COLOURS — the picking teams / trolleys, ONE PER TROLLEY LED and in LED order (LED 1 … LED 6). Every order
 * carries a `teamColor` (one of the keys below). From the moment that order is opened (the START confirmation and the
 * whole collection screen) the WHOLE kiosk — page background, cards, tiles, buttons, overlays — is re-tinted in this
 * colour, so the picker sees at a glance which team's trolley the order goes to. Only two colours are needed per team;
 * every other shade (cards, text, accent, borders, buttons and their text colour) is derived from them (src/lib/teamTheme.js).
 *
 *  label   team name shown on the "Order found" card, under the collection-screen title and on the completion panel
 *  from    page colour at the top of the screen — EXACTLY the colour the trolley LED shows, so screen and light match
 *  to      page colour at the bottom of the screen (a deeper shade of the same colour; cards are derived from it)
 *
 * WHITE is a LIGHT team: its `to` is light, so the kiosk flips to a light theme — white page, light-grey cards, BLACK text,
 * black accents / buttons (nothing pale on white). Any team whose `to` is a light colour behaves the same.
 */
export const teamColors = {
  white:  { label: "White",  from: "#ffffff", to: "#d4d4d8" }, // LED 1 — (255, 255, 255)
  violet: { label: "Violet", from: "#ff00ff", to: "#800080" }, // LED 2 — (255,   0, 255)
  red:    { label: "Red",    from: "#ff0000", to: "#800000" }, // LED 3 — (255,   0,   0)
  green:  { label: "Green",  from: "#00ff00", to: "#007a00" }, // LED 4 — (  0, 255,   0)
  blue:   { label: "Blue",   from: "#0000ff", to: "#000080" }, // LED 5 — (  0,   0, 255)
  yellow: { label: "Yellow", from: "#ffff00", to: "#b39700" }, // LED 6 — (255, 255,   0)
};

/**
 * STORE ROOM LAYOUT — the picking room drawn on the ROUTE MAP beside the scanner.
 * A square room: the picker comes in with the trolley through the open (bottom) side; the other three walls
 * carry the cupboards, every cupboard has shelves and ONE LED. The map lights the cupboard of the medicine to
 * collect next and animates the walking route to it from the entrance.
 *
 *  entranceLabel  caption of the start point at the bottom of the map
 *  walls[]  id         the letter used in a medicine `location.wall`
 *           label      shown in the location strip above the medicine name
 *           side       left | back | right — where the wall is drawn (the entrance is always the bottom side)
 *           cupboards  number of cupboards along that wall, numbered 1…n starting at the entrance
 *                      (left / right walls: front → back, back wall: left → right)
 *           shelves    shelves per cupboard, numbered 1…n from the bottom
 */
export const storeLayout = {
  entranceLabel: "Entrance",
  walls: [
    { id: "A", label: "Wall A", side: "left",  cupboards: 3, shelves: 4 },
    { id: "B", label: "Wall B", side: "back",  cupboards: 4, shelves: 5 },
    { id: "C", label: "Wall C", side: "right", cupboards: 3, shelves: 4 },
  ],
};

/**
 * MEDICINE CATALOGUE — every medicine the kiosk can hand out.
 *
 *  id            unique id (orders reference it)
 *  barcode       the value the barcode scanner emits for this medicine pack
 *  name          display name (with strength)
 *  form          tablet | capsule | syrup | drops | injection | inhaler | cream | other  (drives the icon)
 *  pack          pack / strip description
 *  quantity      default number of packs (an order line can override it)
 *  dosage        how to take it (shown in the expanded row)
 *  manufacturer  shown in the expanded row
 *  location      { wall, cupboard, shelf } — where the pack is kept in the picking room (see storeLayout above).
 *                Shown as "Wall A › Cupboard 2 › Shelf 3" above the medicine name; the route map lights that cupboard and
 *                runs the order's picking track through it (first medicine's cupboard → … → last one's, in list order).
 *  image         pack photo path (public/images/medicines/<id>.webp (background removed), see SOURCES.md there). Empty → the sample illustration for `form` is shown instead.
 */
export const medicines = [
  {
    id: "MED001",
    barcode: "891",
    name: "Paracetamol 500mg",
    form: "tablet",
    pack: "Strip of 10 tablets",
    quantity: 1,
    dosage: "1 tablet every 6 hours after food",
    manufacturer: "Sun Pharma",
    location: { wall: "A", cupboard: 1, shelf: 1 },
    image: "/images/medicines/MED001.webp",
  },
  {
    id: "MED002",
    barcode: "892",
    name: "Vitamin D3 60,000 IU",
    form: "capsule",
    pack: "Strip of 4 capsules",
    quantity: 2,
    dosage: "1 capsule once a week with milk",
    manufacturer: "Cipla",
    location: { wall: "C", cupboard: 2, shelf: 3 },
    image: "/images/medicines/MED002.webp",
  },
  {
    id: "MED003",
    barcode: "893",
    name: "Amoxicillin 500mg",
    form: "capsule",
    pack: "Strip of 10 capsules",
    quantity: 1,
    dosage: "1 capsule three times a day for 5 days",
    manufacturer: "Alkem",
    location: { wall: "B", cupboard: 1, shelf: 2 },
    image: "/images/medicines/MED003.webp",
  },
  {
    id: "MED004",
    barcode: "894",
    name: "Cetirizine 10mg",
    form: "tablet",
    pack: "Strip of 10 tablets",
    quantity: 1,
    dosage: "1 tablet at night",
    manufacturer: "Dr. Reddy's",
    location: { wall: "A", cupboard: 2, shelf: 3 },
    image: "/images/medicines/MED004.webp",
  },
  {
    id: "MED005",
    barcode: "895",
    name: "Ambroxol Cough Syrup",
    form: "syrup",
    pack: "100 ml bottle",
    quantity: 1,
    dosage: "10 ml three times a day",
    manufacturer: "Abbott",
    location: { wall: "B", cupboard: 4, shelf: 1 },
    image: "/images/medicines/MED005.webp",
  },
  { id: "MED006", barcode: "896", name: "Azithromycin 500mg", form: "tablet", pack: "Strip of 3 tablets", quantity: 1, dosage: "1 tablet once a day for 3 days", manufacturer: "Zydus", location: { wall: "B", cupboard: 1, shelf: 4 }, image: "/images/medicines/MED006.webp" },
  { id: "MED007", barcode: "897", name: "Metformin 500mg", form: "tablet", pack: "Strip of 10 tablets", quantity: 2, dosage: "1 tablet twice a day after food", manufacturer: "USV", location: { wall: "A", cupboard: 3, shelf: 2 }, image: "/images/medicines/MED007.webp" },
  { id: "MED008", barcode: "898", name: "Atorvastatin 10mg", form: "tablet", pack: "Strip of 10 tablets", quantity: 1, dosage: "1 tablet at bedtime", manufacturer: "Ranbaxy", location: { wall: "A", cupboard: 3, shelf: 3 }, image: "/images/medicines/MED008.webp" },
  { id: "MED009", barcode: "899", name: "Pantoprazole 40mg", form: "tablet", pack: "Strip of 10 tablets", quantity: 1, dosage: "1 tablet before breakfast", manufacturer: "Alkem", location: { wall: "B", cupboard: 2, shelf: 1 }, image: "/images/medicines/MED009.webp" },
  { id: "MED010", barcode: "900", name: "Amlodipine 5mg", form: "tablet", pack: "Strip of 10 tablets", quantity: 1, dosage: "1 tablet every morning", manufacturer: "Cipla", location: { wall: "A", cupboard: 3, shelf: 4 }, image: "/images/medicines/MED010.webp" },
  { id: "MED011", barcode: "901", name: "Ibuprofen 400mg", form: "tablet", pack: "Strip of 10 tablets", quantity: 1, dosage: "1 tablet after food when needed", manufacturer: "Abbott", location: { wall: "A", cupboard: 1, shelf: 2 }, image: "/images/medicines/MED011.webp" },
  { id: "MED012", barcode: "902", name: "Omeprazole 20mg", form: "capsule", pack: "Strip of 10 capsules", quantity: 1, dosage: "1 capsule before breakfast", manufacturer: "Dr. Reddy's", location: { wall: "B", cupboard: 2, shelf: 3 }, image: "/images/medicines/MED012.webp" },
  { id: "MED013", barcode: "903", name: "Levocetirizine 5mg", form: "tablet", pack: "Strip of 10 tablets", quantity: 1, dosage: "1 tablet at night", manufacturer: "Sun Pharma", location: { wall: "A", cupboard: 2, shelf: 4 }, image: "/images/medicines/MED013.webp" },
  { id: "MED014", barcode: "904", name: "ORS Sachets", form: "other", pack: "Box of 10 sachets", quantity: 1, dosage: "Dissolve 1 sachet in 1 litre of water", manufacturer: "FDC", location: { wall: "C", cupboard: 3, shelf: 1 }, image: "/images/medicines/MED014.webp" },
  { id: "MED015", barcode: "905", name: "Saline Nasal Drops", form: "drops", pack: "10 ml bottle", quantity: 1, dosage: "2 drops in each nostril three times a day", manufacturer: "Cipla", location: { wall: "C", cupboard: 1, shelf: 2 }, image: "/images/medicines/MED015.webp" },
  { id: "MED016", barcode: "906", name: "Salbutamol Inhaler", form: "inhaler", pack: "200 doses", quantity: 1, dosage: "2 puffs when breathless", manufacturer: "Cipla", location: { wall: "C", cupboard: 1, shelf: 4 }, image: "/images/medicines/MED016.webp" },
  { id: "MED017", barcode: "907", name: "Clotrimazole Cream 1%", form: "cream", pack: "20 g tube", quantity: 1, dosage: "Apply thinly twice a day", manufacturer: "Glenmark", location: { wall: "C", cupboard: 3, shelf: 3 }, image: "/images/medicines/MED017.webp" },
  { id: "MED018", barcode: "908", name: "Insulin Glargine", form: "injection", pack: "3 ml pen", quantity: 1, dosage: "10 units at bedtime as advised", manufacturer: "Sanofi", location: { wall: "B", cupboard: 3, shelf: 2 }, image: "/images/medicines/MED018.webp" },
  { id: "MED019", barcode: "909", name: "Multivitamin Syrup", form: "syrup", pack: "200 ml bottle", quantity: 1, dosage: "10 ml once a day", manufacturer: "Pfizer", location: { wall: "B", cupboard: 4, shelf: 3 }, image: "/images/medicines/MED019.webp" },
  { id: "MED020", barcode: "910", name: "Calcium + Vitamin D3", form: "tablet", pack: "Strip of 15 tablets", quantity: 1, dosage: "1 tablet after lunch", manufacturer: "Abbott", location: { wall: "C", cupboard: 2, shelf: 1 }, image: "/images/medicines/MED020.webp" },
];

/**
 * ORDERS — the MAIN barcode the customer scans first (order slip / prescription / token).
 * The kiosk looks the barcode up here and lists the allocated medicines on the inside page.
 * The medicines can be scanned in ANY order; the order is complete once every line is collected.
 * Any number of orders and any number of items per order (0 … n).
 *
 *  barcode    what the main scanner emits for this order
 *  reference  human readable order number shown in the header
 *  teamColor  picking team / trolley of this order — a key of `teamColors` above, one per trolley LED:
 *             white | violet | red | green | blue | yellow (LED 1 … 6).
 *             The kiosk background takes this colour while the order is open. Leave it out for no team colour.
 *  patient    details shown in the "Patient" card on the scanning screen — every field is optional:
 *               name, age, gender, patientId, phone, doctor
 *  items      [{ medicineId, quantity? }] — quantity overrides the catalogue default.
 *             LIST ORDER = PICKING ORDER: the route map runs the track through the items first → last and the
 *             current-medicine card follows the same sequence. The sample orders below are listed in WALKING order
 *             — Wall A entrance → back (A1, A2, A3), Wall B left → right (B1 … B4), Wall C back → entrance (C3, C2, C1)
 *             — so the track never criss-crosses the room. The live API is expected to deliver items in that order.
 */
export const orders = [
  {
    barcode: "111001",
    reference: "ORD-1001",
    teamColor: "white",
    patient: {
      name: "Kumar",
      age: 46,
      gender: "Male",
      patientId: "PT-20481",
      phone: "98400 12345",
      doctor: "Dr. S. Narayanan",
    },
    items: [
      { medicineId: "MED001", quantity: 1 },
      { medicineId: "MED004", quantity: 1 },
      { medicineId: "MED003", quantity: 1 },
      { medicineId: "MED005", quantity: 1 },
      { medicineId: "MED002", quantity: 2 },
    ],
  },
  {
    barcode: "111002",
    reference: "ORD-1002",
    teamColor: "violet",
    patient: {
      name: "Priya Sharma",
      age: 32,
      gender: "Female",
      patientId: "PT-20497",
      phone: "98841 55667",
      doctor: "Dr. M. Lakshmi",
    },
    items: [
      { medicineId: "MED004", quantity: 2 },
      { medicineId: "MED005", quantity: 1 },
    ],
  },
  {
    barcode: "111003",
    reference: "ORD-1003",
    teamColor: "red",
    patient: {
      name: "Arun Prakash",
      age: 58,
      gender: "Male",
      patientId: "PT-20512",
      phone: "97890 33221",
      doctor: "Dr. K. Venkatesh",
    },
    items: [
      { medicineId: "MED001", quantity: 1 },
      { medicineId: "MED003", quantity: 2 },
      { medicineId: "MED002", quantity: 1 },
    ],
  },
  {
    barcode: "111004",
    reference: "ORD-1004",
    teamColor: "green",
    patient: {
      name: "Meena Rajan",
      age: 29,
      gender: "Female",
      patientId: "PT-20548",
      phone: "99400 77812",
      doctor: "Dr. A. Balaji",
    },
    items: [
      { medicineId: "MED011", quantity: 2 },
      { medicineId: "MED006", quantity: 1 },
      { medicineId: "MED009", quantity: 1 },
      { medicineId: "MED014", quantity: 1 },
    ],
  },
  {
    barcode: "111005",
    reference: "ORD-1005",
    teamColor: "blue",
    patient: {
      name: "Suresh Babu",
      age: 51,
      gender: "Male",
      patientId: "PT-20561",
      phone: "98410 66054",
      doctor: "Dr. P. Anitha",
    },
    items: [
      { medicineId: "MED007", quantity: 2 },
      { medicineId: "MED008", quantity: 1 },
      { medicineId: "MED010", quantity: 1 },
      { medicineId: "MED020", quantity: 1 },
    ],
  },
  {
    barcode: "111006",
    reference: "ORD-1006",
    teamColor: "yellow",
    patient: {
      name: "Fathima Begum",
      age: 37,
      gender: "Female",
      patientId: "PT-20579",
      phone: "96000 41198",
      doctor: "Dr. J. Thomas",
    },
    items: [
      { medicineId: "MED013", quantity: 1 },
      { medicineId: "MED012", quantity: 1 },
      { medicineId: "MED017", quantity: 1 },
      { medicineId: "MED015", quantity: 1 },
      { medicineId: "MED016", quantity: 1 },
    ],
  },
  {
    // Large order (every medicine of the catalogue) — handy to test the scrolling collection list
    barcode: "1121125101363",
    reference: "ORD-1363",
    patient: {
      name: "Lakshmi Devi",
      age: 63,
      gender: "Female",
      patientId: "PT-20533",
      phone: "98765 43210",
      doctor: "Dr. R. Srinivasan",
    },
    items: [
      { medicineId: "MED001", quantity: 2 },
      { medicineId: "MED011", quantity: 1 },
      { medicineId: "MED004", quantity: 1 },
      { medicineId: "MED013", quantity: 1 },
      { medicineId: "MED007", quantity: 2 },
      { medicineId: "MED008", quantity: 1 },
      { medicineId: "MED010", quantity: 1 },
      { medicineId: "MED003", quantity: 1 },
      { medicineId: "MED006", quantity: 1 },
      { medicineId: "MED009", quantity: 1 },
      { medicineId: "MED012", quantity: 1 },
      { medicineId: "MED018", quantity: 1 },
      { medicineId: "MED005", quantity: 1 },
      { medicineId: "MED019", quantity: 1 },
      { medicineId: "MED014", quantity: 2 },
      { medicineId: "MED017", quantity: 1 },
      { medicineId: "MED002", quantity: 1 },
      { medicineId: "MED020", quantity: 1 },
      { medicineId: "MED015", quantity: 1 },
      { medicineId: "MED016", quantity: 1 },
    ],
  },
];

/** Behavioural configuration of the kiosk. Timings are in milliseconds. */
export const kioskConfig = {
  timings: {
    successMs: 1700,        // how long the "Medicine Found" confirmation stays visible
    errorMs: 2600,          // wrong / unknown barcode / order-not-found message
    duplicateMs: 2200,      // "already collected" message
    completionDelayMs: 900, // pause after the last check-mark before the completion screen
    idleTimeoutMs: 0,       // no touch/scan for this long during an order → back to the order-scan screen (0 = never; auto-return switched off)
  },
  confirmOrderStart: true,  // after the order barcode is scanned, show "Order found — START?" before the collection screen

  /**
   * SCREEN LAYOUT. "portrait" = the 12" tablet standing upright (one column: big current-medicine card over the
   * list, ring · scanner · route map at the bottom). "landscape" = the tablet on its side / any wide screen: the
   * same content in two compact columns (current medicine + list on the left — only the list scrolls — ring and
   * scanner over the route map on the right). The Portrait | Landscape toggle on the order-scan page switches it
   * and the choice is remembered on the device; `default` is used until it is tapped. `toggle: false` hides it.
   */
  layout: {
    default: "portrait",
    toggle: true,
  },
  hideCursor: false,        // set true on the Raspberry Pi kiosk to hide the mouse pointer
  backgroundMotion: true,   // subtle floating pharmacy shapes on the order-scan/completion screens (set false for weakest hardware)

  /**
   * TEMPORARY test scanner: a barcode input box (on the order-scan screen and at the bottom of the
   * scanning screen). Whatever you type is sent through the SAME scanner service a physical scanner uses.
   * Set `enabled: false` when the real scanner is connected.
   */
  testScanner: {
    enabled: true,
  },

  /**
   * Physical scanner input. Most USB / Bluetooth barcode scanners act as a keyboard
   * ("keyboard wedge"): they type the barcode very fast and press Enter.
   * The keyboard-wedge adapter is already wired — plug the scanner in and it works.
   */
  scanner: {
    keyboardWedge: {
      enabled: true,
      minLength: 3,           // ignore accidental key presses shorter than this (auto-lowered to the shortest known barcode)
      maxKeyIntervalMs: 80,   // keystrokes farther apart than this are treated as human typing
      terminatorKeys: ["Enter", "Tab"],
      flushTimeoutMs: 300,    // emit even without a terminator once typing pauses (some scanners send no suffix)
    },
  },
};
