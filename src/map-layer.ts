/**
 * Everything the card draws on the map: aircraft, their tracks, airports and
 * the area-centre dot, through `ha-map`'s engine-neutral API (engine.ts), so it
 * renders on MapLibre and on the Leaflet fallback alike.
 *
 * One instance per engine instance. When `ha-map` destroys its engine -- on
 * disconnect, or when a WebGL context loss swaps MapLibre for Leaflet -- every
 * handle here is dead, and the card calls `abandon()` and builds a new layer.
 *
 * **Never rebuilt wholesale.** Each tick is diffed (`diffFlights`): what
 * arrived is added, what moved is re-aimed, what turned is restyled IN PLACE
 * (the element is ours, so a restyle is one innerHTML write and nothing
 * blinks), what left is removed. Clearing and redrawing per tick is the obvious
 * implementation and it destroys marker identity: the field blinks and the
 * selected aircraft loses its highlight once a minute.
 *
 * **Motion runs on requestAnimationFrame**, computing each aircraft's position
 * from the clock. MapLibre rewrites every marker's transform on each map frame,
 * so the 0.5.x approach -- a 1 s step plus a CSS transition -- would drag the
 * aircraft behind every pan (engine.ts fact 4). Because each frame draws where
 * the aircraft IS, a throttled or backgrounded tab cannot come back and
 * animate minutes of flight across the map; it just draws the present. Moves
 * under `MIN_MOVE_PX` are skipped, which at the zoom an area is fitted at is
 * nearly all of them. Measured on the Pixel Tablet (TODO.md): 0.2-0.3 ms of
 * script per frame at 16-50 aircraft, 60 fps held on both engines.
 */

import {
  engineKind,
  moveMarker,
  raiseMarker,
  type EngineMarkerHandle,
  type EnginePathHandle,
  type EnginePathSpec,
  type MapEngine,
} from "./engine";
import { aircraftKind, diffFlights, flightLabel, indexById, isOnGround, type Airport } from "./flights";
import { projectKm } from "./geo";
import {
  aircraftIconHtml,
  airportIcon,
  type AircraftIconStyle,
  type AircraftShape,
  type AirportIconStyle,
} from "./markers";
import { MotionTracker, type MotionFix } from "./motion";
import type { MotionMode } from "./config";
import type { Flight } from "./types";

/**
 * Track opacity. Deliberately faint: eleven 50-point trails is the normal case
 * here, and they are context for the aircraft, not the subject. Width is the
 * engine's fixed 3 px (engine.ts fact 3), so the selected trail stands out by
 * colour and opacity alone.
 */
const TRACK_OPACITY = 0.45;
const SELECTED_TRACK_OPACITY = 0.9;

/**
 * Skip a frame's move for an aircraft that has not travelled this far on
 * screen since its last one.
 *
 * At the zoom an area is usually fitted at, per-frame updates are almost all
 * waste: at zoom 9 a pixel is ~250 m here, so even a 450 kt jet crosses under
 * one pixel a second, i.e. ~1/60 px per frame. Both engines re-place a marker
 * from its stored position whenever the map itself moves, so a marker held a
 * fraction of a pixel stale is never visibly wrong.
 */
const MIN_MOVE_PX = 0.25;

/** Stacking levels on MapLibre (engine.ts fact 6). */
const Z_AIRPORT = 0;
const Z_AIRCRAFT = 1;
const Z_SELECTED = 2;

/** The area-centre dot, in px. */
const CENTRE_SIZE = 10;

/** Web Mercator at 256 px tiles, which is the zoom scale `getView()` reports. */
function metresPerPixel(lat: number, zoom: number): number {
  return (156_543.034 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

/** markers.ts stays runtime-import-free, so the layer adapts the flight for it. */
function shapeOf(flight: Flight, selected: boolean): AircraftShape {
  return {
    // The way the marker is being MOVED, which is not always the reported
    // heading -- see the card's `_displayHeading`. Falls back to the reported
    // heading, so this is never worse than the raw value.
    heading: flight.heading_display ?? flight.heading,
    kind: aircraftKind(flight),
    grounded: isOnGround(flight),
    selected,
  };
}

/** motion.ts stays runtime-import-free, so the layer adapts the flight for it. */
function fixOf(flight: Flight, at: number): MotionFix {
  return {
    lat: flight.latitude,
    lon: flight.longitude,
    speed: flight.ground_speed,
    heading: flight.heading,
    grounded: isOnGround(flight),
    at,
  };
}

/** A straight slide between two positions -- `motion: glide` only. */
interface Glide {
  from: [number, number];
  to: [number, number];
  start: number;
  ms: number;
}

interface Drawn {
  element: HTMLDivElement;
  handle: EngineMarkerHandle;
  /** Where the marker is aimed right now -- the handle cannot say on Leaflet. */
  at: [number, number];
  glide?: Glide;
  track?: EnginePathHandle;
}

interface Placed {
  handle: EngineMarkerHandle;
}

export interface MapView {
  center: [number, number];
  zoom: number;
}

/** What one stretch of the frame loop cost. Only collected when enabled. */
export interface FrameStats {
  frames: number;
  /** Our own work per frame, in ms. */
  scriptMs: { mean: number; p95: number; max: number };
  /** Time between frames, in ms -- includes the engine's own rendering. */
  intervalMs: { p50: number; p95: number; max: number };
  /** Frames more than 1.5x the median interval apart. */
  longFrames: number;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

export class MapLayer {
  readonly engine: MapEngine;
  private readonly _view: () => MapView | undefined;
  private readonly _onSelect: (id: string) => void;
  private readonly _motion = new MotionTracker();

  private _mode: MotionMode = "predicted";
  private _items = new Map<string, Drawn>();
  private _flights = new Map<string, Flight>();
  private _selectedId?: string;
  private _style?: AircraftIconStyle;
  private _showTracks = true;

  private _airports: Placed[] = [];
  private _airportKey = "";
  private _centre?: Placed & { element: HTMLDivElement };
  private _centreKey = "";

  private _frame?: number;
  /** Motion is held still until then -- the Leaflet zoom guard. */
  private _pausedUntil = 0;

  private _stats = false;
  private _scriptSamples: number[] = [];
  private _intervalSamples: number[] = [];
  private _lastFrameAt = 0;

  constructor(engine: MapEngine, view: () => MapView | undefined, onSelect: (id: string) => void) {
    this.engine = engine;
    this._view = view;
    this._onSelect = onSelect;
  }

  get kind(): ReturnType<typeof engineKind> {
    return engineKind(this.engine);
  }

  setGapMs(gapMs: number): void {
    this._motion.setGapMs(gapMs);
  }

  /**
   * Change how the aircraft move. Called before each sync, because the mode can
   * change under the card (a config edit, or the reader turning reduced motion
   * on) without the layer being rebuilt.
   */
  setMode(mode: MotionMode, at = Date.now()): void {
    if (mode === this._mode) return;
    this._mode = mode;
    for (const [id, item] of this._items) {
      item.glide = undefined;
      const flight = this._flights.get(id);
      if (!flight) continue;
      if (mode === "predicted") {
        // Seeded from the fix, so prediction starts here rather than at the
        // next tick.
        this._motion.update(id, fixOf(flight, at));
      } else {
        // Whatever was in flight lands on the real fix: the new mode does not
        // extrapolate, so drawing anything else would be a position it never
        // reported.
        this._place(item, [flight.latitude, flight.longitude]);
      }
    }
    if (mode !== "predicted") this._motion.clear();
    this._ensureLoop();
  }

  /**
   * Patch the aircraft to one tick's flights.
   *
   * `glideMs` is how long a `glide` slide runs: the measured gap between ticks,
   * so the aircraft arrives as the next fix lands.
   */
  sync(flights: Flight[], style: AircraftIconStyle, showTracks: boolean, glideMs: number, at = Date.now()): void {
    const restyleAll = this._style !== undefined && !sameStyle(this._style, style);
    const retrackAll = showTracks !== this._showTracks;
    this._style = style;
    this._showTracks = showTracks;
    const diff = diffFlights(this._flights, flights);

    for (const id of diff.removed) {
      const item = this._items.get(id);
      item?.handle.remove();
      item?.track?.remove();
      this._items.delete(id);
      this._motion.forget(id);
      // The selected aircraft left the area. The card clears its detail panel.
      if (this._selectedId === id) this._selectedId = undefined;
    }

    for (const flight of diff.added) this._add(flight, style, at);

    for (const { flight, moved, restyled, retracked } of diff.changed) {
      const item = this._items.get(flight.id);
      if (!item) continue;
      if (restyled && !restyleAll) this._paint(item, flight);
      // A tick that did not MOVE the aircraft is not a new fix: taking it on
      // as one would reset the extrapolation clock and snap a predicted
      // marker back to a position it had already flown past.
      if (moved) this._moveTo(item, flight, glideMs, at);
      if (retracked && !retrackAll) this._drawTrack(item, flight);
    }

    this._flights = indexById(flights);
    // A theme switch or a tracks toggle touches every aircraft, including the
    // ones the diff calls unchanged.
    if (restyleAll || retrackAll) {
      for (const [id, item] of this._items) {
        const flight = this._flights.get(id);
        if (!flight) continue;
        if (restyleAll) this._paint(item, flight);
        if (retrackAll || restyleAll) this._drawTrack(item, flight);
      }
    }
    this._ensureLoop();
  }

  /** Move the selected look from one aircraft to another (or to none). */
  select(id: string | undefined): void {
    const previous = this._selectedId;
    this._selectedId = id;
    for (const changed of new Set([previous, id])) {
      if (!changed) continue;
      const item = this._items.get(changed);
      const flight = this._flights.get(changed);
      if (!item || !flight) continue;
      this._paint(item, flight);
      // Remove + re-add is the only way to raise a path (engine.ts fact 3).
      item.track?.remove();
      item.track = undefined;
      this._drawTrack(item, flight);
    }
  }

  /** Where the marker for `id` is drawn now, for a pan-to-selection. */
  positionOf(id: string): [number, number] | undefined {
    return this._items.get(id)?.at;
  }

  /**
   * Redraw the airports, but only when the SET of airports changes.
   *
   * Airports do not move, so there is nothing to patch: rebuilding them is
   * cheap and only happens when a field enters or leaves the flights'
   * origin/destination set, which at a busy GA field is almost never.
   */
  syncAirports(airports: Airport[], style: AirportIconStyle): void {
    const key = airports.map((a) => a.code).join(",") + JSON.stringify(style);
    if (key === this._airportKey) return;
    this._airportKey = key;
    for (const placed of this._airports) placed.handle.remove();
    this._airports = airports.map((airport) => {
      const markup = airportIcon(airport.code, style);
      const element = document.createElement("div");
      element.innerHTML = markup.html;
      const handle = this.engine.addMarker(element, [airport.latitude, airport.longitude], {
        size: markup.size,
        anchor: markup.anchor,
        title: airport.name ?? airport.code,
        // Never steals a tap from an aircraft, and never takes the selection.
        interactive: false,
      });
      raiseMarker(handle, element, Z_AIRPORT, false);
      return { handle };
    });
  }

  /**
   * The small dot at the centre of the watched area, or none.
   *
   * A marker rather than `addCircle`, whose radius is in metres: a dot that
   * grew and shrank with the zoom would read as an area, not a point.
   */
  setCentre(at: [number, number] | null, color: string, fill: string): void {
    const key = at ? `${at[0]},${at[1]},${color},${fill}` : "";
    if (key === this._centreKey) return;
    this._centreKey = key;
    this._centre?.handle.remove();
    this._centre = undefined;
    if (!at) return;
    const element = document.createElement("div");
    element.style.cssText =
      `width:${CENTRE_SIZE}px;height:${CENTRE_SIZE}px;box-sizing:border-box;border-radius:50%;` +
      `border:2px solid ${color.replace(/[";<>]/g, "")};background:${fill.replace(/[";<>]/g, "")};`;
    // Non-interactive so a drag that starts here still pans the map, and so it
    // can never steal a tap meant for an aircraft.
    const handle = this.engine.addMarker(element, at, { size: [CENTRE_SIZE, CENTRE_SIZE], interactive: false });
    raiseMarker(handle, element, Z_AIRPORT, false);
    this._centre = { handle, element };
  }

  /** Hold motion still for up to `ms` -- the Leaflet zoom guard. */
  pause(ms: number): void {
    this._pausedUntil = Date.now() + ms;
  }

  resume(): void {
    this._pausedUntil = 0;
  }

  /** Remove everything this layer drew. */
  destroy(): void {
    for (const item of this._items.values()) {
      item.handle.remove();
      item.track?.remove();
    }
    for (const placed of this._airports) placed.handle.remove();
    this._centre?.handle.remove();
    this.abandon();
  }

  /**
   * Forget everything WITHOUT touching the engine -- for when the engine has
   * already been destroyed and every handle with it.
   */
  abandon(): void {
    this._stop();
    this._items.clear();
    this._flights.clear();
    this._motion.clear();
    this._airports = [];
    this._airportKey = "";
    this._centre = undefined;
    this._centreKey = "";
  }

  /** Start collecting frame statistics. For the probe; off in the card. */
  enableStats(): void {
    this._stats = true;
  }

  /** Read and reset the frame statistics. */
  takeStats(): FrameStats {
    const script = [...this._scriptSamples].sort((a, b) => a - b);
    const interval = [...this._intervalSamples].sort((a, b) => a - b);
    const p50 = percentile(interval, 0.5);
    this._scriptSamples = [];
    this._intervalSamples = [];
    return {
      frames: script.length,
      scriptMs: {
        mean: script.reduce((sum, v) => sum + v, 0) / (script.length || 1),
        p95: percentile(script, 0.95),
        max: script[script.length - 1] ?? 0,
      },
      intervalMs: { p50, p95: percentile(interval, 0.95), max: interval[interval.length - 1] ?? 0 },
      longFrames: interval.filter((v) => v > p50 * 1.5).length,
    };
  }

  private _add(flight: Flight, style: AircraftIconStyle, at: number): void {
    const id = flight.id;
    const element = document.createElement("div");
    element.style.cursor = "pointer";
    element.addEventListener("click", (event) => {
      // Not a map click as well: ha-map turns those into `map-clicked`.
      event.stopPropagation();
      this._onSelect(id);
    });
    const position: [number, number] = [flight.latitude, flight.longitude];
    const handle = this.engine.addMarker(element, position, {
      size: [style.size, style.size],
      // Native tooltip: the callsign without a tap, and it costs no DOM.
      title: flightLabel(flight),
    });
    const item: Drawn = { element, handle, at: position };
    this._items.set(id, item);
    this._paint(item, flight);
    if (this._mode === "predicted") this._motion.update(id, fixOf(flight, at));
    this._drawTrack(item, flight);
  }

  private _paint(item: Drawn, flight: Flight): void {
    if (!this._style) return;
    const selected = flight.id === this._selectedId;
    item.element.innerHTML = aircraftIconHtml(shapeOf(flight, selected), this._style);
    raiseMarker(item.handle, item.element, selected ? Z_SELECTED : Z_AIRCRAFT, selected);
  }

  private _moveTo(item: Drawn, flight: Flight, glideMs: number, at: number): void {
    const to: [number, number] = [flight.latitude, flight.longitude];
    if (this._mode === "predicted") {
      // Where the marker is aimed right now, so the tracker can fade the
      // correction out from THERE rather than from a recomputed guess.
      this._motion.update(flight.id, fixOf(flight, at), item.at[0], item.at[1]);
    } else if (this._mode === "glide") {
      // Every position drawn is on the straight line between two REAL fixes --
      // the aircraft reads as one tick late, never as somewhere it has not been.
      item.glide = { from: item.at, to, start: at, ms: glideMs };
    } else {
      item.glide = undefined;
      this._place(item, to);
    }
  }

  private _place(item: Drawn, at: [number, number]): void {
    item.at = at;
    moveMarker(item.handle, at);
  }

  private _drawTrack(item: Drawn, flight: Flight): void {
    const points = flight.coordinates;
    // One point is a dot, not a trail, and reads as a rendering fault.
    if (points.length < 2 || !this._showTracks || !this._style) {
      item.track?.remove();
      item.track = undefined;
      return;
    }
    const selected = flight.id === this._selectedId;
    const spec: EnginePathSpec = {
      color: selected ? this._style.selectedColor : this._style.color,
      segments: [{ points, opacity: selected ? SELECTED_TRACK_OPACITY : TRACK_OPACITY }],
      markers: [],
    };
    if (item.track) item.track.update(spec);
    else item.track = this.engine.addPath(spec);
  }

  /** Whether anything needs drawing per frame. */
  private _animating(): boolean {
    if (!this._items.size) return false;
    if (this._mode === "predicted") return true;
    if (this._mode === "glide") for (const item of this._items.values()) if (item.glide) return true;
    return false;
  }

  private _ensureLoop(): void {
    if (this._frame !== undefined || !this._animating()) return;
    this._lastFrameAt = 0;
    const tick = (now: number) => {
      if (!this._animating()) {
        this._frame = undefined;
        return;
      }
      this._frame = requestAnimationFrame(tick);
      const t0 = this._stats ? performance.now() : 0;
      this._step(Date.now());
      if (this._stats) {
        this._scriptSamples.push(performance.now() - t0);
        if (this._lastFrameAt) this._intervalSamples.push(now - this._lastFrameAt);
        this._lastFrameAt = now;
      }
    };
    this._frame = requestAnimationFrame(tick);
  }

  private _stop(): void {
    if (this._frame !== undefined) cancelAnimationFrame(this._frame);
    this._frame = undefined;
  }

  private _step(now: number): void {
    if (now < this._pausedUntil) return;
    const view = this._view();
    // Degrees of latitude per pixel; longitude is scaled per aircraft below.
    const minDeg = view ? (metresPerPixel(view.center[0], view.zoom) / 111_320) * MIN_MOVE_PX : 0;

    for (const [id, item] of this._items) {
      let next: [number, number];
      if (this._mode === "predicted") {
        const step = this._motion.step(id, now);
        if (!step) continue;
        const [lat, lon] = projectKm([step.fromLat, step.fromLon], step.bearing, step.km);
        next = [lat + step.residualLat, lon + step.residualLon];
      } else {
        const glide = item.glide;
        if (!glide) continue;
        const t = glide.ms > 0 ? Math.min(1, (now - glide.start) / glide.ms) : 1;
        next = [glide.from[0] + (glide.to[0] - glide.from[0]) * t, glide.from[1] + (glide.to[1] - glide.from[1]) * t];
        if (t >= 1) {
          item.glide = undefined;
          // The last step always lands exactly, whatever the pixel skip says.
          this._place(item, glide.to);
          continue;
        }
      }
      const dLat = next[0] - item.at[0];
      const dLon = (next[1] - item.at[1]) * Math.cos((next[0] * Math.PI) / 180);
      if (dLat * dLat + dLon * dLon <= minDeg * minDeg) continue;
      this._place(item, next);
    }
  }
}

function sameStyle(a: AircraftIconStyle, b: AircraftIconStyle): boolean {
  return (
    a.size === b.size &&
    a.color === b.color &&
    a.outline === b.outline &&
    a.groundColor === b.groundColor &&
    a.selectedColor === b.selectedColor
  );
}
