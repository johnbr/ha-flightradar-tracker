/**
 * Marker markup.
 *
 * The card hands this markup to `ha-map`'s `addMarker` inside an element of
 * its own, so asserting the string is asserting what a browser gets -- worth
 * pinning, because the things most likely to break here are silent: a rotation
 * that never applies, a box that is not the size the engine was told, and an
 * airport anchored somewhere other than its field.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { aircraftIconHtml, airportIcon, type AircraftShape } from "../src/markers.ts";

const STYLE = { size: 28, color: "#111", outline: "#fff", groundColor: "#888", selectedColor: "#0af" };

const shape = (over: Partial<AircraftShape> = {}): AircraftShape => ({
  heading: 6,
  kind: "jet",
  grounded: false,
  selected: false,
  ...over,
});

function iconHtml(over: Partial<AircraftShape> = {}): string {
  return aircraftIconHtml(shape(over), STYLE);
}

test("the icon box is the configured size", () => {
  // The engine centres the element on the position, so the box must be the
  // size it was told -- otherwise the aircraft sits off its own fix.
  assert.match(iconHtml(), /^<div style="width:28px;height:28px;/);
});

const AIRPORT_STYLE = { color: "#555", outline: "#fff", labelColor: "#333" };

test("an airport is anchored on its plate, with the label hanging below", () => {
  const markup = airportIcon("KCNO", AIRPORT_STYLE);
  assert.deepEqual(markup.size, [46, 32]);
  // Plate centre on the coordinate, so the label never covers the field.
  assert.deepEqual(markup.anchor, [23, 9]);
  assert.match(markup.html, />KCNO<\/span>/);
});

test("an airport code cannot break out of the markup", () => {
  const markup = airportIcon('<b>"x', AIRPORT_STYLE);
  assert.doesNotMatch(markup.html, /<b>/);
});

test("heading becomes a rotation", () => {
  assert.match(iconHtml({ heading: 6 }), /rotate\(6deg\)/);
  assert.match(iconHtml({ heading: 271 }), /rotate\(271deg\)/);
  // A missing heading draws north-up rather than dropping the aircraft.
  assert.match(iconHtml({ heading: null }), /rotate\(0deg\)/);
  // Whole degrees: no sub-pixel churn in the markup.
  assert.match(iconHtml({ heading: 6.4 }), /rotate\(6deg\)/);
});

test("a plane and a helicopter draw different shapes", () => {
  const plane = iconHtml();
  const heli = iconHtml({ kind: "helicopter" });
  assert.notEqual(plane, heli);
  // The helicopter is drawn from above -- body, boom, tail rotor and the main
  // rotor cross -- because mdi:helicopter is a side elevation and rotating that
  // to a compass heading looks like a crash.
  assert.match(heli, /<ellipse/);
  assert.match(plane, /<path d="M21 16v-2/);
  assert.doesNotMatch(heli, /<path d="M21 16v-2/);
});

test("an aircraft on the ground is dimmed and takes the ground colour", () => {
  const grounded = iconHtml({ grounded: true });
  assert.match(grounded, /opacity:0\.55/);
  assert.match(grounded, /#888/);
  assert.doesNotMatch(iconHtml({ grounded: false }), /opacity:0\.55/);
});

test("the selected aircraft takes the accent colour and a halo behind it", () => {
  const selected = iconHtml({ selected: true });
  assert.match(selected, /#0af/);
  // A circle, so the halo survives the rotation unchanged.
  assert.match(selected, /<circle[^>]*r="11"/);
  assert.doesNotMatch(iconHtml(), /<circle/);
  // Selection wins over the grounded colour: a selected aircraft on the ground
  // must still read as the selected one.
  assert.match(iconHtml({ selected: true, grounded: true }), /#0af/);
});

test("the silhouette carries an outline so it reads over any tile", () => {
  assert.match(iconHtml(), /stroke="#fff"/);
  assert.match(iconHtml(), /paint-order="stroke"/);
});

test("theme colours cannot break out of the markup", () => {
  // Colours come from getComputedStyle, so they are not user input -- but they
  // are interpolated into attributes, and a quote would silently mangle the
  // whole icon rather than fail loudly.
  const html = aircraftIconHtml(shape(), { ...STYLE, color: '"><script>x</script>' });
  assert.doesNotMatch(html, /<script>/i);
});

test("a light aircraft and a jet draw different shapes", () => {
  const jet = iconHtml({ kind: "jet" });
  const light = iconHtml({ kind: "light" });
  assert.notEqual(jet, light);
  // The jet keeps mdi:airplane's swept planform; the light aircraft is drawn by
  // hand with a STRAIGHT full-span wing, which is what carries the difference
  // at a shared icon size.
  assert.match(jet, /<path d="M21 16v-2/);
  assert.doesNotMatch(light, /<path d="M21 16v-2/);
  assert.match(light, /<rect[^>]*width="19\.2"/);
});

test("all three kinds are distinct from each other", () => {
  const seen = new Set([iconHtml({ kind: "jet" }), iconHtml({ kind: "light" }), iconHtml({ kind: "helicopter" })]);
  assert.equal(seen.size, 3);
});

test("a light aircraft still rotates and still dims on the ground", () => {
  assert.match(iconHtml({ kind: "light", heading: 240 }), /rotate\(240deg\)/);
  assert.match(iconHtml({ kind: "light", grounded: true }), /opacity:0\.55/);
});
