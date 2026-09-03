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
import { parseConfig } from "../src/config.ts";

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
