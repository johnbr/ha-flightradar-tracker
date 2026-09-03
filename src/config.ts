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

const KNOWN_KEYS = new Set(["entity", "title"]);

export const CARD_TYPE = "flight-map-card";

function fail(message: string): never {
  throw new Error(message);
}

export interface ParsedConfig {
  type: string;
  entity: string;
  title?: string;
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
  return parsed;
}
