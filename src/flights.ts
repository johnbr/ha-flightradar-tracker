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
 * Everything about a flight that changes how its marker LOOKS, as one string.
 *
 * Comparing this is what keeps `setIcon` -- which rebuilds the marker's DOM --
 * off the hot path: an aircraft that only moved gets a `setLatLng` and nothing
 * else. Heading is rounded because it arrives as whole degrees and a rebuild
 * for a tenth of one would be waste.
 */
export function markerKey(flight: Flight): string {
  const heading = flight.heading === null ? 0 : Math.round(flight.heading) % 360;
  const kind = isHelicopter(flight) ? "h" : "p";
  return `${kind}|${heading}|${isOnGround(flight) ? "g" : "a"}`;
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
    if (moved || restyled) changed.push({ flight, moved, restyled });
  }

  const removed: string[] = [];
  for (const id of previous.keys()) if (!nextIds.has(id)) removed.push(id);

  return { added, changed, removed };
}

/** The short label a marker's tooltip shows. */
export function flightLabel(flight: Flight): string {
  return flight.callsign ?? flight.flight_number ?? flight.aircraft_registration ?? flight.id;
}
