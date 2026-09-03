/**
 * Formatting.
 *
 * The recurring rule under test: an absent value returns null so the panel can
 * drop the row. The payload is full of legitimately missing fields, and a grid
 * of dashes reads as a broken card rather than as a helicopter with no
 * destination.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compassPoint,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  formatSquawk,
  formatVerticalSpeed,
  fr24Url,
  group,
} from "../src/format.ts";

test("numbers are grouped without depending on the runtime locale", () => {
  assert.equal(group(1550), "1,550");
  assert.equal(group(999), "999");
  assert.equal(group(1234567), "1,234,567");
  assert.equal(group(-1550), "-1,550");
  assert.equal(group(19.816, 1), "19.8");
  assert.equal(group(0, 1), "0.0");
});

test("altitude converts and keeps its unit", () => {
  assert.equal(formatAltitude(1550, "ft"), "1,550 ft");
  assert.equal(formatAltitude(1550, "m"), "472 m");
  assert.equal(formatAltitude(0, "ft"), "0 ft");
});

test("ground speed converts from knots", () => {
  assert.equal(formatSpeed(74, "kts"), "74 kts");
  assert.equal(formatSpeed(74, "mph"), "85 mph");
  assert.equal(formatSpeed(74, "kmh"), "137 km/h");
});

test("distance converts from kilometres, to one decimal", () => {
  assert.equal(formatDistance(19.81641275156318, "km"), "19.8 km");
  assert.equal(formatDistance(19.81641275156318, "mi"), "12.3 mi");
  assert.equal(formatDistance(19.81641275156318, "nm"), "10.7 nm");
});

test("vertical speed carries its sign in the arrow, not the number", () => {
  // "down minus 64" is a double negative the eye has to unpick mid-scan.
  assert.equal(formatVerticalSpeed(-1216), "↓ 1,216 ft/min");
  assert.equal(formatVerticalSpeed(1216), "↑ 1,216 ft/min");
  // A few dozen feet a minute is noise, not a climb.
  assert.equal(formatVerticalSpeed(-64), "↓ 64 ft/min");
  assert.equal(formatVerticalSpeed(0), "Level");
  assert.equal(formatVerticalSpeed(32), "Level");
});

test("heading reads as a bearing", () => {
  assert.equal(formatHeading(6), "006° N");
  assert.equal(formatHeading(96), "096° E");
  assert.equal(formatHeading(0), "000° N");
  assert.equal(formatHeading(360), "000° N");
  assert.equal(formatHeading(359.6), "000° N");
  assert.equal(formatHeading(-90), "270° W");
});

test("compass points land on the right sixteenth", () => {
  assert.equal(compassPoint(0), "N");
  assert.equal(compassPoint(22.5), "NNE");
  assert.equal(compassPoint(45), "NE");
  assert.equal(compassPoint(180), "S");
  assert.equal(compassPoint(348.75), "N");
});

test("an absent value is null, so the row disappears", () => {
  for (const f of [formatAltitude, formatSpeed, formatDistance] as const) {
    assert.equal(f(null, "ft" as never), null);
    assert.equal(f(undefined, "ft" as never), null);
    assert.equal(f(Number.NaN, "ft" as never), null);
  }
  assert.equal(formatVerticalSpeed(null), null);
  assert.equal(formatHeading(null), null);
});

test("a blank or 0000 squawk is not a code", () => {
  // The live sample carries "" -- printing it would be a row saying nothing.
  assert.equal(formatSquawk(""), null);
  assert.equal(formatSquawk("  "), null);
  assert.equal(formatSquawk("0000"), null);
  assert.equal(formatSquawk(null), null);
  assert.equal(formatSquawk("7700"), "7700");
});

test("the FR24 link degrades through what it has", () => {
  assert.equal(fr24Url("417b86f0", "N462PD"), "https://fr24.com/N462PD/417b86f0");
  assert.equal(fr24Url(null, "N462PD"), "https://www.flightradar24.com/N462PD");
  assert.equal(fr24Url("417b86f0", ""), "https://www.flightradar24.com/417b86f0");
  assert.equal(fr24Url(null, null), null);
  // A callsign is not URL-safe by construction.
  assert.equal(fr24Url("a b", "c/d"), "https://fr24.com/c%2Fd/a%20b");
});
