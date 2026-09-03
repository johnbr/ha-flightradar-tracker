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
