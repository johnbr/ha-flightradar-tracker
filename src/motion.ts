/**
 * Where an aircraft is NOW, between fixes.
 *
 * ## Why this exists
 *
 * The card used to draw each aircraft strictly on the line between its last two
 * fixes, sliding from one to the next over however long the previous gap had
 * been. That is honest, and on a steady feed it looks right. This feed is not
 * steady, and measuring it is what killed the approach. Ten minutes of live
 * ticks, gap in seconds:
 *
 *     29.5 60.5 72.0 57.4 50.6 37.9 29.5 36.8 29.1 23.7 25.3 22.7 24.8 29.5 23.7 31.2
 *     aircraft overhead:  11 13 14 16 14 13 10 9 10 10 9 10 10 10 10 9 10
 *
 * THE PERIOD IS NOT THE INTEGRATION'S `scan_interval` -- 10 s here, and not one
 * gap came close to it. A `DataUpdateCoordinator` schedules the next refresh
 * after the previous one RETURNS, and this integration fetches each aircraft's
 * details serially inside the area loop, so the period is the cycle duration
 * plus the interval and it tracks the traffic: 9-10 aircraft gave 23-30 s, 16
 * gave 72. Lowering `scan_interval` cannot shorten it and only adds load to an
 * endpoint that already answers 429 here.
 *
 * Two consequences, and the second is the one that matters:
 *
 * - **A tween sized from the last gap is routinely short.** The gap grows as
 *   traffic builds, so the tween ends before the next fix lands and the
 *   aircraft sits frozen for the remainder -- 12 % of wall time over the whole
 *   sample, 18 % over its busy half, and those stalls are 10-20 s each, which
 *   is well past the point where "slow" starts reading as "stuck".
 * - **Interpolating between two fixes means drawing a whole tick late.** Over
 *   the same window the marker was a median **1.75 km** from where the aircraft
 *   actually was (p90 5.74, max 10.36, n=125).
 *
 * ## Predicting is the MORE accurate option here, not the less
 *
 * "Nothing is extrapolated" reads like a virtue and is not one on a feed this
 * slow. Replaying the same window, projecting each fix forward along its
 * reported `heading` at its reported `ground_speed` landed a median **0.70 km**
 * from the true next fix (p90 2.68, max 5.42) -- under half the error of
 * drawing the last fix, and that is measured at the WORST instant, just before
 * the next fix lands.
 *
 * So the choice is not truth against invention. It is a 1.75 km lag that
 * stalls, against a 0.70 km prediction that does not.
 *
 * The velocity is the reported `heading` + `ground_speed`, NOT the observed
 * vector between the last two fixes. That was measured too and it is worse
 * (median 1.16 km): the observed vector is a chord averaged over the whole
 * gap, so for anything turning -- which around a GA field is most of the fleet
 * -- it is already stale on arrival, while the reported pair is the aircraft's
 * state AT the fix.
 *
 * ## Import-free
 *
 * Same rule as markers.ts: this module imports nothing at runtime, so
 * `node --test` can type-strip it. It therefore returns a displacement --
 * bearing, distance, and a residual in degrees -- and leaves the geodesy to
 * geo.ts.
 */

/** What one fix tells us about where the aircraft is going. */
export interface MotionFix {
  lat: number;
  lon: number;
  /** Reported ground speed, knots. Null or 0 means "do not predict". */
  speed: number | null;
  /** Reported heading, degrees true. Null means "do not predict". */
  heading: number | null;
  /** On the ground: parked or taxiing, where the reported vector is noise. */
  grounded: boolean;
  /** Clock reading (ms) when this fix was taken on. */
  at: number;
}

/** Where to draw the aircraft: a displacement from the fix it started at. */
export interface MotionStep {
  /** The fix the displacement is measured from. */
  fromLat: number;
  fromLon: number;
  /** Great-circle bearing to travel from the fix, degrees true. */
  bearing: number;
  /** How far along it, km. Zero for an aircraft that is not being predicted. */
  km: number;
  /** Un-absorbed correction from the previous prediction, in degrees. */
  residualLat: number;
  residualLon: number;
}

const KM_PER_NM = 1.852;

/**
 * How far ahead of its last fix an aircraft may be drawn.
 *
 * Same number, and the same reasoning, as the old glide ceiling: past two
 * minutes the feed has genuinely stalled, and freezing is the honest thing to
 * draw. A 400 kt jet extrapolated for two minutes has been carried 25 km, which
 * is further than the width of the watched area -- so an aircraft that has
 * really been silent that long has almost certainly left it, and inventing a
 * continued flight would be worse than admitting the feed stopped.
 *
 * THIS IS NOT AN EDGE CASE. The feed keeps republishing a row after the
 * aircraft stops being tracked, byte for byte: over the live capture **23 % of
 * all flight/tick pairs carried an unchanged position**, and three of the 23
 * aircraft seen were frozen for 8, 13 and 16 consecutive ticks -- a C172 at
 * 850 ft that never moved once in seventeen minutes, a 737 that stopped dead on
 * approach at 144 kt, a helicopter that stopped mid-transit. Without the
 * horizon each of those would be drawn cruising serenely across the county on
 * the strength of a row nobody has updated since.
 *
 * So some of the aircraft on this map are genuinely, correctly motionless, and
 * no amount of animation can or should change that.
 */
export const PREDICT_MAX_MS = 120_000;

/**
 * The gap assumed before one has been measured, and the floor on the measured
 * one. Only used to scale the residual decay, so it is not critical.
 */
export const DEFAULT_GAP_MS = 45_000;

/**
 * How wrong a prediction may be and still be faded out rather than replaced.
 *
 * Measured, the prediction error tops out at 5.42 km and the longest single leg
 * any aircraft flew between two fixes was 10.36 km -- so nothing in ordinary
 * operation comes near this. It only fires when the feed has stalled long
 * enough for the marker to be somewhere the aircraft has not been for minutes.
 */
const RESIDUAL_MAX_KM = 15;

/**
 * The most of an aircraft's own speed a correction may spend.
 *
 * A correction is absorbed by moving the marker, and it can point BACKWARDS --
 * a straight-line prediction overshoots anything turning, so the fade has to
 * pull it back along its own track. Fade that over a fixed period and it
 * competes with the aircraft's motion, which is fine for a jet and not at all
 * fine for the circuit traffic this area is full of: replayed over the live
 * capture, three slow aircraft (31, 77 and 144 kt) had the correction cancel
 * their motion outright and spent most of their steps standing still -- the
 * exact symptom this module exists to remove, just with a different cause.
 *
 * So a correction is never allowed to eat more than half the aircraft's ground
 * speed; if it needs longer than a period at that rate, it gets longer. The
 * marker then always draws at least half speed and never reverses.
 */
const RESIDUAL_SPEED_SHARE = 0.5;

/**
 * And never longer than this. A correction still visible two minutes on is
 * being outlived by several of the fixes it was meant to reconcile.
 */
const RESIDUAL_MAX_MS = 120_000;

interface Tracked {
  fix: MotionFix;
  /** Correction still being absorbed, in degrees, and when it was taken on. */
  residualLat: number;
  residualLon: number;
  residualAt: number;
  /** How long the correction has to be spread over. */
  residualMs: number;
}

/**
 * Keeps one fix per aircraft and says where each one should be drawn.
 *
 * Deliberately holds no DOM and no Leaflet: it is arithmetic over time, which
 * is the part worth having tests for.
 */
export class MotionTracker {
  private _tracked = new Map<string, Tracked>();
  /** Rolling estimate of the feed's period, used to spread corrections. */
  private _gapMs = DEFAULT_GAP_MS;

  /** Tell the tracker how far apart the last two ticks were. */
  setGapMs(gapMs: number): void {
    if (Number.isFinite(gapMs) && gapMs > 0) this._gapMs = gapMs;
  }

  gapMs(): number {
    return this._gapMs;
  }

  has(id: string): boolean {
    return this._tracked.has(id);
  }

  forget(id: string): void {
    this._tracked.delete(id);
  }

  clear(): void {
    this._tracked.clear();
  }

  /**
   * A new fix landed.
   *
   * `drawnLat`/`drawnLon` are where the marker is currently AIMED -- the caller
   * reads them off the marker itself rather than having this recompute them,
   * because what has to be faded out is what is genuinely on screen, not an
   * idealised version of it.
   *
   * The prediction is almost never exactly the new fix: median 0.70 km apart,
   * measured. Snapping that away is a visible twitch on every aircraft on every
   * tick -- the same jerk this module exists to remove -- so the difference is
   * carried as a residual and bled off over roughly one feed period. Spreading
   * it over a period rather than a second is what keeps it invisible: it
   * perturbs the aircraft's apparent speed by a fraction instead of making it
   * lurch.
   */
  update(id: string, fix: MotionFix, drawnLat?: number, drawnLon?: number): void {
    let residualLat = 0;
    let residualLon = 0;
    if (this._tracked.has(id) && drawnLat !== undefined && drawnLon !== undefined) {
      residualLat = drawnLat - fix.lat;
      residualLon = drawnLon - fix.lon;
      if (roughKm(fix.lat, residualLat, residualLon) > RESIDUAL_MAX_KM) {
        // Too far to be a prediction error. The feed stalled and the aircraft
        // has been somewhere else for minutes, or the marker was left at a fix
        // it never flew from -- either way, fading that in would draw a long
        // journey that did not happen. Put it where it is.
        residualLat = 0;
        residualLon = 0;
      }
    }
    this._tracked.set(id, {
      fix,
      residualLat,
      residualLon,
      residualAt: fix.at,
      residualMs: this._residualMs(fix, residualLat, residualLon),
    });
  }

  /**
   * How long to spread a correction over: one feed period, or long enough that
   * it costs no more than half the aircraft's own speed, whichever is longer.
   *
   * An aircraft with no usable speed -- on the ground, or not reporting one --
   * gets the plain period, which for it is the whole of its motion: that is the
   * old glide, and it is the right behaviour for something that is not being
   * predicted in the first place.
   */
  private _residualMs(fix: MotionFix, residualLat: number, residualLon: number): number {
    const speed = fix.grounded || fix.speed === null || fix.speed <= 0 ? 0 : fix.speed;
    if (speed === 0) return this._gapMs;
    const km = roughKm(fix.lat, residualLat, residualLon);
    if (km === 0) return this._gapMs;
    const kmPerMs = (speed * KM_PER_NM) / 3_600_000;
    const atShare = km / (RESIDUAL_SPEED_SHARE * kmPerMs);
    return Math.min(Math.max(this._gapMs, atShare), RESIDUAL_MAX_MS);
  }

  /**
   * Where to draw `id` at `now`, or null if it is not tracked.
   *
   * An aircraft with no usable vector -- on the ground, no speed, no heading --
   * gets a zero displacement, i.e. it is drawn at its fix. That is the right
   * answer rather than a fallback: a parked aircraft's reported heading is
   * whichever way it happened to stop, and predicting along it would tow it
   * across the apron.
   */
  step(id: string, now: number): MotionStep | null {
    const tracked = this._tracked.get(id);
    if (!tracked) return null;
    const { fix } = tracked;

    let km = 0;
    let bearing = fix.heading ?? 0;
    if (!fix.grounded && fix.speed !== null && fix.speed > 0 && fix.heading !== null) {
      const elapsed = Math.min(Math.max(0, now - fix.at), PREDICT_MAX_MS);
      km = (fix.speed * KM_PER_NM * elapsed) / 3_600_000;
      bearing = fix.heading;
    }

    const age = now - tracked.residualAt;
    const left = tracked.residualMs > 0 ? 1 - age / tracked.residualMs : 0;
    const share = left > 0 ? Math.min(1, left) : 0;
    return {
      fromLat: fix.lat,
      fromLon: fix.lon,
      bearing,
      km,
      // `share || 0` rather than a bare multiply: at share 0 a negative residual
      // would come back as -0, which is a wart to hand a caller and which
      // `assert.equal` treats as a different number from 0.
      residualLat: share > 0 ? tracked.residualLat * share : 0,
      residualLon: share > 0 ? tracked.residualLon * share : 0,
    };
  }
}

/**
 * A degree offset as an approximate distance in km.
 *
 * Only ever compared against a threshold, never used as a position, so the
 * flat-earth conversion is the right tool: at these latitudes and over these
 * distances it is within a percent, and importing the spherical form would cost
 * this module its import-free property.
 */
function roughKm(lat: number, dLat: number, dLon: number): number {
  const rad = Math.PI / 180;
  const north = dLat * 111.32;
  const east = dLon * 111.32 * Math.cos(lat * rad);
  return Math.hypot(north, east);
}
