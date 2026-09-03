/**
 * Formatting for the detail panel. Import-free so `node --test` can run it.
 *
 * Every function returns null for "no such value", so the panel can drop a row
 * rather than print a dash: the FR24 payload is full of legitimately absent
 * fields (a helicopter has no destination, a VFR flight no squawk), and a grid
 * of dashes reads as a broken card.
 *
 * Numbers are grouped by hand rather than with `toLocaleString`, whose output
 * depends on the runtime's locale -- which would make these tests pass on one
 * machine and fail on another, and put a comma in an altitude for one viewer
 * and a full stop for the next.
 */

export type AltitudeUnit = "ft" | "m";
export type SpeedUnit = "mph" | "kts" | "kmh";
export type DistanceUnit = "mi" | "km" | "nm";

export interface Units {
  altitude: AltitudeUnit;
  speed: SpeedUnit;
  distance: DistanceUnit;
}

/** The house is imperial; the sensor is not. */
export const DEFAULT_UNITS: Units = { altitude: "ft", speed: "mph", distance: "mi" };

const FT_TO_M = 0.3048;
const KTS_TO_MPH = 1.15078;
const KTS_TO_KMH = 1.852;
const KM_TO_MI = 0.621371;
const KM_TO_NM = 0.539957;

/** Below this a climb or descent is noise, not a trend. */
const LEVEL_FPM = 50;

const COMPASS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
];

function usable(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Thousands separators, and a fixed number of decimals. */
export function group(value: number, decimals = 0): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [whole, fraction] = fixed.split(".");
  const grouped = (whole ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = value < 0 ? "-" : "";
  return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`;
}

/** Altitude in feet, as the payload gives it. */
export function formatAltitude(feet: number | null | undefined, unit: AltitudeUnit): string | null {
  if (!usable(feet)) return null;
  if (unit === "m") return `${group(feet * FT_TO_M)} m`;
  return `${group(feet)} ft`;
}

/** Ground speed in knots, as the payload gives it. */
export function formatSpeed(knots: number | null | undefined, unit: SpeedUnit): string | null {
  if (!usable(knots)) return null;
  if (unit === "kts") return `${group(knots)} kts`;
  if (unit === "kmh") return `${group(knots * KTS_TO_KMH)} km/h`;
  return `${group(knots * KTS_TO_MPH)} mph`;
}

/** Distance in kilometres, as the payload gives it. */
export function formatDistance(km: number | null | undefined, unit: DistanceUnit): string | null {
  if (!usable(km)) return null;
  if (unit === "km") return `${group(km, 1)} km`;
  if (unit === "nm") return `${group(km * KM_TO_NM, 1)} nm`;
  return `${group(km * KM_TO_MI, 1)} mi`;
}

/**
 * Vertical speed, in feet per minute.
 *
 * The arrow carries the sign, so the number is printed unsigned -- "↓ -64" is
 * a double negative the eye has to unpick mid-scan.
 */
export function formatVerticalSpeed(fpm: number | null | undefined): string | null {
  if (!usable(fpm)) return null;
  if (Math.abs(fpm) < LEVEL_FPM) return "Level";
  const arrow = fpm > 0 ? "↑" : "↓";
  return `${arrow} ${group(Math.abs(fpm))} ft/min`;
}

export function compassPoint(degrees: number): string {
  const normalised = ((degrees % 360) + 360) % 360;
  return COMPASS[Math.round(normalised / 22.5) % 16]!;
}

/** Track, as three padded digits plus the compass point: "006° N". */
export function formatHeading(degrees: number | null | undefined): string | null {
  if (!usable(degrees)) return null;
  const normalised = Math.round(((degrees % 360) + 360) % 360) % 360;
  return `${String(normalised).padStart(3, "0")}° ${compassPoint(normalised)}`;
}

/** A squawk of "" or "0000" is "not squawking", not a code worth a row. */
export function formatSquawk(squawk: string | null | undefined): string | null {
  if (typeof squawk !== "string") return null;
  const trimmed = squawk.trim();
  if (trimmed === "" || trimmed === "0000") return null;
  return trimmed;
}

/**
 * The Flightradar24 page for this flight.
 *
 * Same shape the integration's own bundled card uses, so a link from either
 * card lands in the same place.
 */
export function fr24Url(id: string | null, slug: string | null): string | null {
  const flightId = (id ?? "").trim();
  const label = (slug ?? "").trim();
  if (flightId && label) {
    return `https://fr24.com/${encodeURIComponent(label)}/${encodeURIComponent(flightId)}`;
  }
  if (label) return `https://www.flightradar24.com/${encodeURIComponent(label)}`;
  if (flightId) return `https://www.flightradar24.com/${encodeURIComponent(flightId)}`;
  return null;
}

/**
 * An epoch that means something.
 *
 * The payload uses `0` for "no such time" as well as null -- `time_scheduled_
 * departure` is 0 on every police and GA flight measured -- and 0 is a real
 * instant in 1970, so it has to be rejected explicitly or the panel prints
 * "Departs 4:00 PM" for an aircraft that has no schedule at all.
 */
export function epochOrNull(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

/**
 * Shift an epoch into an airport's own local time.
 *
 * The offsets are fixed seconds from the payload (`-14400` for EDT, `-25200`
 * for PDT), so the shift-then-read-UTC trick is exact and needs no timezone
 * database -- and, crucially, gives the same answer whatever zone the browser
 * or the test runner is in.
 */
function shifted(epoch: number, offsetSeconds: number): Date {
  return new Date((epoch + offsetSeconds) * 1000);
}

/** "2026-09-02" in the airport's local time, for comparing calendar days. */
export function localDateKey(epoch: number, offsetSeconds: number): string {
  const d = shifted(epoch, offsetSeconds);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${month}-${day}`;
}

/** A clock time in the airport's own zone: "8:10 PM EDT". */
export function formatAirportTime(
  epoch: number | null | undefined,
  offsetSeconds: number | null | undefined,
  abbr: string | null | undefined,
  hour12: boolean
): string | null {
  const at = epochOrNull(epoch);
  if (at === null) return null;
  // No offset means the time cannot be placed in the airport's own zone. UTC
  // would be worse than nothing: it reads as a local time and is hours wrong.
  if (typeof offsetSeconds !== "number" || !Number.isFinite(offsetSeconds)) return null;

  const d = shifted(at, offsetSeconds);
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const clock = hour12
    ? `${((hours + 11) % 12) + 1}:${minutes} ${hours < 12 ? "AM" : "PM"}`
    : `${String(hours).padStart(2, "0")}:${minutes}`;
  const zone = typeof abbr === "string" && abbr.trim() !== "" ? ` ${abbr.trim()}` : "";
  return `${clock}${zone}`;
}

/**
 * Calendar days between departure and arrival, each in its OWN local zone --
 * the airline "+1", which is what a reader needs to know a red-eye lands
 * tomorrow. Westbound flights can legitimately produce a negative.
 */
export function dayOffset(
  departure: number | null | undefined,
  departureOffset: number | null | undefined,
  arrival: number | null | undefined,
  arrivalOffset: number | null | undefined
): number {
  const dep = epochOrNull(departure);
  const arr = epochOrNull(arrival);
  if (dep === null || arr === null) return 0;
  if (typeof departureOffset !== "number" || typeof arrivalOffset !== "number") return 0;
  const a = Date.parse(`${localDateKey(dep, departureOffset)}T00:00:00Z`);
  const b = Date.parse(`${localDateKey(arr, arrivalOffset)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** "1h 12m", "47m". */
export function formatDuration(minutes: number | null | undefined): string | null {
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes < 0) return null;
  const total = Math.round(minutes);
  if (total < 1) return "< 1m";
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return hours ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
}

const KM_TO_NM_ETA = 0.539957;

/**
 * Minutes until arrival.
 *
 * The reported estimate wins: it is the airline's, and it knows about the
 * approach, the taxi and the hold. Distance over ground speed is the fallback
 * for flights that carry no estimate, and it always reads optimistic -- it
 * flies the aircraft straight to the threshold at cruise.
 *
 * An estimate already in the past is not used: a late aircraft would otherwise
 * report a negative countdown, or "0m" for the rest of the flight.
 */
export function etaMinutes(
  arrivalEpoch: number | null | undefined,
  remainingKm: number | null | undefined,
  groundSpeedKnots: number | null | undefined,
  nowEpoch: number
): number | null {
  const arrival = epochOrNull(arrivalEpoch);
  if (arrival !== null && arrival > nowEpoch) return (arrival - nowEpoch) / 60;
  if (
    typeof remainingKm === "number" &&
    Number.isFinite(remainingKm) &&
    typeof groundSpeedKnots === "number" &&
    Number.isFinite(groundSpeedKnots) &&
    groundSpeedKnots > 0
  ) {
    return ((remainingKm * KM_TO_NM_ETA) / groundSpeedKnots) * 60;
  }
  return null;
}
