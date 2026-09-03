/**
 * Marker icon markup.
 *
 * `aircraftIcon` only ever calls `divIcon`, so a stub Leaflet is enough to
 * assert the markup a browser would get -- which is worth pinning, because the
 * two things most likely to break here are silent: a rotation that never
 * applies, and the default `leaflet-div-icon` class drawing a white box behind
 * every aircraft.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { aircraftIcon, type AircraftShape } from "../src/markers.ts";
import type { LeafletLike } from "../src/ha-map.ts";

interface Captured {
  className?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
  html?: string;
}

let captured: Captured = {};

const leaflet = {
  divIcon(options: Record<string, unknown>) {
    captured = options as Captured;
    return {};
  },
} as unknown as LeafletLike;

const STYLE = { size: 28, color: "#111", outline: "#fff", groundColor: "#888" };

const shape = (over: Partial<AircraftShape> = {}): AircraftShape => ({
  heading: 6,
  helicopter: false,
  grounded: false,
  ...over,
});

function iconHtml(over: Partial<AircraftShape> = {}): string {
  aircraftIcon(leaflet, shape(over), STYLE);
  return captured.html ?? "";
}

test("the icon is sized and anchored on its own centre", () => {
  aircraftIcon(leaflet, shape(), STYLE);
  assert.deepEqual(captured.iconSize, [28, 28]);
  // Anchored centre, not bottom-tip: an aircraft marker points AT its position.
  assert.deepEqual(captured.iconAnchor, [14, 14]);
});

test("the default leaflet-div-icon class is replaced", () => {
  // Leaflet's default class paints a white box behind the icon.
  aircraftIcon(leaflet, shape(), STYLE);
  assert.equal(captured.className, "fmc-aircraft");
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
  const heli = iconHtml({ helicopter: true });
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

test("the silhouette carries an outline so it reads over any tile", () => {
  assert.match(iconHtml(), /stroke="#fff"/);
  assert.match(iconHtml(), /paint-order="stroke"/);
});

test("theme colours cannot break out of the markup", () => {
  // Colours come from getComputedStyle, so they are not user input -- but they
  // are interpolated into attributes, and a quote would silently mangle the
  // whole icon rather than fail loudly.
  aircraftIcon(leaflet, shape(), { ...STYLE, color: '"><script>x</script>' });
  assert.doesNotMatch(captured.html ?? "", /<script>/);
});
