/**
 * In-page probe for the card's map layer (src/map-layer.ts).
 *
 * Built to its own bundle by `npm run build:probe` and injected into a live
 * Home Assistant page by probe/run.mjs. It never ships: HACS installs only
 * `dist/flight-map-card.js`, and nothing here is registered as a card.
 *
 * It puts a full-viewport `ha-map` on the page on the requested engine, drives
 * N synthetic aircraft through the prototype layer, and reports frame
 * statistics for three phases: steady flight, a pan + zoom, and a feed tick
 * that hands every aircraft a new fix (the residual-correction path).
 */

import { engineKind } from "../src/engine";
import { MapLayer, type FrameStats } from "../src/map-layer";
import { parseFlights } from "../src/flights";
import { projectKm } from "../src/geo";
import { ensureHaMap, type HaMapElement } from "../src/ha-map";
import type { AircraftIconStyle } from "../src/markers";
import type { Flight } from "../src/types";

interface ProbeMap extends HaMapElement {
  /** ha-map's own switch onto the Leaflet engine; the card never sets it. */
  _forceLeaflet?: boolean;
  setView(center: [number, number], zoom?: number): void;
}

interface ProbeResult {
  engine: string;
  count: number;
  phases: Record<string, FrameStats>;
  /** Markers whose element is inside the map frame at the end of the run. */
  onScreen: number;
}

const STYLE: AircraftIconStyle = {
  size: 26,
  // The card's pinned-dark palette: ha-map follows the dashboard, which is dark
  // in the headless profile.
  color: "#f5f5f5",
  outline: "#1c1c1c",
  groundColor: "#8f8f8f",
  selectedColor: "#03a9f4",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Deterministic, so two runs fly the same field. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function synthFlights(count: number, centre: [number, number], ageS: number): Flight[] {
  const random = rng(42);
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const heading = Math.round(random() * 360);
    const knots = 90 + random() * 360;
    const start = projectKm(centre, random() * 360, random() * 40);
    // Where it is `ageS` seconds after `start`, plus the feed's typical ~0.7 km
    // disagreement with a straight-line prediction.
    const flown = (knots * 1.852 * ageS) / 3600;
    const noise = ageS ? 0.7 : 0;
    const here = projectKm(projectKm(start, heading, flown), random() * 360, noise * random());
    // A trail behind it, ending on its position like the real feed's.
    const coordinates: [number, number][] = [];
    for (let k = 29; k >= 0; k--) coordinates.push(projectKm(here, (heading + 180) % 360, k * 0.6));
    rows.push({
      id: `probe${i}`,
      callsign: `PRB${i}`,
      latitude: here[0],
      longitude: here[1],
      heading,
      ground_speed: Math.round(knots),
      altitude: 3000 + Math.round(random() * 30000),
      aircraft_category: i % 7 === 0 ? "helicopter" : null,
      on_ground: 0,
      coordinates,
    });
  }
  return parseFlights(rows);
}

/** Frame intervals with nothing of ours running, in the same shape. */
function sampleFrames(ms: number): Promise<FrameStats> {
  return new Promise((resolve) => {
    const intervals: number[] = [];
    let last = 0;
    const end = performance.now() + ms;
    const tick = (now: number) => {
      if (last) intervals.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else {
        intervals.sort((a, b) => a - b);
        const at = (p: number) => intervals[Math.min(intervals.length - 1, Math.floor(intervals.length * p))] ?? 0;
        const p50 = at(0.5);
        resolve({
          frames: intervals.length,
          scriptMs: { mean: 0, p95: 0, max: 0 },
          intervalMs: { p50, p95: at(0.95), max: intervals[intervals.length - 1] ?? 0 },
          longFrames: intervals.filter((v) => v > p50 * 1.5).length,
        });
      }
    };
    requestAnimationFrame(tick);
  });
}

let host: HTMLElement | undefined;
let layer: MapLayer | undefined;

function cleanup(): void {
  layer?.destroy();
  layer = undefined;
  host?.remove();
  host = undefined;
}

async function run(options: { count: number; engine: "maplibre" | "leaflet" }): Promise<ProbeResult> {
  cleanup();
  if (!(await ensureHaMap())) throw new Error("ha-map did not load");
  const app = document.querySelector("home-assistant") as (HTMLElement & { hass?: any }) | null;
  if (!app?.shadowRoot) throw new Error("not a Home Assistant page");
  const centre: [number, number] = [app.hass.config.latitude, app.hass.config.longitude];

  host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:9999;background:#000";
  const el = document.createElement("ha-map") as ProbeMap;
  el.style.cssText = "display:block;width:100%;height:100%";
  // Inside the app's shadow root so ha-map's context requests reach a provider.
  if (options.engine === "leaflet") el._forceLeaflet = true;
  el.autoFit = false;
  host.appendChild(el);
  app.shadowRoot.appendChild(host);

  const deadline = Date.now() + 20_000;
  while (!(el._loaded && el._engine) && Date.now() < deadline) await sleep(50);
  const engine = el._engine;
  if (!engine) throw new Error("engine never came up");

  el.setView(centre, 9);
  await sleep(2500);

  layer = new MapLayer(engine, () => el.getView(), (id) => layer?.select(id));
  layer.enableStats();
  layer.setGapMs(60_000);
  layer.sync(synthFlights(options.count, centre, 0), STYLE, true, 60_000);
  await sleep(1000);
  layer.takeStats();

  const phases: Record<string, FrameStats> = {};
  await sleep(5000);
  phases.steady = layer.takeStats();

  // Same markers, motion stopped: what merely HAVING them costs, so the steady
  // figure can be split into presence and movement.
  layer.setMode("none");
  phases.frozen = await sampleFrames(5000);
  layer.setMode("predicted");
  await sleep(500);
  layer.takeStats();

  // A pan away and back, then a zoom in and out: every frame of this moves
  // every marker on MapLibre whatever the layer does.
  const away = projectKm(centre, 90, 15);
  el.panTo(away);
  await sleep(1200);
  el.panTo(centre);
  await sleep(1200);
  el.setView(centre, 11);
  await sleep(1300);
  el.setView(centre, 9);
  await sleep(1300);
  phases.panZoom = layer.takeStats();

  // Close in, where a fast jet crosses several pixels a second and the
  // sub-pixel skip stops saving anything.
  el.setView(centre, 12);
  await sleep(2500);
  layer.takeStats();
  await sleep(4000);
  phases.zoom12 = layer.takeStats();
  el.setView(centre, 9);
  await sleep(2500);
  layer.takeStats();

  // A feed tick 60 s on: every aircraft gets a new fix and a residual.
  layer.sync(synthFlights(options.count, centre, 60), STYLE, true, 60_000);
  layer.select("probe0");
  await sleep(4000);
  phases.tick = layer.takeStats();

  const frame = host.getBoundingClientRect();
  let onScreen = 0;
  for (const marker of el.shadowRoot?.querySelectorAll<HTMLElement>("div[title^='PRB']") ?? []) {
    const r = marker.getBoundingClientRect();
    if (r.width && r.left >= frame.left && r.right <= frame.right && r.top >= frame.top && r.bottom <= frame.bottom)
      onScreen++;
  }

  return { engine: engineKind(engine), count: options.count, phases, onScreen };
}

(window as unknown as { __fmcProbe: unknown }).__fmcProbe = { run, cleanup };
