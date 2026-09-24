/**
 * Medicine locations in the picking room (pure, framework-free — unit-tested by scripts/workflow.test.mjs).
 *
 * data.js `storeLayout` describes the room: a square room whose open side is the entrance (the picker comes in
 * with the trolley) and whose other three walls carry the cupboards. Every cupboard has shelves and ONE LED.
 * A catalogue medicine says where it lives with `location: { wall, cupboard, shelf }`; this module turns that
 * into what the UI needs: the "Wall A › Cupboard 2 › Shelf 3" strip and the cupboard to light on the route map.
 */

export const WALL_SIDES = Object.freeze(['left', 'back', 'right']);

const toInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/**
 * Validated copy of data.js `storeLayout`: `{ entranceLabel, walls: [{ id, label, side, cupboards, shelves }] }`.
 * Wall ids are trimmed + upper-cased, unknown sides fall back to left/back/right in order, counts default to 1.
 */
export function normalizeLayout(layout) {
  const rawWalls = Array.isArray(layout?.walls) ? layout.walls : [];
  const seen = new Set();
  const walls = rawWalls
    .map((wall) => {
      const id = String(wall?.id ?? '').trim().toUpperCase();
      if (!id || seen.has(id)) return null;
      const side = WALL_SIDES.includes(wall?.side) ? wall.side : WALL_SIDES[seen.size % WALL_SIDES.length];
      seen.add(id);
      return {
        id,
        label: String(wall?.label ?? '').trim() || `Wall ${id}`,
        side,
        cupboards: toInt(wall?.cupboards) ?? 1,
        shelves: toInt(wall?.shelves) ?? 1,
      };
    })
    .filter(Boolean);
  return {
    entranceLabel: String(layout?.entranceLabel ?? '').trim() || 'Entrance',
    walls,
  };
}

/**
 * Where a medicine lives, resolved against the layout. Returns null when the medicine has no `location`.
 *
 *   { wallId: 'A', wallLabel: 'Wall A', side: 'left' | 'back' | 'right' | null,
 *     cupboard: 2, shelf: 3, key: 'A2', onMap: true }
 *
 * `onMap` is false when the wall is not in the layout or the cupboard number is out of range — the location
 * strip still shows the text, the route map just has nothing to light.
 */
export function resolveLocation(medicine, layout) {
  const raw = medicine?.location;
  if (!raw || typeof raw !== 'object') return null;
  const wallId = String(raw.wall ?? '').trim().toUpperCase();
  const cupboard = toInt(raw.cupboard);
  const shelf = toInt(raw.shelf);
  if (!wallId && !cupboard && !shelf) return null;

  const wall = normalizeLayout(layout).walls.find((w) => w.id === wallId) || null;
  const onMap = Boolean(wall && cupboard && cupboard <= wall.cupboards);
  return {
    wallId,
    wallLabel: wall?.label ?? (wallId ? `Wall ${wallId}` : ''),
    side: wall?.side ?? null,
    cupboard,
    shelf,
    key: wallId && cupboard ? `${wallId}${cupboard}` : null,
    onMap,
  };
}

/** Segments of the location strip, in walking order: [{ label: 'Wall', value: 'A' }, { label: 'Cupboard', value: 2 }, { label: 'Shelf', value: 3 }]. */
export function locationSegments(location) {
  if (!location) return [];
  return [
    { label: 'Wall', value: location.wallId || null },
    { label: 'Cupboard', value: location.cupboard },
    { label: 'Shelf', value: location.shelf },
  ].filter((s) => s.value !== null && s.value !== undefined && s.value !== '');
}

/** "Wall A · Cupboard 2 · Shelf 3" — for aria labels and the completion / success copy. */
export function formatLocation(location) {
  return locationSegments(location)
    .map((s) => `${s.label} ${s.value}`)
    .join(' · ');
}
