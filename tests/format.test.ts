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
  dayOffset,
  epochOrNull,
  etaMinutes,
  formatAirportTime,
  formatAltitude,
  formatDuration,
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

/**
 * Airport-local times.
 *
 * Every case below is a real epoch/offset pair read off the live sensor, so
 * these assert against flights that actually happened rather than against the
 * implementation's own arithmetic. TZ=UTC in the test script, but the whole
 * point of the shift-then-read-UTC approach is that the answers do not depend
 * on that -- the offsets come from the payload.
 */

/** JBU355, JFK (EDT, -14400) to ONT (PDT, -25200), 2026-09-02. */
const JFK_OFFSET = -14400;
const ONT_OFFSET = -25200;
const JBU355_SCHED_DEP = 1788391740;
const JBU355_REAL_DEP = 1788394249;
const JBU355_EST_ARR = 1788414192;

test("a time is rendered in its own airport's zone", () => {
  assert.equal(formatAirportTime(JBU355_REAL_DEP, JFK_OFFSET, "EDT", true), "8:10 PM EDT");
  assert.equal(formatAirportTime(JBU355_SCHED_DEP, JFK_OFFSET, "EDT", true), "7:29 PM EDT");
  // The same instant, an hour earlier by the clock, three zones west.
  assert.equal(formatAirportTime(JBU355_EST_ARR, ONT_OFFSET, "PDT", true), "10:43 PM PDT");
});

test("24-hour formatting is the same instant", () => {
  assert.equal(formatAirportTime(JBU355_REAL_DEP, JFK_OFFSET, "EDT", false), "20:10 EDT");
  assert.equal(formatAirportTime(JBU355_EST_ARR, ONT_OFFSET, "PDT", false), "22:43 PDT");
});

test("midnight and noon do not collapse in 12-hour form", () => {
  // The hour that a naive `h % 12` renders as "0:00". 1788418800 is
  // 2026-09-03T07:00:00Z, which is midnight at PDT's -25200; noon is 12 h on.
  assert.equal(formatAirportTime(1788418800, ONT_OFFSET, "PDT", true), "12:00 AM PDT");
  assert.equal(formatAirportTime(1788418800 + 43200, ONT_OFFSET, "PDT", true), "12:00 PM PDT");
  assert.equal(formatAirportTime(1788418800, ONT_OFFSET, "PDT", false), "00:00 PDT");
});

test("epoch 0 is absent, not 1970", () => {
  // Every police and GA flight measured carries time_scheduled_departure: 0.
  assert.equal(formatAirportTime(0, ONT_OFFSET, "PDT", true), null);
  assert.equal(formatAirportTime(null, ONT_OFFSET, "PDT", true), null);
  assert.equal(formatAirportTime(undefined, ONT_OFFSET, "PDT", true), null);
  assert.equal(epochOrNull(0), null);
  assert.equal(epochOrNull(-1), null);
  assert.equal(epochOrNull(1788391740), 1788391740);
});

test("no offset means no time, because UTC would read as local and be hours wrong", () => {
  assert.equal(formatAirportTime(JBU355_REAL_DEP, null, "PDT", true), null);
  assert.equal(formatAirportTime(JBU355_REAL_DEP, undefined, null, true), null);
});

test("a missing zone abbreviation just drops the suffix", () => {
  assert.equal(formatAirportTime(JBU355_REAL_DEP, JFK_OFFSET, null, true), "8:10 PM");
  assert.equal(formatAirportTime(JBU355_REAL_DEP, JFK_OFFSET, "  ", true), "8:10 PM");
});

test("the +1 is computed in each airport's own calendar", () => {
  // JBU488, live: leaves ONT 22:41 on the 2nd, lands BOS 06:54 on the 3rd.
  assert.equal(dayOffset(1788414095, ONT_OFFSET, 1788432840, JFK_OFFSET), 1);
  // JBU355 crosses three zones westbound and still lands the same day.
  assert.equal(dayOffset(JBU355_REAL_DEP, JFK_OFFSET, JBU355_EST_ARR, ONT_OFFSET), 0);
  // Missing either end is not a day change.
  assert.equal(dayOffset(0, ONT_OFFSET, 1788432840, JFK_OFFSET), 0);
  assert.equal(dayOffset(1788414095, null, 1788432840, JFK_OFFSET), 0);
});

test("durations read as a cockpit would say them", () => {
  assert.equal(formatDuration(47), "47m");
  assert.equal(formatDuration(72), "1h 12m");
  assert.equal(formatDuration(60), "1h 00m");
  assert.equal(formatDuration(0.4), "< 1m");
  assert.equal(formatDuration(-3), null);
  assert.equal(formatDuration(null), null);
});

test("the reported estimate beats distance over ground speed", () => {
  const now = 1788414000;
  // 192 s to run per the airline; the speed-based guess would say much less.
  assert.ok(Math.abs(etaMinutes(JBU355_EST_ARR, 3.15, 135, now)! - 3.2) < 0.001);
  // No estimate: fall back to the distance the aircraft still has to fly.
  const fallback = etaMinutes(null, 100, 400, now)!;
  assert.ok(Math.abs(fallback - 8.099) < 0.01, `${fallback}`);
  // An estimate already in the past is not a countdown -- a late aircraft must
  // not report a negative, or "0m" for the rest of the flight.
  assert.ok(etaMinutes(now - 600, 100, 400, now)! > 0);
  assert.equal(etaMinutes(null, 100, 0, now), null);
  assert.equal(etaMinutes(null, null, 400, now), null);
  assert.equal(etaMinutes(0, null, null, now), null);
});
