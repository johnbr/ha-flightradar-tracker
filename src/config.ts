/**
 * Config parsing and validation.
 *
 * Import-free on purpose: `node --test` strips the types and runs this file
 * directly, which importing a Lit-decorated module would break -- the parse
 * fails before any assertion runs.
 *
 * Validation is deliberately STRICT: an unknown key, or a known key of the
 * wrong shape, throws. The card this one replaces (plckr's
 * `flightradar-flight-card`) runs every option through valibot `fallback()`,
 * so a typo silently becomes the default -- `ground_speed: mi` renders as
 * knots, an empty `entities:` list is accepted outright, and "the card didn't
 * error" therefore proves nothing about the config. Throwing is the whole
 * point of doing this by hand.
 */

/**
 * Keys Lovelace and the layout helpers write onto a card config. They are not
 * card options and must not trip the unknown-key check -- `view_layout` in
 * particular is how this card gets placed in `scratch_pad.yaml`'s grid.
 */
const FRAME_KEYS = new Set(["type", "view_layout", "layout_options", "grid_options", "visibility", "card_mod"]);

const KNOWN_KEYS = new Set([
  "entity",
  "title",
  "map_height",
  "zoom",
  "zoom_offset",
  "theme_mode",
  "show_tracks",
  "show_area_center",
  "show_photo",
  "icon_size",
  "units",
]);

export const CARD_TYPE = "flight-map-card";
export const EDITOR_TYPE = "flight-map-card-editor";

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

/**
 * Basemap theme. Same vocabulary as Home Assistant's own Map card, and passed
 * straight through to `ha-map`, which reads "dark" and "auto" and treats
 * anything else as light. `auto` follows the dashboard theme.
 */
export const THEME_MODES = ["auto", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

const UNIT_VALUES = {
  altitude: ["ft", "m"],
  speed: ["mph", "kts", "kmh"],
  distance: ["mi", "km", "nm"],
} as const;

/**
 * Bounds on the numbers, so a typo fails loudly instead of rendering a card
 * one pixel tall or an aircraft the size of the county.
 */
const LIMITS = {
  map_height: [120, 1200],
  icon_size: [12, 72],
  zoom: [1, 20],
  // Bounded well inside the point where the fit padding would invert the
  // bounds (it approaches -0.5 as the offset grows, never reaching it), and
  // at +3 you are already seeing under a seventh of the watched area.
  zoom_offset: [-2, 3],
} as const;

export const DEFAULTS = {
  map_height: 460,
  /**
   * One level tighter than fitting the watched area exactly.
   *
   * The area is a wide box -- fitting all of it puts every aircraft in the
   * middle third of the map at a size where the heading is unreadable. One
   * step in is the useful default, and the cost is explicit rather than
   * hidden: the map then shows a bit over half the box, so aircraft near its
   * edge are off screen until the view is panned. Set 0 to see all of it.
   */
  zoom_offset: 1,
  /**
   * Follow the dashboard theme, like Home Assistant's own Map card. Pin it to
   * "light" where a dark basemap swallows the tracks -- the aircraft markers
   * and their trails are drawn in fixed colours and are not re-tinted for a
   * dark map.
   */
  theme_mode: "auto",
  show_tracks: true,
  show_area_center: true,
  show_photo: true,
  icon_size: 28,
} as const;

function fail(message: string): never {
  throw new Error(message);
}

export interface ParsedConfig {
  type: string;
  entity: string;
  title?: string;
  map_height?: number;
  /** Fixes the zoom instead of fitting the watched area. */
  zoom?: number;
  /** Zoom levels to tighten the area fit by. Ignored when `zoom` is set. */
  zoom_offset?: number;
  /** Basemap theme: follow the dashboard, or pin it light or dark. */
  theme_mode?: ThemeMode;
  show_tracks?: boolean;
  show_area_center?: boolean;
  show_photo?: boolean;
  icon_size?: number;
  units?: Partial<Units>;
}

/** A config with every default filled in, which is what the card reads. */
export interface ResolvedConfig {
  type: string;
  entity: string;
  title?: string;
  map_height: number;
  zoom?: number;
  zoom_offset: number;
  theme_mode: ThemeMode;
  show_tracks: boolean;
  show_area_center: boolean;
  show_photo: boolean;
  icon_size: number;
  units: Units;
}

export function parseConfig(raw: unknown): ParsedConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("Invalid configuration");
  const cfg = raw as Record<string, unknown>;

  const known = [...KNOWN_KEYS].sort().join(", ");
  for (const key of Object.keys(cfg)) {
    if (!FRAME_KEYS.has(key) && !KNOWN_KEYS.has(key)) {
      fail(`Unknown option "${key}". Known options: ${known}`);
    }
  }

  const entity = cfg.entity;
  if (typeof entity !== "string" || entity.trim() === "") {
    fail("`entity` is required: the Flightradar24 area sensor, e.g. sensor.flightradar24_current_in_area");
  }
  if (!(entity as string).startsWith("sensor.")) {
    fail(`\`entity\` must be a sensor, got "${entity as string}"`);
  }

  const title = cfg.title;
  if (title !== undefined && typeof title !== "string") fail("`title` must be a string");

  const parsed: ParsedConfig = {
    type: typeof cfg.type === "string" ? cfg.type : `custom:${CARD_TYPE}`,
    entity: (entity as string).trim(),
  };
  if (title !== undefined) parsed.title = title;

  for (const key of ["map_height", "icon_size", "zoom", "zoom_offset"] as const) {
    const value = cfg[key];
    if (value === undefined) continue;
    const [min, max] = LIMITS[key];
    if (typeof value !== "number" || !Number.isFinite(value)) fail(`\`${key}\` must be a number`);
    if ((value as number) < min || (value as number) > max) {
      fail(`\`${key}\` must be between ${min} and ${max}, got ${value as number}`);
    }
    // Only whole levels for the offset. Leaflet snaps the fit to an integer
    // zoom, so a fractional offset would land on one level or the next
    // depending on the viewport -- silently not what was asked for, which is
    // the whole failure mode this parser exists to prevent.
    if (key === "zoom_offset" && !Number.isInteger(value)) {
      fail("`zoom_offset` must be a whole number of zoom levels");
    }
    parsed[key] = value as number;
  }

  for (const key of ["show_tracks", "show_area_center", "show_photo"] as const) {
    const value = cfg[key];
    if (value === undefined) continue;
    // Not truthiness: `show_tracks: "false"` is a mistake, and treating that
    // string as true is exactly the silent-default behaviour being avoided.
    if (typeof value !== "boolean") fail(`\`${key}\` must be true or false`);
    parsed[key] = value;
  }

  const themeMode = cfg.theme_mode;
  if (themeMode !== undefined) {
    if (typeof themeMode !== "string" || !(THEME_MODES as readonly string[]).includes(themeMode)) {
      fail(`\`theme_mode\` must be one of ${THEME_MODES.join(", ")}, got ${JSON.stringify(themeMode)}`);
    }
    parsed.theme_mode = themeMode as ThemeMode;
  }

  const units = cfg.units;
  if (units !== undefined) {
    if (!units || typeof units !== "object" || Array.isArray(units)) fail("`units` must be a mapping");
    const given = units as Record<string, unknown>;
    const partial: Partial<Units> = {};
    for (const [key, value] of Object.entries(given)) {
      const allowed = (UNIT_VALUES as Record<string, readonly string[]>)[key];
      if (!allowed) {
        fail(`Unknown unit "${key}". Known units: ${Object.keys(UNIT_VALUES).join(", ")}`);
      }
      if (typeof value !== "string" || !allowed.includes(value)) {
        fail(`\`units.${key}\` must be one of ${allowed.join(", ")}, got ${JSON.stringify(value)}`);
      }
      (partial as Record<string, string>)[key] = value;
    }
    parsed.units = partial;
  }

  return parsed;
}

/**
 * Fill the defaults.
 *
 * Kept separate from parsing so the editor can still tell what the user
 * actually wrote from what the card merely assumed -- writing every default
 * back into the dashboard YAML on the first edit is a bad habit.
 */
export function resolveConfig(parsed: ParsedConfig): ResolvedConfig {
  const resolved: ResolvedConfig = {
    type: parsed.type,
    entity: parsed.entity,
    map_height: parsed.map_height ?? DEFAULTS.map_height,
    show_tracks: parsed.show_tracks ?? DEFAULTS.show_tracks,
    show_area_center: parsed.show_area_center ?? DEFAULTS.show_area_center,
    show_photo: parsed.show_photo ?? DEFAULTS.show_photo,
    icon_size: parsed.icon_size ?? DEFAULTS.icon_size,
    zoom_offset: parsed.zoom_offset ?? DEFAULTS.zoom_offset,
    theme_mode: parsed.theme_mode ?? DEFAULTS.theme_mode,
    units: { ...DEFAULT_UNITS, ...parsed.units },
  };
  if (parsed.title !== undefined) resolved.title = parsed.title;
  if (parsed.zoom !== undefined) resolved.zoom = parsed.zoom;
  return resolved;
}
