/**
 * Predicted motion.
 *
 * The arithmetic here is the part that can be wrong silently: an aircraft drawn
 * at the wrong extrapolated point still looks like an aircraft, and the error
 * is a kilometre on a map thirty wide. So the cases pinned are the ones a
 * screenshot could never catch -- the horizon that stops a stalled feed being
 * flown across the county, the aircraft that must NOT be predicted at all, and
 * the correction that has to fade rather than snap.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { MotionTracker, PREDICT_MAX_MS, type MotionFix } from "../src/motion.ts";
import { haversineKm, projectKm, bearingDeg } from "../src/geo.ts";

const KM_PER_NM = 1.852;

function fix(over: Partial<MotionFix> = {}): MotionFix {
  return {
    lat: 34.0,
    lon: -117.6,
    speed: 400,
    heading: 90,
    grounded: false,
    at: 1_000_000,
    ...over,
  };
}

/** Where the card would draw it: the tracker's displacement, applied. */
function drawn(tracker: MotionTracker, id: string, now: number): [number, number] {
  const step = tracker.step(id, now);
  assert.ok(step, "expected a step");
  const [lat, lon] = projectKm([step.fromLat, step.fromLon], step.bearing, step.km);
  return [lat + step.residualLat, lon + step.residualLon];
}

test("an aircraft it has never seen has no step", () => {
  const tracker = new MotionTracker();
  assert.equal(tracker.step("nobody", 0), null);
});

test("a fix is carried forward at its reported ground speed", () => {
  const tracker = new MotionTracker();
  const f = fix();
  tracker.update("a", f);

  const step = tracker.step("a", f.at + 60_000);
  assert.ok(step);
  assert.equal(step.bearing, 90);
  // 400 kt for 60 s.
  assert.ok(Math.abs(step.km - (400 * KM_PER_NM) / 60) < 1e-9, `km was ${step.km}`);

  const [lat, lon] = drawn(tracker, "a", f.at + 60_000);
  assert.ok(Math.abs(haversineKm([f.lat, f.lon], [lat, lon]) - step.km) < 1e-6);
  assert.ok(Math.abs(bearingDeg([f.lat, f.lon], [lat, lon]) - 90) < 0.5);
});

test("at the fix itself there is no displacement", () => {
  const tracker = new MotionTracker();
  const f = fix();
  tracker.update("a", f);
  assert.equal(tracker.step("a", f.at)?.km, 0);
});

test("prediction stops at the horizon rather than flying on forever", () => {
  const tracker = new MotionTracker();
  const f = fix();
  tracker.update("a", f);

  const capped = tracker.step("a", f.at + PREDICT_MAX_MS)?.km;
  const hours = tracker.step("a", f.at + 6 * 60 * 60 * 1000)?.km;
  assert.ok(capped && capped > 0);
  assert.equal(hours, capped);
});

test("a clock that goes backwards does not drag the aircraft backwards", () => {
  const tracker = new MotionTracker();
  const f = fix();
  tracker.update("a", f);
  assert.equal(tracker.step("a", f.at - 30_000)?.km, 0);
});

test("an aircraft on the ground is drawn where it is, not towed along", () => {
  const tracker = new MotionTracker();
  // A taxiing aircraft reports a real speed and whichever heading it is facing;
  // predicting along it would drive the marker off the apron.
  const f = fix({ grounded: true, speed: 15 });
  tracker.update("a", f);
  assert.equal(tracker.step("a", f.at + 60_000)?.km, 0);
});

test("no usable vector means no prediction", () => {
  const tracker = new MotionTracker();
  tracker.update("no-speed", fix({ speed: null }));
  tracker.update("zero-speed", fix({ speed: 0 }));
  tracker.update("no-heading", fix({ heading: null }));
  for (const id of ["no-speed", "zero-speed", "no-heading"]) {
    assert.equal(tracker.step(id, 1_060_000)?.km, 0, id);
  }
});

test("a new fix is faded in, not snapped to", () => {
  const tracker = new MotionTracker();
  tracker.setGapMs(60_000);
  const first = fix();
  tracker.update("a", first);

  // The aircraft turned, so it is not where the straight-line prediction had
  // it. The card hands back where the marker is aimed; the real fix is short of
  // it.
  const predicted = drawn(tracker, "a", first.at + 60_000);
  const second = fix({ at: first.at + 60_000, lat: predicted[0], lon: predicted[1] - 0.02 });
  tracker.update("a", second, predicted[0], predicted[1]);

  const atFix = drawn(tracker, "a", second.at);
  const gap = haversineKm([second.lat, second.lon], atFix);
  assert.ok(gap > 1, `expected the marker to be held where it was, was ${gap} km away`);
  assert.ok(Math.abs(atFix[0] - predicted[0]) < 1e-9, "latitude should be unchanged");
  assert.ok(Math.abs(atFix[1] - predicted[1]) < 1e-9, "longitude should be unchanged");

  // Half a period later, half the correction is gone -- measured against where
  // the prediction alone would have been, since the aircraft keeps flying while
  // the correction bleeds off.
  const half = drawn(tracker, "a", second.at + 30_000);
  const pure = projectKm([second.lat, second.lon], 90, (400 * KM_PER_NM) / 120);
  assert.ok(Math.abs(haversineKm(pure, half) - gap / 2) < 0.05, "half the correction should remain");

  // A full period later it is gone.
  const end = drawn(tracker, "a", second.at + 60_000);
  const pureEnd = projectKm([second.lat, second.lon], 90, (400 * KM_PER_NM) / 60);
  assert.ok(haversineKm(pureEnd, end) < 0.01, "the correction should be fully absorbed");
});

test("a first sighting has nothing to fade from", () => {
  const tracker = new MotionTracker();
  const f = fix();
  // Even handed a drawn position, an aircraft the tracker has not seen before
  // is placed at its fix: there is no earlier prediction to reconcile with, and
  // treating a stale marker position as one would drag it in from nowhere.
  tracker.update("a", f, f.lat + 0.05, f.lon + 0.05);
  const step = tracker.step("a", f.at);
  assert.equal(step?.residualLat, 0);
  assert.equal(step?.residualLon, 0);
});

test("a correction too big to be a prediction error is not animated", () => {
  const tracker = new MotionTracker();
  tracker.setGapMs(60_000);
  const first = fix();
  tracker.update("a", first);
  // The feed stalled: the marker is frozen at the horizon and the aircraft has
  // reappeared far away. Crawling it across the map would draw a journey that
  // never happened.
  tracker.update("a", fix({ at: first.at + 300_000 }), first.lat + 1.5, first.lon);
  const step = tracker.step("a", first.at + 300_000);
  assert.equal(step?.residualLat, 0);
  assert.equal(step?.residualLon, 0);
});

test("the correction never overshoots once the window has passed", () => {
  const tracker = new MotionTracker();
  tracker.setGapMs(30_000);
  const first = fix();
  tracker.update("a", first);
  const predicted = drawn(tracker, "a", first.at + 30_000);
  const second = fix({ at: first.at + 30_000, lat: predicted[0] - 0.05, lon: predicted[1] });
  tracker.update("a", second, predicted[0], predicted[1]);

  const late = tracker.step("a", second.at + 5 * 60_000);
  assert.ok(late);
  assert.equal(late.residualLat, 0);
  assert.equal(late.residualLon, 0);
});

test("forget and clear drop what they say they drop", () => {
  const tracker = new MotionTracker();
  tracker.update("a", fix());
  tracker.update("b", fix());
  assert.ok(tracker.has("a"));
  tracker.forget("a");
  assert.equal(tracker.has("a"), false);
  assert.ok(tracker.has("b"));
  tracker.clear();
  assert.equal(tracker.has("b"), false);
});

test("a nonsense gap is ignored rather than freezing the fade", () => {
  const tracker = new MotionTracker();
  const before = tracker.gapMs();
  tracker.setGapMs(0);
  tracker.setGapMs(Number.NaN);
  tracker.setGapMs(-5);
  assert.equal(tracker.gapMs(), before);
});
