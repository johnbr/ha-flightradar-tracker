/**
 * Geometry. Import-free so `node --test` can type-strip and run it.
 *
 * Milestone 1 needs only the watched area; distances, bearings and great-circle
 * progress arrive with the detail panel.
 */

export type LatLon = [number, number];

/** The watched area, as the integration publishes it. */
export interface AreaBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

/**
 * Parse `attributes.bounds`.
 *
 * The integration publishes it as a single comma-separated string in
 * **N,S,W,E** order -- e.g. `"34.174085,33.724427,-117.844108,-117.302035"` --
 * which is neither Leaflet's corner-pair order nor GeoJSON's. Getting the order
 * wrong does not throw: it silently produces a box somewhere in the Southern
 * Ocean, so the order is asserted in the tests rather than trusted.
 *
 * Returns null on anything unparseable; the caller then leaves the map on
 * `ha-map`'s own view (the home coordinates) instead of fitting to nonsense.
 */
export function parseBounds(raw: unknown): AreaBounds | null {
  if (typeof raw !== "string") return null;
  const parts = raw.split(",");
  if (parts.length !== 4) return null;

  const values = parts.map((p) => Number(p.trim()));
  if (values.some((v) => !Number.isFinite(v))) return null;

  const [north, south, west, east] = values as [number, number, number, number];
  if (Math.abs(north) > 90 || Math.abs(south) > 90) return null;
  if (Math.abs(west) > 180 || Math.abs(east) > 180) return null;

  return {
    // Defensive: a reversed pair would make an empty box, which fits to a point
    // and reads as "the map is broken" rather than "the bounds were odd".
    north: Math.max(north, south),
    south: Math.min(north, south),
    west,
    east,
  };
}

/** The two corners Leaflet's `fitBounds` wants. */
export function boundsCorners(bounds: AreaBounds): [LatLon, LatLon] {
  return [
    [bounds.north, bounds.west],
    [bounds.south, bounds.east],
  ];
}

/**
 * The centre of the box, which is the centre of the watched circle: the
 * integration derives the bounds as that circle's bounding square.
 */
export function boundsCenter(bounds: AreaBounds): LatLon {
  return [(bounds.north + bounds.south) / 2, (bounds.west + bounds.east) / 2];
}
