/**
 * Geometry tests.
 *
 * The bounds string is the one piece of the payload whose *order* cannot be
 * inferred from the values -- four plausible-looking numbers parse fine in the
 * wrong order and put the map in the wrong hemisphere -- so the live sample is
 * pinned here.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  airportPosition,
  boundsCenter,
  boundsCorners,
  haversineKm,
  parseBounds,
  routeProgress,
} from "../src/geo.ts";

/** Read live off sensor.flightradar24_current_in_area on 2026-09-03. */
const LIVE = "34.174085460800306,33.724427380920666,-117.84410825045487,-117.30203572617859";

test("bounds parse in N,S,W,E order", () => {
  const bounds = parseBounds(LIVE);
  assert.ok(bounds);
  assert.equal(bounds.north, 34.174085460800306);
  assert.equal(bounds.south, 33.724427380920666);
  assert.equal(bounds.west, -117.84410825045487);
  assert.equal(bounds.east, -117.30203572617859);
  // North of south, west of east: the sanity check that the order is right.
  assert.ok(bounds.north > bounds.south);
  assert.ok(bounds.west < bounds.east);
});

test("the centre of the live box is the configured area centre, to within metres", () => {
  // The integration is configured with centre 33.9495534,-117.573788, radius
  // 25 km, and derives the bounds by walking the great-circle destination-point
  // formula out to the SW and NE corners (FlightRadar24API.get_bounds_by_point).
  // That is not symmetric on a sphere, so the box centre lands ~33 m south and
  // ~66 m west of the configured point rather than exactly on it. Irrelevant
  // for a marker -- sub-pixel at any zoom that shows the whole area -- but the
  // reason this asserts a tolerance instead of equality.
  const [lat, lon] = boundsCenter(parseBounds(LIVE)!);
  assert.ok(Math.abs(lat - 33.9495534) < 0.001, `lat ${lat}`);
  assert.ok(Math.abs(lon - -117.573788) < 0.001, `lon ${lon}`);
});

test("corners come out as Leaflet's two opposite pairs", () => {
  assert.deepEqual(boundsCorners({ north: 2, south: 1, west: -4, east: -3 }), [
    [2, -4],
    [1, -3],
  ]);
});

test("a reversed latitude pair is normalised rather than making an empty box", () => {
  const bounds = parseBounds("33.7,34.1,-117.8,-117.3");
  assert.equal(bounds?.north, 34.1);
  assert.equal(bounds?.south, 33.7);
});

test("surrounding whitespace is tolerated", () => {
  assert.deepEqual(parseBounds(" 34.1 , 33.7 , -117.8 , -117.3 "), {
    north: 34.1,
    south: 33.7,
    west: -117.8,
    east: -117.3,
  });
});

test("unparseable bounds return null rather than a plausible box", () => {
  // Every one of these has been seen from some integration at some point: a
  // missing attribute, a placeholder, a partial write, a list instead of a
  // string. None may become coordinates.
  assert.equal(parseBounds(undefined), null);
  assert.equal(parseBounds(null), null);
  assert.equal(parseBounds(""), null);
  assert.equal(parseBounds("unknown"), null);
  assert.equal(parseBounds("34.1,33.7,-117.8"), null);
  assert.equal(parseBounds("34.1,33.7,-117.8,-117.3,0"), null);
  assert.equal(parseBounds("34.1,33.7,-117.8,abc"), null);
  assert.equal(parseBounds([34.1, 33.7, -117.8, -117.3]), null);
});

test("out-of-range coordinates are rejected", () => {
  // A swapped lat/lon pair lands here: 117 is not a latitude.
  assert.equal(parseBounds("117.8,117.3,34.1,33.7"), null);
  assert.equal(parseBounds("34.1,33.7,-181,-117.3"), null);
});

/**
 * Great-circle distance and route progress.
 *
 * Pinned against independently computed values for real airport pairs, because
 * a haversine with a transposed term still returns plausible-looking numbers.
 */

test("haversine matches known great-circle distances", () => {
  const JFK: [number, number] = [40.639751, -73.7789];
  const LAX: [number, number] = [33.94252, -118.406998];
  const DFW: [number, number] = [32.89682, -97.037903];
  const ONT: [number, number] = [34.056, -117.600998];
  // JFK-LAX is the textbook pair: ~3,974 km.
  assert.ok(Math.abs(haversineKm(JFK, LAX) - 3974.118) < 0.05, `${haversineKm(JFK, LAX)}`);
  assert.ok(Math.abs(haversineKm(DFW, ONT) - 1908.354) < 0.05, `${haversineKm(DFW, ONT)}`);
  // A degree of latitude is a degree of latitude anywhere.
  assert.ok(Math.abs(haversineKm([0, 0], [1, 0]) - 111.1951) < 0.001);
  assert.ok(Math.abs(haversineKm([51, 0], [52, 0]) - 111.1951) < 0.001);
  // It is symmetric, and zero for a point on itself.
  assert.equal(haversineKm(JFK, JFK), 0);
  assert.equal(haversineKm(JFK, LAX), haversineKm(LAX, JFK));
});

test("short hops stay accurate", () => {
  // Three kilometres from the runway is the case that matters -- an aircraft on
  // short final, where the law of cosines would lose its precision.
  const a: [number, number] = [34.0569, -117.565];
  const b: [number, number] = [34.056, -117.600998];
  assert.ok(Math.abs(haversineKm(a, b) - 3.32) < 0.01, `${haversineKm(a, b)}`);
});

test("route progress measures both legs from where the aircraft is", () => {
  // AAL1695, live: DFW to ONT, three kilometres out.
  const p = routeProgress([32.89682, -97.037903], [34.0569, -117.565], [34.056, -117.600998]);
  assert.ok(p);
  assert.ok(Math.abs(p.flownKm - 1905.04) < 0.05);
  assert.ok(Math.abs(p.remainingKm - 3.32) < 0.05);
  assert.ok(Math.abs(p.fraction - 0.99826) < 0.0001);
});

test("progress cannot exceed the bar", () => {
  // An overflown destination, a hold, or a dogleg around weather all read past
  // 100 % under flown/direct-distance. Here they cannot.
  const origin: [number, number] = [34, -118];
  const destination: [number, number] = [34, -117];
  const overshot = routeProgress(origin, [34, -116], destination);
  assert.ok(overshot);
  assert.ok(overshot.fraction <= 1);
  assert.ok(overshot.remainingKm > 0);
  // At the origin: nothing flown.
  assert.equal(routeProgress(origin, origin, destination)?.fraction, 0);
  // At the destination: all of it.
  assert.equal(routeProgress(origin, destination, destination)?.fraction, 1);
});

test("progress is null without both airports", () => {
  // Most of general aviation: the live sample was a police helicopter with
  // every airport_destination_* field null.
  const here: [number, number] = [34, -117];
  assert.equal(routeProgress(null, here, [34, -118]), null);
  assert.equal(routeProgress([34, -118], here, null), null);
  assert.equal(routeProgress(null, here, null), null);
  // Origin and destination the same place, aircraft on top of them.
  assert.equal(routeProgress(here, here, here), null);
});

test("an unknown airport position is not the Atlantic", () => {
  // FR24 sends 0,0 for an airport it has no coordinates for.
  assert.equal(airportPosition(0, 0), null);
  assert.equal(airportPosition(null, -117), null);
  assert.equal(airportPosition(34, null), null);
  assert.equal(airportPosition(Number.NaN, 1), null);
  assert.deepEqual(airportPosition(34.056, -117.600998), [34.056, -117.600998]);
});
