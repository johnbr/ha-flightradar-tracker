/**
 * Reading `attributes.flights[]` into something the map can be patched from.
 *
 * Import-free (the `Flight` import is type-only and erased) so `node --test`
 * can type-strip and run it.
 *
 * The one non-obvious rule here: **the array is insertion order, not distance
 * order.** It is the coordinator's `_in_area` dict, so `flights[0]` is whichever
 * aircraft entered the box first. Anything that means "nearest" has to sort.
 */

import type { AreaBounds } from "./geo";
import type { Flight } from "./types";

/** A finite number, or null. Coordinates arrive as numbers, but not always. */
function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string | null {
  if (typeof value === "string") return value.trim() === "" ? null : value;
  return null;
}

/**
 * The aircraft's recent track, oldest point first.
 *
 * This array is the ONLY source of a trail. `flights` is an unrecorded
 * attribute upstream, so there is no history in the recorder to draw from --
 * whatever the integration last sent is all there is, capped at 50 points.
 * Measured live: it ends exactly on the aircraft's current position, so the
 * line always reaches its marker.
 */
export function parseTrack(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];
  const points: [number, number][] = [];
  for (const point of raw) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const lat = num(point[0]);
    const lon = num(point[1]);
    if (lat === null || lon === null) continue;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    points.push([lat, lon]);
  }
  return points;
}

/**
 * A stable identity for one aircraft.
 *
 * FR24's own `id` is the hex flight id and is what the coordinator keys on, so
 * it is used whenever present. The fallbacks exist because a marker keyed on
 * nothing is a marker that gets destroyed and rebuilt every tick -- which is
 * exactly the blinking this card is written to avoid.
 */
export function flightId(raw: Record<string, unknown>): string | null {
  return str(raw.id) ?? str(raw.callsign) ?? str(raw.aircraft_registration) ?? str(raw.aircraft_icao_24bit);
}

/** Helicopters get their own marker; everything else flies as a plane. */
export function isHelicopter(flight: Flight): boolean {
  return (flight.aircraft_category ?? "").toLowerCase() === "helicopter";
}

export function isOnGround(flight: Flight): boolean {
  return Number(flight.on_ground) === 1;
}

/**
 * ICAO type designators drawn as light aircraft rather than airliners.
 *
 * An explicit list, not a pattern. The obvious `^C1\d\d$` style rule reads
 * tidily and quietly captures a C130 Hercules; `^BE\d\d$` captures the BE40
 * Beechjet. The designators are a flat namespace with no shape to exploit, so
 * anything clever here is a rule that silently misfiles aircraft, and the whole
 * point of this classification is that it is stable and predictable.
 *
 * `aircraft_category` cannot do this job -- measured over a live sample it read
 * "Airplane" for a Cessna 152 and an A321 alike, and is only ever useful for
 * pulling helicopters out.
 *
 * Light twins and light turboprops are deliberately included: the distinction
 * being drawn is small-propeller-aircraft against airliner, which is what the
 * silhouettes actually differ on. To add a type, add its designator.
 */
const LIGHT_AIRCRAFT_TYPES = new Set([
  // Cessna singles
  "C120", "C140", "C150", "C152", "C162", "C170", "C172", "C175", "C177", "C180",
  "C182", "C185", "C188", "C190", "C195", "C205", "C206", "C207", "C208", "C210",
  "C77R", "C82R", "C82T", "C10T", "P210",
  // Piper
  "P28A", "P28B", "P28R", "P28S", "P28T", "P32R", "P32T", "PA11", "PA12", "PA14",
  "PA15", "PA16", "PA17", "PA18", "PA20", "PA22", "PA23", "PA24", "PA25", "PA27",
  "PA30", "PA31", "PA32", "PA34", "PA36", "PA38", "PA44", "PA46", "PAY1", "PAY2",
  // Beechcraft pistons and light twins (NOT BE40, which is a jet)
  "BE23", "BE24", "BE33", "BE35", "BE36", "BE50", "BE55", "BE58", "BE60", "BE76",
  "BE77", "BE95", "BE99", "BE9L", "BE20",
  // Cirrus, Diamond, Mooney, Grumman, Socata
  "SR20", "SR22", "S22T", "DA20", "DA40", "DA42", "DA62", "M20P", "M20T", "M20J",
  "AA1", "AA5", "TB20", "TB21", "TOBA",
  // Common homebuilts and taildraggers
  "RV4", "RV6", "RV7", "RV8", "RV9", "RV10", "RV12", "BL8", "CH7", "J3", "CUB",
  "GLAS", "LNC2", "VELO",
  // Light twins / utility
  "C303", "C310", "C337", "C402", "C404", "C414", "C421", "AC11", "AC50", "GA8",
]);

export type AircraftKind = "helicopter" | "light" | "jet";

/**
 * Which silhouette to draw. Unknown designators fall through to "jet", the
 * shape the card drew for everything before light aircraft were split out --
 * so a type missing from the list above is rendered exactly as it used to be.
 */
export function aircraftKind(flight: Flight): AircraftKind {
  if (isHelicopter(flight)) return "helicopter";
  const code = (flight.aircraft_code ?? "").trim().toUpperCase();
  return code && LIGHT_AIRCRAFT_TYPES.has(code) ? "light" : "jet";
}

/**
 * Everything about a flight that changes how its marker LOOKS, as one string.
 *
 * Comparing this is what keeps `setIcon` -- which rebuilds the marker's DOM --
 * off the hot path: an aircraft that only moved gets a `setLatLng` and nothing
 * else. Heading is rounded because it arrives as whole degrees and a rebuild
 * for a tenth of one would be waste.
 */
export function markerKey(flight: Flight): string {
  // The displayed angle, not the reported one -- the icon is rotated to the
  // direction of travel, so that is what has to trigger a redraw.
  const shown = flight.heading_display ?? flight.heading;
  const heading = shown === null || shown === undefined ? 0 : Math.round(shown) % 360;
  return `${aircraftKind(flight)[0]}|${heading}|${isOnGround(flight) ? "g" : "a"}`;
}

/**
 * A cheap fingerprint of the track, so a polyline is only re-pointed when its
 * shape actually moved.
 *
 * The track is a sliding window: a tick appends a point and drops the oldest,
 * so the length plus both ends identify it without walking 50 pairs per
 * aircraft per tick.
 */
export function trackKey(flight: Flight): string {
  const track = flight.coordinates;
  if (!track.length) return "0";
  const first = track[0]!;
  const last = track[track.length - 1]!;
  return `${track.length}|${first[0]},${first[1]}|${last[0]},${last[1]}`;
}

/**
 * Normalise the sensor attribute into flights that can actually be drawn.
 *
 * Rows without a usable identity or a real position are dropped rather than
 * defaulted: a NaN coordinate becomes a marker at 0,0 in the Gulf of Guinea,
 * which reads as a bug in the data rather than in the card.
 *
 * Sorted nearest-first, so "the first one" means something.
 */
export function parseFlights(raw: unknown): Flight[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const flights: Flight[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;

    const id = flightId(row);
    if (!id || seen.has(id)) continue;

    const latitude = num(row.latitude);
    const longitude = num(row.longitude);
    if (latitude === null || longitude === null) continue;
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) continue;

    seen.add(id);
    flights.push({
      ...(row as unknown as Flight),
      id,
      latitude,
      longitude,
      altitude: num(row.altitude),
      heading: num(row.heading),
      ground_speed: num(row.ground_speed),
      vertical_speed: num(row.vertical_speed),
      distance: num(row.distance),
      closest_distance: num(row.closest_distance),
      on_ground: num(row.on_ground),
      coordinates: parseTrack(row.coordinates),
    });
  }

  return sortByDistance(flights);
}

/** Nearest first; unknown distance last; ties broken on id so it is stable. */
export function sortByDistance(flights: readonly Flight[]): Flight[] {
  return [...flights].sort((a, b) => {
    const da = a.distance ?? Number.POSITIVE_INFINITY;
    const db = b.distance ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function indexById(flights: readonly Flight[]): Map<string, Flight> {
  return new Map(flights.map((f) => [f.id, f]));
}

export interface FlightChange {
  flight: Flight;
  /** Its position moved: the marker needs `setLatLng`. */
  moved: boolean;
  /** Its appearance changed: the marker needs `setIcon`. */
  restyled: boolean;
  /** Its track grew or shifted: the polyline needs `setLatLngs`. */
  retracked: boolean;
}

export interface FlightDiff {
  added: Flight[];
  changed: FlightChange[];
  /** Ids whose markers must be removed from the layer. */
  removed: string[];
}

/**
 * What changed between two ticks, so the map can be patched rather than rebuilt.
 *
 * Rebuilding the marker layer every 60 s is the obvious implementation and the
 * wrong one: it destroys marker identity, so the selected aircraft's highlight
 * and any open interaction die on every tick, and the whole field blinks.
 */
export function diffFlights(previous: ReadonlyMap<string, Flight>, next: readonly Flight[]): FlightDiff {
  const added: Flight[] = [];
  const changed: FlightChange[] = [];
  const nextIds = new Set<string>();

  for (const flight of next) {
    nextIds.add(flight.id);
    const before = previous.get(flight.id);
    if (!before) {
      added.push(flight);
      continue;
    }
    const moved = before.latitude !== flight.latitude || before.longitude !== flight.longitude;
    const restyled = markerKey(before) !== markerKey(flight);
    const retracked = trackKey(before) !== trackKey(flight);
    if (moved || restyled || retracked) changed.push({ flight, moved, restyled, retracked });
  }

  const removed: string[] = [];
  for (const id of previous.keys()) if (!nextIds.has(id)) removed.push(id);

  return { added, changed, removed };
}

/** The short label a marker's tooltip shows. */
export function flightLabel(flight: Flight): string {
  return flight.callsign ?? flight.flight_number ?? flight.aircraft_registration ?? flight.id;
}

/** An airport referenced by a flight currently in the area. */
export interface Airport {
  code: string;
  name: string | null;
  latitude: number;
  longitude: number;
}

/**
 * The airports the aircraft overhead are flying between, deduplicated.
 *
 * This is NOT an airport database, and the difference matters: the only source
 * is the origin/destination fields on the flights the sensor is reporting right
 * now, so a field with nothing in the air near it does not appear. Where the
 * card is pointed at a busy GA area that is a distinction without a difference
 * -- the local fields are named by their own circuit traffic continuously --
 * but a quiet strip can blink in and out, and no amount of caching would make
 * it authoritative, so none is attempted.
 *
 * Bounded to the watched area on purpose. A flight from Denver carries Denver's
 * coordinates, and plotting every referenced airport would scatter markers
 * across the country for aircraft that happen to be passing overhead.
 */
export function collectAirports(flights: Flight[], bounds?: AreaBounds | null): Airport[] {
  const found = new Map<string, Airport>();
  for (const flight of flights) {
    for (const side of ["origin", "destination"] as const) {
      const code = flight[`airport_${side}_code_iata`];
      const latitude = flight[`airport_${side}_latitude`];
      const longitude = flight[`airport_${side}_longitude`];
      if (!code || typeof latitude !== "number" || typeof longitude !== "number") continue;
      // 0,0 is the Atlantic, and is what the feed sends for an airport it does
      // not know -- the same guard `airportPosition` makes for the route line.
      if (latitude === 0 && longitude === 0) continue;
      if (bounds) {
        if (latitude > bounds.north || latitude < bounds.south) continue;
        if (longitude < bounds.west || longitude > bounds.east) continue;
      }
      if (!found.has(code)) {
        found.set(code, { code, name: flight[`airport_${side}_name`], latitude, longitude });
      }
    }
  }
  return [...found.values()].sort((a, b) => a.code.localeCompare(b.code));
}
