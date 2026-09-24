import React, { useEffect, useMemo, useRef } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { Route, ShoppingCart } from 'lucide-react';
import { Card } from 'components/ui/card';
import { normalizeLayout, resolveLocation } from 'lib/locations';
import { MEDICINE_STATUS } from 'lib/workflow';
import { EASE } from 'components/kiosk/motion';
import { cn } from 'lib/utils';

/* ── Room geometry (SVG user units) ──────────────────────────────────────────────────────────────
   Top view of the square picking room. The entrance is the opening in the bottom wall; the left,
   back and right walls carry the cupboards (numbered from the entrance), each with one LED on its
   aisle-facing edge. The picking TRACK runs along the aisles in front of the cupboards. */
const VB = { w: 400, h: 300 };
const ROOM = { x: 44, y: 30, w: 312, h: 236 };
const RIGHT = ROOM.x + ROOM.w;
const BOTTOM = ROOM.y + ROOM.h;
const CX = ROOM.x + ROOM.w / 2;
const DEPTH = 34; // cupboard depth
const GAP = 4; // between cupboards
const PAD = 6; // clearance in the corners
const DOOR = 80; // width of the entrance opening
const AISLE = 22; // the track (and every stop) lies this far in front of the cupboard face (its LED)
const HOME = { x: CX, y: BOTTOM - 18 }; // where the trolley waits when no cupboard of the order is on the map
const TROLLEY_R = 12;

const WALLS_D =
  `M ${ROOM.x} ${BOTTOM} V ${ROOM.y} H ${RIGHT} V ${BOTTOM}` +
  ` M ${ROOM.x} ${BOTTOM} H ${CX - DOOR / 2}` +
  ` M ${CX + DOOR / 2} ${BOTTOM} H ${RIGHT}`;

// Literal class names only — Tailwind generates just what it finds verbatim in the source.
const TONES = {
  action: {
    halo: 'stroke-ot-action/40',
    box: 'fill-ot-action-fill/30 stroke-ot-action',
    boxDim: 'fill-ot-action/10 stroke-ot-action/55',
    led: 'fill-ot-action',
    ledHalo: 'fill-ot-action/45',
    track: 'stroke-ot-action/25',
    flow: 'stroke-ot-action',
    stop: 'fill-ot-bg-bottom stroke-ot-action',
    trolley: 'stroke-ot-action',
    trolleyHalo: 'fill-ot-action/30',
    chip: 'border-ot-action/50 bg-ot-action/10 text-ot-action',
  },
  green: {
    halo: 'stroke-emerald-400/40',
    box: 'fill-emerald-400/25 stroke-emerald-400',
    boxDim: 'fill-emerald-400/10 stroke-emerald-400/50',
    led: 'fill-emerald-400',
    ledHalo: 'fill-emerald-400/45',
    track: 'stroke-emerald-400/25',
    flow: 'stroke-emerald-400',
    stop: 'fill-emerald-400 stroke-emerald-400',
    trolley: 'stroke-emerald-400',
    trolleyHalo: 'fill-emerald-400/30',
    chip: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
  },
};
const TRAIL = 'stroke-emerald-400/90'; // the part of the track the trolley has already travelled

const RANK = { collected: 0, pending: 1, active: 2 };

/** Every cupboard of the layout as a rectangle on the map, with the point on its aisle-facing edge (LED). */
function buildCupboards(walls) {
  const out = [];
  for (const wall of walls) {
    const n = wall.cupboards;
    if (wall.side === 'back') {
      const runStart = ROOM.x + 3 + DEPTH + PAD;
      const runEnd = RIGHT - 3 - DEPTH - PAD;
      const w = (runEnd - runStart - GAP * (n - 1)) / n;
      for (let i = 1; i <= n; i += 1) {
        const x = runStart + (i - 1) * (w + GAP);
        const y = ROOM.y + 3;
        out.push({ key: `${wall.id}${i}`, wallId: wall.id, side: 'back', x, y, w, h: DEPTH, face: { x: x + w / 2, y: y + DEPTH } });
      }
    } else {
      const left = wall.side === 'left';
      const x = left ? ROOM.x + 3 : RIGHT - 3 - DEPTH;
      const runStart = ROOM.y + 3 + DEPTH + PAD;
      const runEnd = BOTTOM - 3 - PAD;
      const h = (runEnd - runStart - GAP * (n - 1)) / n;
      for (let i = 1; i <= n; i += 1) {
        const y = runEnd - i * h - (i - 1) * GAP; // cupboard 1 is nearest the entrance
        out.push({ key: `${wall.id}${i}`, wallId: wall.id, side: wall.side, x, y, w: DEPTH, h, face: { x: left ? x + DEPTH : x, y: y + h / 2 } });
      }
    }
  }
  return out;
}

const ledPoint = (c) =>
  c.side === 'back' ? { x: c.face.x, y: c.face.y - 3 } : c.side === 'left' ? { x: c.face.x - 3, y: c.face.y } : { x: c.face.x + 3, y: c.face.y };

/** Where the picker stands for a cupboard: on the aisle, straight in front of its face. */
const stopPoint = (c) =>
  c.side === 'back' ? { x: c.face.x, y: c.face.y + AISLE } : c.side === 'left' ? { x: c.face.x + AISLE, y: c.face.y } : { x: c.face.x - AISLE, y: c.face.y };

const same = (a, b) => Math.abs(a - b) < 0.5;

/** Orthogonal walk from stop `a` to stop `b` along the aisles (points, `a` first). */
function legPoints(a, b) {
  if (a.side === b.side) return [a.pt, b.pt]; // same wall: straight along that aisle
  if (a.side !== 'back' && b.side !== 'back') {
    // opposite side walls: along the current aisle to the other cupboard's height, then straight across the room
    return same(a.pt.y, b.pt.y) ? [a.pt, b.pt] : [a.pt, { x: a.pt.x, y: b.pt.y }, b.pt];
  }
  // side wall ↔ back wall: to the corner where the two aisles meet, then along the other aisle
  const side = a.side === 'back' ? b : a;
  const back = a.side === 'back' ? a : b;
  return [a.pt, { x: side.pt.x, y: back.pt.y }, b.pt];
}

/**
 * The picking track: the cupboards of the order's medicines in LIST ORDER, joined by orthogonal legs along the
 * aisles — it starts at the first medicine's cupboard and ends at the last one's. `stops[i]` belongs to medicine i
 * (null when its location is not on the map) and carries `dist`, how far along the track that stop lies;
 * `pts` / `cum` (cumulative length at each point) describe the polyline for drawing and for moving the trolley.
 */
function buildTrack(medicines, layout, cupboards) {
  const byKey = new Map(cupboards.map((c) => [c.key, c]));
  const stops = medicines.map((m) => {
    const loc = resolveLocation(m, layout);
    const c = loc?.onMap ? byKey.get(loc.key) : null;
    return c ? { key: c.key, side: c.side, pt: stopPoint(c), dist: 0 } : null;
  });

  const pts = [];
  const cum = [];
  let length = 0;
  const push = (p) => {
    const last = pts[pts.length - 1];
    if (last && same(last.x, p.x) && same(last.y, p.y)) return;
    if (last) length += Math.hypot(p.x - last.x, p.y - last.y);
    pts.push(p);
    cum.push(length);
  };
  let prev = null;
  for (const stop of stops) {
    if (!stop) continue;
    if (prev) legPoints(prev, stop).forEach(push);
    else push(stop.pt);
    stop.dist = length;
    prev = stop;
  }
  return {
    stops,
    pts,
    cum,
    length,
    d: pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '),
  };
}

/** The point `dist` user units along the track (clamped to its ends; HOME when there is no track). */
function pointAt(track, dist) {
  const { pts, cum } = track;
  if (pts.length === 0) return HOME;
  if (pts.length === 1 || dist <= 0) return pts[0];
  if (dist >= track.length) return pts[pts.length - 1];
  let i = 1;
  while (i < cum.length - 1 && cum[i] < dist) i += 1;
  const a = pts[i - 1];
  const b = pts[i];
  const t = (dist - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function WallLabel({ wall }) {
  const label = wall.label.toUpperCase();
  const cls = 'fill-ot-text-muted/80 text-[8px] h-short:text-[10px] font-bold tracking-[0.25em]';
  if (wall.side === 'back') {
    return <text x={CX} y={ROOM.y - 10} textAnchor="middle" className={cls}>{label}</text>;
  }
  const x = wall.side === 'left' ? ROOM.x - 14 : RIGHT + 14;
  const rot = wall.side === 'left' ? -90 : 90;
  return (
    <text transform={`translate(${x} ${ROOM.y + ROOM.h / 2 + 20}) rotate(${rot})`} textAnchor="middle" className={cls}>
      {label}
    </text>
  );
}

/**
 * ROUTE MAP card (right of the scanner): the picking room from above — entrance at the bottom, cupboards along
 * the left / back / right walls (data.js `storeLayout`). The order's medicines make ONE picking track: a lit line
 * from the FIRST medicine's cupboard through every cupboard of the order to the LAST one's (list order), with a
 * stop in front of each. Every cupboard on the track is lit — the current medicine's brightly, collected ones
 * green — and the TROLLEY moves along the track to the current medicine's stop (`activeIndex`, which follows the
 * next pack to collect and any row tapped in the list); the part of the track behind it turns green.
 * Only opacity / stroke / translate animations (Pi friendly).
 */
export default function RoomMap({ layout, medicines = [], statuses = [], activeIndex = -1, allCollected = false, className }) {
  const { walls, entranceLabel } = useMemo(() => normalizeLayout(layout), [layout]);
  const cupboards = useMemo(() => buildCupboards(walls), [walls]);
  const track = useMemo(() => buildTrack(medicines, layout, cupboards), [medicines, layout, cupboards]);
  const hasTrack = track.pts.length > 0;

  const activeMedicine = activeIndex >= 0 ? medicines[activeIndex] : null;
  const activeLocation = useMemo(() => resolveLocation(activeMedicine, layout), [activeMedicine, layout]);
  const activeStop = !allCollected && activeIndex >= 0 ? track.stops[activeIndex] : null;
  const activeCollected = statuses[activeIndex] === MEDICINE_STATUS.COLLECTED;
  const t = TONES[allCollected || activeCollected ? 'green' : 'action'];

  // What each cupboard of the order shows: 'active' (the current medicine's) beats 'pending' beats 'collected'
  // when several medicines of the order share a cupboard.
  const cupboardState = useMemo(() => {
    const state = new Map();
    track.stops.forEach((stop, i) => {
      if (!stop) return;
      const collected = allCollected || statuses[i] === MEDICINE_STATUS.COLLECTED;
      const next = activeStop && i === activeIndex ? 'active' : collected ? 'collected' : 'pending';
      const cur = state.get(stop.key);
      if (cur === undefined || RANK[next] > RANK[cur]) state.set(stop.key, next);
    });
    return state;
  }, [track, statuses, allCollected, activeStop, activeIndex]);
  const stopsOnMap = Array.from(cupboardState.keys());

  // Trolley: sits at the current medicine's stop and glides along the track to the next one (to the end of the
  // track once everything is collected). `dist` is its position along the track in user units.
  const target = allCollected ? track.length : activeStop ? activeStop.dist : null;
  const dist = useMotionValue(target ?? 0);
  const lastTarget = useRef(target);
  useEffect(() => {
    if (target === null || target === lastTarget.current) return undefined;
    lastTarget.current = target;
    const from = dist.get();
    const controls = animate(dist, target, { duration: Math.min(2.4, Math.max(0.7, Math.abs(target - from) / 110)), ease: EASE.inOut });
    return () => controls.stop();
  }, [target, dist]);
  const trolleyX = useTransform(dist, (d) => pointAt(track, d).x);
  const trolleyY = useTransform(dist, (d) => pointAt(track, d).y);
  const travelled = useTransform(dist, (d) => (track.length > 0 ? Math.min(1, Math.max(0, d / track.length)) : 0));

  const chip = allCollected
    ? 'All collected'
    : !activeLocation
      ? 'Location not set'
      : `${activeLocation.wallLabel}${activeLocation.cupboard ? ` · Cupboard ${activeLocation.cupboard}` : ''}${activeLocation.onMap ? '' : ' · not on map'}`;
  const chipTone = allCollected ? TONES.green.chip : activeStop ? t.chip : 'border-ot-border/50 bg-ot-surface-bottom/50 text-ot-text-muted';
  const wallBySide = Object.fromEntries(walls.map((w) => [w.side, w]));
  const svgLabel = hasTrack
    ? `Picking route through ${stopsOnMap.length} cupboard${stopsOnMap.length === 1 ? '' : 's'}, first medicine to last${
        activeStop ? `; the trolley is at ${activeLocation.wallLabel}, cupboard ${activeLocation.cupboard}` : ''
      }`
    : 'Map of the picking room';

  return (
    <Card role="region" aria-label="Route map" className={cn('flex min-h-0 flex-col overflow-hidden p-3', className)}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-ot-action">
          <Route className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          <span className="truncate text-xs md:text-sm font-bold uppercase tracking-[0.25em] h-xtall:tracking-[0.15em]">Picking route</span>
        </div>
        <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[0.65rem] md:text-xs h-xtall:text-sm font-semibold', chipTone)}>{chip}</span>
      </div>

      <div className="relative mt-2 min-h-0 flex-1">
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full" role="img" aria-label={svgLabel}>
          {/* floor + walls */}
          <rect x={ROOM.x} y={ROOM.y} width={ROOM.w} height={ROOM.h} rx={6} className="fill-ot-bg-bottom/50" />
          <path d={WALLS_D} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className="stroke-ot-border/60" />
          {['left', 'back', 'right'].map((side) => (wallBySide[side] ? <WallLabel key={side} wall={wallBySide[side]} /> : null))}
          <text x={CX} y={BOTTOM + 17} textAnchor="middle" className="fill-ot-text-muted/80 text-[8px] h-short:text-[10px] font-bold tracking-[0.25em]">
            {entranceLabel.toUpperCase()}
          </text>
          {walls.length === 0 && (
            <text x={CX} y={ROOM.y + ROOM.h / 2} textAnchor="middle" className="fill-ot-text-muted text-[11px] font-semibold">
              Add storeLayout in data.js
            </text>
          )}

          {/* cupboards with their LED: every cupboard of the order is lit, the current one brightly, collected ones green */}
          {cupboards.map((c) => {
            const state = cupboardState.get(c.key);
            const active = state === 'active';
            const tone = state === 'collected' ? TONES.green : active ? t : TONES.action;
            const led = ledPoint(c);
            return (
              <g key={c.key}>
                {active && <rect x={c.x - 3} y={c.y - 3} width={c.w + 6} height={c.h + 6} rx={6} fill="none" strokeWidth={4} className={cn('animate-soft-pulse', tone.halo)} />}
                <rect
                  x={c.x}
                  y={c.y}
                  width={c.w}
                  height={c.h}
                  rx={3}
                  strokeWidth={active ? 2 : state ? 1.5 : 1}
                  className={active ? tone.box : state ? tone.boxDim : 'fill-ot-surface-elev-top/40 stroke-ot-border/45'}
                />
                <text
                  x={c.x + c.w / 2}
                  y={c.y + c.h / 2}
                  dy="0.35em"
                  textAnchor="middle"
                  className={cn('font-bold text-[9px] h-short:text-[11px]', state ? 'fill-white' : 'fill-ot-text-muted/80')}
                >
                  {c.key}
                </text>
                {active && <circle cx={led.x} cy={led.y} r={6} className={cn('animate-soft-pulse', tone.ledHalo)} />}
                <circle cx={led.x} cy={led.y} r={active ? 3 : state ? 2.5 : 2} className={active ? 'fill-white' : state ? tone.led : 'fill-ot-border/50'} />
              </g>
            );
          })}

          {/* the track: draws itself first → last, dashes flow along it, the travelled part is solid green */}
          {track.pts.length > 1 && (
            <g key={track.d}>
              <motion.path
                d={track.d}
                fill="none"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={allCollected ? TONES.green.track : TONES.action.track}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: EASE.out }}
              />
              <motion.path
                d={track.d}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="7 9"
                className={cn('route-flow', allCollected ? TONES.green.flow : TONES.action.flow)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              />
              <motion.path d={track.d} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className={TRAIL} style={{ pathLength: travelled }} />
            </g>
          )}

          {/* one stop in front of every cupboard of the order */}
          {hasTrack &&
            stopsOnMap.map((key) => {
              const stop = track.stops.find((s) => s?.key === key);
              const state = cupboardState.get(key);
              const tone = state === 'collected' ? TONES.green : state === 'active' ? t : TONES.action;
              return <circle key={key} cx={stop.pt.x} cy={stop.pt.y} r={4.5} strokeWidth={2} className={tone.stop} />;
            })}

          {/* the picker with the trolley — moves along the track (waits at the entrance when nothing is on the map) */}
          <motion.g style={{ x: trolleyX, y: trolleyY }} aria-hidden="true">
            {hasTrack && <circle r={TROLLEY_R + 7} className={cn('animate-soft-pulse', t.trolleyHalo)} />}
            <circle r={TROLLEY_R} strokeWidth={2} className={cn('fill-ot-surface-elev-top', hasTrack ? t.trolley : 'stroke-ot-border/60')} />
            <ShoppingCart x={-7} y={-7} width={14} height={14} className="text-white" strokeWidth={2} />
          </motion.g>
        </svg>
      </div>
    </Card>
  );
}
