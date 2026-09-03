/**
 * Geometry. Import-free so `node --test` can type-strip and run it.
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

/** Mean Earth radius, km. */
const EARTH_KM = 6371.0088;

const RAD = Math.PI / 180;

/**
 * Great-circle distance in kilometres.
 *
 * Haversine rather than the spherical law of cosines: the two agree to metres
 * over a continent, but cosines loses its precision on short hops, and the
 * short hop is exactly the case that matters here -- an aircraft three
 * kilometres from the runway.
 */
export function haversineKm(from: LatLon, to: LatLon): number {
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export interface RouteProgress {
  flownKm: number;
  remainingKm: number;
  /** 0 to 1. */
  fraction: number;
}

/**
 * How much of the journey is behind the aircraft.
 *
 * Deliberately `flown / (flown + remaining)` rather than
 * `flown / origin-to-destination`. The direct-distance form is the obvious one
 * and it misbehaves on any flight that is not on the straight line: a dogleg
 * around weather, a hold, or an overflown destination all read past 100 %, and
 * a bar cannot show 112 %. Measuring both legs from where the aircraft actually
 * is keeps the fraction inside [0, 1] by construction, and makes the two
 * numbers beside the bar -- flown, and left to run -- both true.
 *
 * Null when either airport has no position, which is most of general aviation.
 */
export function routeProgress(
  origin: LatLon | null,
  current: LatLon,
  destination: LatLon | null
): RouteProgress | null {
  if (!origin || !destination) return null;
  const flownKm = haversineKm(origin, current);
  const remainingKm = haversineKm(current, destination);
  const total = flownKm + remainingKm;
  // An aircraft sitting on top of both airports is not a journey.
  if (total <= 0) return null;
  return { flownKm, remainingKm, fraction: Math.min(1, Math.max(0, flownKm / total)) };
}

/** The airport position, when the payload carries one. */
export function airportPosition(lat: number | null, lon: number | null): LatLon | null {
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  // FR24 sends 0,0 for an airport it does not know -- which is in the Atlantic.
  if (lat === 0 && lon === 0) return null;
  return [lat, lon];
}
