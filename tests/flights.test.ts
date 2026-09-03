/**
 * Flight normalisation and diffing.
 *
 * The diff is what keeps markers alive across a tick, so its cases are the ones
 * that matter: an aircraft that only moved must NOT be restyled (setIcon
 * rebuilds the marker's DOM), and an aircraft that left must be removed rather
 * than left drifting on the map forever.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  diffFlights,
  flightId,
  flightLabel,
  indexById,
  isHelicopter,
  isOnGround,
  markerKey,
  parseFlights,
  parseTrack,
  sortByDistance,
  trackKey,
} from "../src/flights.ts";
import type { Flight } from "../src/types.ts";

/** Minimal row in the shape the sensor publishes. */
function row(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "417b86f0",
    callsign: "N462PD",
    latitude: 34.0756,
    longitude: -117.4218,
    altitude: 1550,
    heading: 6,
    ground_speed: 74,
    vertical_speed: -64,
    distance: 19.8,
    closest_distance: 18.2,
    on_ground: 0,
    aircraft_category: null,
    ...over,
  };
}

const flight = (over: Record<string, unknown> = {}): Flight => parseFlights([row(over)])[0]!;

test("a live row parses with its numbers intact", () => {
  const [f] = parseFlights([row()]);
  assert.equal(f?.id, "417b86f0");
  assert.equal(f?.latitude, 34.0756);
  assert.equal(f?.longitude, -117.4218);
  assert.equal(f?.altitude, 1550);
  assert.equal(f?.heading, 6);
});

test("numeric fields arriving as strings are coerced", () => {
  const [f] = parseFlights([row({ latitude: "34.0756", longitude: "-117.4218", heading: "6" })]);
  assert.equal(f?.latitude, 34.0756);
  assert.equal(f?.heading, 6);
});

test("rows that cannot be placed on a map are dropped, not defaulted", () => {
  // A defaulted coordinate is a marker in the Gulf of Guinea, which reads as a
  // bug in the card rather than in the data.
  const parsed = parseFlights([
    row({ latitude: null }),
    row({ id: "b", longitude: "n/a" }),
    row({ id: "c", latitude: 91 }),
    row({ id: "d", longitude: -181 }),
    row({ id: null, callsign: null, aircraft_registration: null, aircraft_icao_24bit: null }),
    "not an object",
    null,
  ]);
  assert.deepEqual(parsed, []);
});

test("a missing id falls back so the marker still has a stable identity", () => {
  assert.equal(flightId({ id: "  ", callsign: "N462PD" }), "N462PD");
  assert.equal(flightId({ callsign: null, aircraft_registration: "N831SB" }), "N831SB");
  assert.equal(flightId({ aircraft_icao_24bit: "A1B2C3" }), "A1B2C3");
  assert.equal(flightId({}), null);
});

test("duplicate ids keep the first row rather than fighting over one marker", () => {
  const parsed = parseFlights([row({ altitude: 1000 }), row({ altitude: 2000 })]);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0]?.altitude, 1000);
});

test("flights come back nearest first, with unknown distance last", () => {
  const parsed = parseFlights([
    row({ id: "far", distance: 20 }),
    row({ id: "unknown", distance: null }),
    row({ id: "near", distance: 2 }),
  ]);
  assert.deepEqual(
    parsed.map((f) => f.id),
    ["near", "far", "unknown"]
  );
});

test("sorting is stable for equal distances", () => {
  const a = flight({ id: "aaa", distance: 5 });
  const b = flight({ id: "bbb", distance: 5 });
  assert.deepEqual(
    sortByDistance([b, a]).map((f) => f.id),
    ["aaa", "bbb"]
  );
});

test("marker key covers exactly what changes the icon", () => {
  const base = flight();
  assert.equal(markerKey(base), markerKey(flight({ latitude: 35, ground_speed: 400 })));
  assert.notEqual(markerKey(base), markerKey(flight({ heading: 90 })));
  assert.notEqual(markerKey(base), markerKey(flight({ aircraft_category: "Helicopter" })));
  assert.notEqual(markerKey(base), markerKey(flight({ on_ground: 1 })));
  // Whole degrees in, so a sub-degree wobble must not rebuild the marker.
  assert.equal(markerKey(flight({ heading: 6 })), markerKey(flight({ heading: 6.4 })));
  // 360 and 0 are the same bearing.
  assert.equal(markerKey(flight({ heading: 0 })), markerKey(flight({ heading: 360 })));
  // A missing heading is drawn north-up rather than dropped.
  assert.equal(markerKey(flight({ heading: null })), markerKey(flight({ heading: 0 })));
});

test("helicopters and grounded aircraft are recognised", () => {
  assert.equal(isHelicopter(flight({ aircraft_category: "Helicopter" })), true);
  assert.equal(isHelicopter(flight({ aircraft_category: "helicopter" })), true);
  assert.equal(isHelicopter(flight()), false);
  assert.equal(isOnGround(flight({ on_ground: 1 })), true);
  assert.equal(isOnGround(flight({ on_ground: 0 })), false);
  assert.equal(isOnGround(flight({ on_ground: null })), false);
});

test("a new aircraft is added, a departed one removed", () => {
  const before = indexById([flight({ id: "a" })]);
  const diff = diffFlights(before, [flight({ id: "b" })]);
  assert.deepEqual(
    diff.added.map((f) => f.id),
    ["b"]
  );
  assert.deepEqual(diff.removed, ["a"]);
  assert.deepEqual(diff.changed, []);
});

test("an aircraft that only moved is moved, never restyled", () => {
  // setIcon rebuilds the marker's DOM; doing it on every tick is the blinking
  // this diff exists to prevent.
  const before = indexById([flight({ id: "a", latitude: 34.0 })]);
  const diff = diffFlights(before, [flight({ id: "a", latitude: 34.1 })]);
  assert.equal(diff.changed.length, 1);
  assert.equal(diff.changed[0]?.moved, true);
  assert.equal(diff.changed[0]?.restyled, false);
  assert.equal(diff.changed[0]?.retracked, false);
});

test("a track that grew is retracked without restyling the marker", () => {
  const before = indexById([flight({ id: "a", coordinates: [[34, -117]] })]);
  const diff = diffFlights(before, [
    flight({
      id: "a",
      coordinates: [
        [34, -117],
        [34.01, -117.01],
      ],
    }),
  ]);
  assert.equal(diff.changed[0]?.retracked, true);
  assert.equal(diff.changed[0]?.restyled, false);
  assert.equal(diff.changed[0]?.moved, false);
});

test("track points are normalised, and unusable ones dropped", () => {
  assert.deepEqual(
    parseTrack([
      [34.0799, -117.4565],
      ["34.08", "-117.45"],
      [34.08],
      ["x", 1],
      [91, 0],
      [0, -181],
      null,
      "nope",
    ]),
    [
      [34.0799, -117.4565],
      [34.08, -117.45],
    ]
  );
  assert.deepEqual(parseTrack(undefined), []);
  assert.deepEqual(parseTrack("34,-117"), []);
});

test("an aircraft with no track carries an empty array, never undefined", () => {
  assert.deepEqual(flight({ coordinates: undefined }).coordinates, []);
});

test("the track key changes when the window slides, not otherwise", () => {
  const a = flight({
    coordinates: [
      [34, -117],
      [34.01, -117.01],
    ],
  });
  const same = flight({
    coordinates: [
      [34, -117],
      [34.01, -117.01],
    ],
  });
  // A tick appends a point and drops the oldest, so both ends and the length
  // are what identify the window.
  const grown = flight({
    coordinates: [
      [34, -117],
      [34.01, -117.01],
      [34.02, -117.02],
    ],
  });
  const slid = flight({
    coordinates: [
      [34.01, -117.01],
      [34.02, -117.02],
    ],
  });
  assert.equal(trackKey(a), trackKey(same));
  assert.notEqual(trackKey(a), trackKey(grown));
  assert.notEqual(trackKey(a), trackKey(slid));
  assert.equal(trackKey(flight({ coordinates: [] })), "0");
});

test("an aircraft that turned is restyled", () => {
  const before = indexById([flight({ id: "a", heading: 6 })]);
  const diff = diffFlights(before, [flight({ id: "a", heading: 96 })]);
  assert.equal(diff.changed[0]?.restyled, true);
  assert.equal(diff.changed[0]?.moved, false);
});

test("an unchanged aircraft produces no work at all", () => {
  const before = indexById([flight({ id: "a" })]);
  const diff = diffFlights(before, [flight({ id: "a" })]);
  assert.deepEqual(diff, { added: [], changed: [], removed: [] });
});

test("id churn replaces rather than mutates", () => {
  // FR24 re-issues a flight id when it loses and re-acquires an aircraft; the
  // old marker must go, not be left behind at its last position.
  const before = indexById([flight({ id: "old", callsign: "N462PD" })]);
  const diff = diffFlights(before, [flight({ id: "new", callsign: "N462PD" })]);
  assert.deepEqual(diff.removed, ["old"]);
  assert.deepEqual(
    diff.added.map((f) => f.id),
    ["new"]
  );
});

test("the label prefers the callsign and always resolves to something", () => {
  assert.equal(flightLabel(flight()), "N462PD");
  assert.equal(flightLabel(flight({ callsign: null, flight_number: "UA123" })), "UA123");
  assert.equal(flightLabel(flight({ callsign: null, flight_number: null })), "417b86f0");
});
