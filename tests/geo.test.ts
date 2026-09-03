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
import { boundsCenter, boundsCorners, parseBounds } from "../src/geo.ts";

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
