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

/**
 * The `pad` that fits the watched area `offset` zoom levels tighter than
 * `basePad` alone would.
 *
 * `ha-map` fits `latLngBounds(corners).pad(pad)`, so the span it must fit is
 * `(1 + 2 * pad)` times the watched box, and one zoom level is exactly a
 * halving of that span. Solving `(1 + 2 * p) = (1 + 2 * basePad) * 2^-offset`
 * therefore lands exactly `offset` INTEGER levels in: Leaflet floors the
 * continuous fit to a whole zoom, and `floor(z + n) === floor(z) + n` for
 * integer `n`.
 *
 * Expressed as padding rather than by reading the resulting zoom back and
 * adding to it, for two reasons that are both real:
 *
 * 1. The read-back is unreliable. `ha-map.fitBounds` calls `_deferIfUnsized`
 *    and re-queues the whole fit when the map has no layout yet, so the zoom
 *    immediately afterwards can still be the previous view's.
 * 2. Assigning `el.zoom` would ALSO cap every later fit. `ha-map` passes that
 *    property straight through as Leaflet's `maxZoom`
 *    (`{maxZoom: options?.zoom || this.zoom}`), so a zoom stored to bias one
 *    fit silently becomes a ceiling on the next one.
 *
 * A negative result is normal and means the fit crops the area, which is what
 * a positive offset asks for. It approaches -0.5 as the offset grows but never
 * reaches it, so the padded bounds cannot invert.
 */
export function padForZoomOffset(basePad: number, offset: number): number {
  // Short-circuited rather than left to the arithmetic, which returns
  // 0.050000000000000044 for a base of 0.05: harmless in effect, but this way
  // `zoom_offset: 0` provably reproduces the plain area fit rather than merely
  // matching it to within a rounding error.
  if (offset === 0) return basePad;
  return ((1 + 2 * basePad) * 2 ** -offset - 1) / 2;
}

/** Initial great-circle bearing from `from` to `to`, in degrees true (0-360). */
export function bearingDeg(from: LatLon, to: LatLon): number {
  const rad = Math.PI / 180;
  const lat1 = from[0] * rad;
  const lat2 = to[0] * rad;
  const dLon = (to[1] - from[1]) * rad;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) / rad) + 360) % 360;
}

/**
 * Which way to point an aircraft: the way it is visibly travelling.
 *
 * The feed's `heading` is where the NOSE points, which is not the same as the
 * direction of travel -- and the marker glides in a straight line between two
 * fixes, so any difference reads as an aircraft flying sideways. The two agree
 * in level cruise and diverge exactly where this is most visible: an aircraft
 * in a turn, whose reported heading has already swung to its new value while
 * the segment being drawn is still the old one. In circuit traffic around a
 * GA field that is most of the fleet, most of the time.
 *
 * So the segment wins whenever there is a real segment to measure. Below
 * `minKm` the aircraft is parked, taxiing, or the movement is indistinguishable
 * from position noise, and a bearing computed from it would spin the icon
 * randomly -- there the reported heading is the better answer.
 */
export function travelHeading(
  from: LatLon,
  to: LatLon,
  fallback: number | null,
  minKm: number
): number | null {
  if (haversineKm(from, to) < minKm) return fallback;
  return bearingDeg(from, to);
}
