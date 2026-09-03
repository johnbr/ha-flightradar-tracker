/**
 * Config validation tests.
 *
 * Run with `npm run test:js` (Node strips the types natively; no build step).
 *
 * These assert BOTH directions on purpose. A validator that accepts everything
 * is the failure mode being designed against -- the card this replaces swaps a
 * bad value for the default and renders happily -- so every "throws" case here
 * matters at least as much as the round-trip.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { parseConfig, resolveConfig } from "../src/config.ts";

test("a minimal config round-trips unchanged", () => {
  const parsed = parseConfig({ type: "custom:flight-map-card", entity: "sensor.flightradar24_current_in_area" });
  assert.deepEqual(parsed, {
    type: "custom:flight-map-card",
    entity: "sensor.flightradar24_current_in_area",
  });
});

test("title is preserved verbatim, including the empty string", () => {
  assert.equal(parseConfig({ entity: "sensor.x", title: "Flights overhead" }).title, "Flights overhead");
  assert.equal(parseConfig({ entity: "sensor.x", title: "" }).title, "");
});

test("an absent title stays absent rather than becoming a default", () => {
  // The default is the entity's friendly name, which config parsing cannot see.
  assert.equal("title" in parseConfig({ entity: "sensor.x" }), false);
});

test("entity is required", () => {
  assert.throws(() => parseConfig({}), /entity. is required/);
  assert.throws(() => parseConfig({ entity: "" }), /entity. is required/);
  assert.throws(() => parseConfig({ entity: "   " }), /entity. is required/);
  assert.throws(() => parseConfig({ entity: 42 }), /entity. is required/);
});

test("entity must be a sensor", () => {
  // device_tracker is the plausible wrong answer: FR24 can publish trackers,
  // but `enable_tracker` is off here and they carry no flights[] anyway.
  assert.throws(() => parseConfig({ entity: "device_tracker.n831sb" }), /must be a sensor/);
});

test("an unknown key throws and names itself", () => {
  assert.throws(() => parseConfig({ entity: "sensor.x", show_photos: true }), /Unknown option "show_photos"/);
});

test("a misspelled known key throws rather than being ignored", () => {
  assert.throws(() => parseConfig({ entity: "sensor.x", titel: "Flights" }), /Unknown option "titel"/);
});

test("Lovelace's own frame keys are accepted, not treated as card options", () => {
  // view_layout is how this card is placed in scratch_pad.yaml's grid; rejecting
  // it would break the dashboard it is being written for.
  const parsed = parseConfig({
    type: "custom:flight-map-card",
    entity: "sensor.x",
    view_layout: { "grid-column": "1 / -1" },
    grid_options: { columns: 12 },
    visibility: [{ condition: "user", users: ["abc"] }],
    card_mod: { style: "" },
    layout_options: {},
  });
  assert.equal(parsed.entity, "sensor.x");
  assert.equal("view_layout" in parsed, false);
});

test("a non-object config throws", () => {
  assert.throws(() => parseConfig(undefined), /Invalid configuration/);
  assert.throws(() => parseConfig(null), /Invalid configuration/);
  assert.throws(() => parseConfig("sensor.x"), /Invalid configuration/);
  assert.throws(() => parseConfig([{ entity: "sensor.x" }]), /Invalid configuration/);
});

test("title must be a string", () => {
  assert.throws(() => parseConfig({ entity: "sensor.x", title: 7 }), /title. must be a string/);
});

test("type defaults to the card's own type when Lovelace has not set it", () => {
  assert.equal(parseConfig({ entity: "sensor.x" }).type, "custom:flight-map-card");
});

/**
 * The rest of the option surface.
 *
 * Same rule throughout: a wrong value throws rather than becoming the default.
 * Silent fallbacks are what made the card this one replaces impossible to
 * configure with confidence.
 */

test("numeric options are bounded, not merely numeric", () => {
  assert.equal(parseConfig({ entity: "sensor.x", map_height: 500 }).map_height, 500);
  assert.equal(parseConfig({ entity: "sensor.x", icon_size: 40 }).icon_size, 40);
  assert.equal(parseConfig({ entity: "sensor.x", zoom: 11 }).zoom, 11);

  // A card one pixel tall, or an aircraft the size of the county.
  assert.throws(() => parseConfig({ entity: "sensor.x", map_height: 1 }), /between 120 and 1200/);
  assert.throws(() => parseConfig({ entity: "sensor.x", icon_size: 400 }), /between 12 and 72/);
  assert.throws(() => parseConfig({ entity: "sensor.x", zoom: 0 }), /between 1 and 20/);
  // "380px" is the natural typo, and Number("380px") is NaN.
  assert.throws(() => parseConfig({ entity: "sensor.x", map_height: "380px" }), /must be a number/);
  assert.throws(() => parseConfig({ entity: "sensor.x", map_height: Number.NaN }), /must be a number/);
});

test("booleans must be booleans, not truthy strings", () => {
  assert.equal(parseConfig({ entity: "sensor.x", show_tracks: false }).show_tracks, false);
  // `show_tracks: "false"` is truthy in JavaScript. Accepting it would turn the
  // option on when the config says off -- the exact silent-default failure.
  assert.throws(() => parseConfig({ entity: "sensor.x", show_tracks: "false" }), /must be true or false/);
  assert.throws(() => parseConfig({ entity: "sensor.x", show_photo: 1 }), /must be true or false/);
});

test("units accept only real units", () => {
  assert.deepEqual(parseConfig({ entity: "sensor.x", units: { distance: "nm" } }).units, {
    distance: "nm",
  });
  assert.throws(() => parseConfig({ entity: "sensor.x", units: { distance: "miles" } }), /must be one of/);
  assert.throws(() => parseConfig({ entity: "sensor.x", units: { height: "ft" } }), /Unknown unit "height"/);
  assert.throws(() => parseConfig({ entity: "sensor.x", units: "metric" }), /must be a mapping/);
  // knots for speed is valid; knots for distance is not.
  assert.equal(parseConfig({ entity: "sensor.x", units: { speed: "kts" } }).units?.speed, "kts");
  assert.throws(() => parseConfig({ entity: "sensor.x", units: { distance: "kts" } }), /must be one of/);
});

test("parsing does not invent values; resolving fills them in", () => {
  // Kept apart so the editor can tell what the user wrote from what the card
  // assumed, and never writes a default back into the dashboard YAML.
  const parsed = parseConfig({ entity: "sensor.x" });
  assert.equal(parsed.map_height, undefined);
  assert.equal(parsed.show_tracks, undefined);

  const resolved = resolveConfig(parsed);
  assert.equal(resolved.map_height, 460);
  assert.equal(resolved.icon_size, 28);
  assert.equal(resolved.show_tracks, true);
  assert.equal(resolved.show_area_center, true);
  assert.equal(resolved.show_photo, true);
  assert.deepEqual(resolved.units, { altitude: "ft", speed: "mph", distance: "mi" });
  // Absent stays absent: there is no default title or zoom to invent.
  assert.equal("title" in resolved, false);
  assert.equal("zoom" in resolved, false);
});

test("a partial units mapping keeps the other two defaults", () => {
  const resolved = resolveConfig(parseConfig({ entity: "sensor.x", units: { distance: "km" } }));
  assert.deepEqual(resolved.units, { altitude: "ft", speed: "mph", distance: "km" });
});

test("explicit values survive resolution", () => {
  const resolved = resolveConfig(
    parseConfig({ entity: "sensor.x", map_height: 240, show_tracks: false, zoom: 9, title: "Overhead" })
  );
  assert.equal(resolved.map_height, 240);
  assert.equal(resolved.show_tracks, false);
  assert.equal(resolved.zoom, 9);
  assert.equal(resolved.title, "Overhead");
});

test("zoom_offset defaults to one level in", () => {
  assert.equal(resolveConfig(parseConfig({ entity: "sensor.x" })).zoom_offset, 1);
});

test("zoom_offset accepts whole levels in both directions", () => {
  assert.equal(parseConfig({ entity: "sensor.x", zoom_offset: 0 }).zoom_offset, 0);
  assert.equal(parseConfig({ entity: "sensor.x", zoom_offset: -2 }).zoom_offset, -2);
  assert.equal(parseConfig({ entity: "sensor.x", zoom_offset: 3 }).zoom_offset, 3);
});

test("zoom_offset rejects a fractional level", () => {
  // Leaflet snaps the fit to a whole zoom, so 0.5 would land on one level or
  // the next depending on the viewport -- silently not what was asked for.
  assert.throws(
    () => parseConfig({ entity: "sensor.x", zoom_offset: 0.5 }),
    /whole number of zoom levels/
  );
});

test("zoom_offset rejects a level outside the range", () => {
  assert.throws(() => parseConfig({ entity: "sensor.x", zoom_offset: 4 }), /between -2 and 3/);
  assert.throws(() => parseConfig({ entity: "sensor.x", zoom_offset: -3 }), /between -2 and 3/);
});
