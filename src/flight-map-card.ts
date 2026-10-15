/**
 * Flight Map Card -- an interactive map of the aircraft overhead, with a detail
 * panel below it.
 *
 * Everything the card renders comes from one attribute on one entity
 * (`attributes.flights[]` on the Flightradar24 integration's area sensor), so
 * this is a pure frontend plugin with no Python side.
 */

import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import {
  CARD_TYPE,
  DEFAULTS,
  EDITOR_TYPE,
  parseConfig,
  resolveConfig,
  type MotionMode,
  type ResolvedConfig,
} from "./config";
import { collectAirports, indexById, parseFlights } from "./flights";
import { boundsCenter, boundsCorners, padForZoomOffset, parseBounds, travelHeading, type AreaBounds } from "./geo";
import { ensureHaMap, whenEngineReady, type HaMapElement } from "./ha-map";
import { renderDetail, renderEmptyDetail } from "./detail";
import { MapLayer } from "./map-layer";
import type { AircraftIconStyle } from "./markers";
import { cardStyles } from "./styles";
import type { Flight, HassEntity, HomeAssistant } from "./types";

/**
 * Read the version from this module's own URL rather than baking it in.
 *
 * HACS registers the resource as `.../flight-map-card.js?v=<version>`, so the
 * running build is already in the URL the browser fetched. A baked-in constant
 * couples the bundle to the version: a release bumps the constant in a source
 * file the bundle is built from, leaves the committed bundle stale, and fails
 * the build-diff check in CI. That is not hypothetical -- it broke
 * ha-teslamate-cards' 0.2.0 release.
 */
const VERSION = new URL(import.meta.url).searchParams.get("v") ?? "dev";

const DOCS = "https://github.com/johnbr/ha-flightradar-tracker";

/**
 * Padding around the fitted area, as a fraction of its own extent.
 *
 * `ha-map`'s own default is 0.5, which would leave a 50 km box filling barely
 * half the frame. The bounds are already the watched circle's bounding square,
 * so they need only enough slack to keep the edge markers off the border.
 */
const FIT_PAD = 0.05;

/**
 * Bounds on the glide between two fixes -- `motion: glide` only.
 *
 * The tween runs for however long the last gap between ticks was, so the
 * aircraft arrives just as the next fix lands and the motion reads as
 * continuous. The clamp covers the first tick after a load (whose "gap" is
 * really time since mount) and a coordinator that has stalled.
 *
 * THE CEILING HAS TO CLEAR THE REAL TICK GAP, or the glide finishes early and
 * every aircraft sits frozen for the remainder -- motion, then a dead pause,
 * then motion again. That is not hypothetical: the ceiling was 30 s, and the
 * integration's actual cycle is its scan_interval PLUS however long a refresh
 * takes, which was measured here at 44-90 s because it fetches per-flight
 * details serially.
 *
 * Raising the ceiling was not enough, which is why this is no longer the
 * default. Sizing the tween from the LAST gap is a bet that the next one is no
 * longer, and on this feed the period grows with the traffic, so the bet loses
 * on the way up: measured, 12 % of wall time frozen over ten minutes and 18 %
 * over its busy half. Erring long instead only trades the stall for lag, one
 * tick of it per multiple. See motion.ts for the measurements and for what
 * `motion: predicted` does instead.
 */
const GLIDE_MIN_MS = 1000;
const GLIDE_MAX_MS = 120_000;

/** mdi:crosshairs-gps */
const RECENTRE_PATH =
  "M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 " +
  "11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83," +
  "20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z";

/**
 * How long after a zoom starts to leave the markers alone -- Leaflet engine
 * only.
 *
 * Leaflet animates a zoom by scaling the marker pane and re-placing every
 * marker as it settles; a `setLatLng` landing mid-animation is positioned for
 * the zoom it is leaving and jumps. `zoomend` clears the guard, and this is only
 * the backstop for a zoom that somehow never ends -- expiring on its own means
 * a missed event costs a moment of stillness, not a permanently frozen map.
 * MapLibre re-places markers from their stored position on every frame, so it
 * needs no guard.
 */
const ZOOM_GUARD_MS = 2000;

/** How often to check that `ha-map` has not swapped its engine under us. */
const ENGINE_WATCH_MS = 2000;

/**
 * Minimum movement between two fixes before the segment is trusted to say
 * which way an aircraft points.
 *
 * 150 m is far below anything real -- the slowest thing here, a Cessna in the
 * circuit at 65 kt, covers ~2 km between ticks -- and far above position
 * noise, so it only rejects aircraft that are parked or taxiing, where a
 * bearing derived from jitter would spin the icon at random.
 */
const TRAVEL_MIN_KM = 0.15;

interface CustomCard {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards?: CustomCard[];
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: "Flight Map Card",
    description: "Interactive map of the aircraft overhead; tap one for its full detail.",
    preview: false,
    documentationURL: DOCS,
  });
  // eslint-disable-next-line no-console
  console.info(
    `%c FLIGHT-MAP-CARD %c ${VERSION} `,
    "color:#fff;background:#1f2933;font-weight:700",
    "color:#1f2933;background:#4fc3f7;font-weight:700"
  );
}

export class FlightMapCard extends LitElement {
  static styles = cardStyles;

  /**
   * A fingerprint of just this card's entity. `set hass` fires on every state
   * change of every entity -- many times a second on a busy instance -- and
   * re-rendering on all of them is what made the air-quality card collapse its
   * own height and destroy the browser's scroll anchor. Here it would also tear
   * the map down. Only a change to this string triggers an update.
   */
  private _signature = "";

  @state() private _config?: ResolvedConfig;
  /** null while the lazy `ha-map` chunk is still being fetched. */
  @state() private _mapAvailable: boolean | null = null;
  /** The flight id whose detail is on screen, if any. */
  @state() private _selectedId?: string;

  /** Deliberately NOT reactive: assigning it must not schedule a render. */
  private _hass?: HomeAssistant;

  /**
   * Everything drawn on the map, bound to ONE engine instance. `ha-map`
   * destroys its engine on disconnect and swaps it on a WebGL loss, so the
   * engine -- not the element -- says whether this is still alive.
   */
  private _layer?: MapLayer;
  /** What the last tick showed, for travel headings and the selection pan. */
  private _drawn = new Map<string, Flight>();
  /** Memo of the parsed attribute, keyed on the entity fingerprint. */
  private _parsedFor = "";
  private _parsed: Flight[] = [];
  /** The engine the area was fitted on -- fitted once per engine, never per tick. */
  private _fittedEngine?: unknown;
  private _syncing = false;
  /** A tick that arrived mid-sync, so it is not silently dropped. */
  private _resync = false;
  private _engineWatch?: number;

  /** When the last tick was seen, and how long the gap before it was. */
  private _lastTickAt = 0;
  private _glideMs = GLIDE_MIN_MS;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    const signature = this._computeSignature();
    if (signature === this._signature) return;
    this._signature = signature;

    // Time the gap between ticks rather than reading the integration's
    // scan_interval, which the card cannot see and which the user can change
    // from under it.
    const now = Date.now();
    if (this._lastTickAt) {
      this._glideMs = Math.min(Math.max(now - this._lastTickAt, GLIDE_MIN_MS), GLIDE_MAX_MS);
      // The same measurement sizes how long a prediction correction is spread
      // over: one feed period, so it is absorbed before the next fix lands.
      this._layer?.setGapMs(this._glideMs);
    }
    this._lastTickAt = now;

    this.requestUpdate();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  setConfig(config: unknown): void {
    this._config = resolveConfig(parseConfig(config));
    this._signature = this._computeSignature();
    // Options like icon_size or show_tracks change how everything is drawn, and
    // the per-tick diff would report no change at all -- so the layers are
    // emptied and rebuilt from scratch. Config edits are rare; this is not a
    // hot path.
    this._resetDrawing();
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor");
    return document.createElement(EDITOR_TYPE);
  }

  /**
   * The config the card picker starts you with.
   *
   * Only the four area sensors carry `attributes.flights[]`; the `airport_*`
   * ones would render an empty card, so they are never offered.
   */
  static getStubConfig(_hass: HomeAssistant, entities: string[]): Record<string, unknown> {
    const areas = ["current_in_area", "entered_area", "exited_area", "additional_tracked"];
    const candidate =
      entities.find((id) => id.startsWith("sensor.") && areas.some((suffix) => id.endsWith(suffix))) ??
      entities.find((id) => id.startsWith("sensor.") && id.includes("flightradar"));
    return { type: `custom:${CARD_TYPE}`, entity: candidate ?? "" };
  }

  getCardSize(): number {
    return 8;
  }

  /** Sections view: a map wants width, and its height is its own business. */
  getGridOptions(): Record<string, unknown> {
    return { columns: 12, min_columns: 6, rows: "auto", min_rows: 6 };
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this._mapAvailable === null) {
      void ensureHaMap().then((ok) => {
        this._mapAvailable = ok;
      });
    }
    // A WebGL context loss makes ha-map swap MapLibre for Leaflet in place,
    // taking every marker with it while the card stays connected and nothing
    // re-renders. Without this the aircraft would be gone until the next tick.
    this._engineWatch = window.setInterval(() => {
      const engine = this._mapEl()?._engine;
      if (this._layer && engine && engine !== this._layer.engine) void this._syncMap();
    }, ENGINE_WATCH_MS);
    // Re-attaching gets a brand new engine; _syncMap notices and rebuilds on it.
    void this._syncMap();
  }

  disconnectedCallback(): void {
    window.clearInterval(this._engineWatch);
    this._engineWatch = undefined;
    // The markers die with the engine `ha-map` tears down, so this only drops
    // our references -- keeping them would leave _syncMap believing it is set up.
    this._layer?.abandon();
    this._layer = undefined;
    this._drawn.clear();
    this._fittedEngine = undefined;
    super.disconnectedCallback();
  }

  protected updated(_changed: PropertyValues): void {
    void this._syncMap();
  }

  /** Remove everything drawn and forget it, so the next sync rebuilds. */
  private _resetDrawing(): void {
    this._layer?.destroy();
    this._layer = undefined;
    this._drawn.clear();
  }

  private _computeSignature(): string {
    const entity = this._config?.entity;
    if (!entity) return "";
    // The FR24 coordinator ticks once every 60 s, so state + last_updated is a
    // complete fingerprint of the flights array without walking it.
    const st = this._hass?.states?.[entity];
    return st ? `${entity}|${st.state}|${st.last_updated}` : `${entity}|missing`;
  }

  private _entity(): HassEntity | undefined {
    const entity = this._config?.entity;
    return entity ? this._hass?.states?.[entity] : undefined;
  }

  /**
   * The parsed flights for the current tick.
   *
   * Memoised on the fingerprint because both the header and the marker sync
   * want it, and re-parsing per render would undo the point of the guard.
   */
  private _flights(): Flight[] {
    if (this._parsedFor !== this._signature) {
      this._parsedFor = this._signature;
      this._parsed = parseFlights(this._entity()?.attributes?.flights);
    }
    return this._parsed;
  }

  private _bounds(): AreaBounds | null {
    return parseBounds(this._entity()?.attributes?.bounds);
  }

  private _title(st: HassEntity | undefined): string {
    if (this._config?.title !== undefined) return this._config.title;
    const name = st?.attributes?.friendly_name;
    return typeof name === "string" ? name : "Flights overhead";
  }

  private _mapEl(): HaMapElement | null {
    return this.renderRoot?.querySelector<HaMapElement>("ha-map") ?? null;
  }

  /**
   * A theme colour as a concrete value.
   *
   * Neither engine can draw a `var()`: MapLibre's paint properties are parsed
   * as colours by the GL style, and Leaflet writes its options into SVG
   * presentation attributes -- passing the variable name through would silently
   * draw nothing. Resolving it here also means the map follows a theme switch
   * on the next redraw rather than freezing at build time.
   */
  private _themeColor(name: string, fallback: string): string {
    const value = getComputedStyle(this).getPropertyValue(name).trim();
    return value || fallback;
  }

  /**
   * Bring our layer up on whichever engine is current, then fit the watched
   * area once per engine.
   *
   * Runs after every render, so it must be cheap once settled: past the first
   * pass it is one identity comparison and a diff.
   */
  private async _syncMap(): Promise<void> {
    if (this._mapAvailable !== true) return;
    if (this._syncing) {
      // A data tick landed while the map was still coming up. Remember it:
      // dropping it would leave the aircraft stale until the next one, 60 s
      // later.
      this._resync = true;
      return;
    }
    const el = this._mapEl();
    if (!el) return;

    this._syncing = true;
    try {
      const engine = await whenEngineReady(el);
      if (!engine) {
        // A map that came up with no engine is a pre-2026.10 ha-map, which has
        // none of the drawing API. Say so: the alternative is a basemap with
        // no aircraft on it and nothing saying why.
        if (el._loaded) console.error("flight-map-card: this Home Assistant's map has no engine API; the card needs 2026.10 or later");
        return;
      }

      if (this._layer?.engine !== engine) {
        // The old engine, if any, is already destroyed and its markers with
        // it: forget them rather than remove them.
        this._layer?.abandon();
        const layer = new MapLayer(engine, () => el.getView(), (id) => this._select(id));
        layer.setGapMs(this._glideMs);
        if (layer.kind === "leaflet") {
          // See ZOOM_GUARD_MS. `viewreset` is the other way Leaflet re-places
          // every marker at once: a pan too big to animate -- like selecting an
          // aircraft on the far edge -- falls back to a full reset.
          engine.leafletMap?.on("zoomstart", () => layer.pause(ZOOM_GUARD_MS));
          engine.leafletMap?.on("viewreset", () => layer.pause(ZOOM_GUARD_MS));
          engine.leafletMap?.on("zoomend", () => layer.resume());
        }
        this._layer = layer;
        // The old markers went down with the old engine, so the next diff has
        // to start from empty or every aircraft would be treated as unchanged.
        this._drawn.clear();
      }

      this._drawAreaCentre();
      this._syncFlights();

      if (this._fittedEngine !== engine) {
        this._fittedEngine = engine;
        // `ha-map` fits itself when its own `_loaded` flips, and that branch is
        // not gated on `autoFit` -- with no entities it centres on the home
        // coordinates at zoom 14. Awaiting its update cycle lets that happen
        // first, so this fit is the last word.
        await el.updateComplete;
        this._fitToArea(el);
      }
    } finally {
      this._syncing = false;
      if (this._resync) {
        this._resync = false;
        void this._syncMap();
      }
    }
  }

  /** Hand one tick to the layer. The diffing and patching happen there. */
  private _syncFlights(): void {
    const layer = this._layer;
    if (!layer) return;

    const flights = this._flights();
    const mode = this._motionMode();
    // Point each aircraft the way it is actually travelling, BEFORE diffing:
    // markerKey reads `heading_display`, so computing it afterwards would leave
    // the icon a tick behind the position it belongs to.
    for (const flight of flights) {
      flight.heading_display = this._displayHeading(flight, mode);
    }
    this._syncAirports(flights);
    layer.setMode(mode);
    layer.sync(flights, this._iconStyle(), this._config?.show_tracks ?? DEFAULTS.show_tracks, this._glideMs);

    // The selected aircraft left the area. Its detail is now history, and
    // leaving it on screen would read as live.
    if (this._selectedId && !flights.some((f) => f.id === this._selectedId)) this._selectedId = undefined;
    this._drawn = indexById(flights);
  }

  /**
   * Whether the BASEMAP is light, which is not always what the dashboard is.
   *
   * null means `theme_mode: auto`, where the map follows the dashboard and the
   * theme variables are already the right answer.
   */
  private _mapIsLight(): boolean | null {
    const mode = this._config?.theme_mode ?? DEFAULTS.theme_mode;
    return mode === "auto" ? null : mode === "light";
  }

  private _iconStyle(): AircraftIconStyle {
    // The theme variables track the DASHBOARD. That was the right source while
    // the map always followed it, but `theme_mode` can now pin the basemap
    // against the dashboard -- and a dark dashboard resolves
    // --primary-text-color to near-white, which on a pinned-light map is a
    // white aircraft on white tiles, saved only by its halo. So when the map
    // theme is pinned, the silhouette is pinned to match the MAP.
    const light = this._mapIsLight();
    return {
      size: this._config?.icon_size ?? DEFAULTS.icon_size,
      color:
        light === null ? this._themeColor("--primary-text-color", "#212121") : light ? "#212121" : "#f5f5f5",
      outline:
        light === null ? this._themeColor("--card-background-color", "#ffffff") : light ? "#ffffff" : "#1c1c1c",
      groundColor: this._themeColor("--disabled-text-color", "#8f8f8f"),
      selectedColor: this._themeColor("--primary-color", "#03a9f4"),
    };
  }

  /** Draw the airports the flights are using, or none. */
  private _syncAirports(flights: Flight[]): void {
    const layer = this._layer;
    if (!layer) return;
    const show = this._config?.show_airports ?? DEFAULTS.show_airports;
    const light = this._mapIsLight();
    const style = {
      color: light === null ? this._themeColor("--secondary-text-color", "#5c5c5c") : light ? "#5c5c5c" : "#c9c9c9",
      outline:
        light === null ? this._themeColor("--card-background-color", "#ffffff") : light ? "#ffffff" : "#1c1c1c",
      labelColor:
        light === null ? this._themeColor("--secondary-text-color", "#5c5c5c") : light ? "#3c3c3c" : "#e0e0e0",
    };
    layer.syncAirports(show ? collectAirports(flights, this._bounds()) : [], style);
  }

  /**
   * Select an aircraft, or deselect it if it is already the selected one:
   * repaint the markers involved, raise its trail, and ease the map to it.
   *
   * TAPPING THE SELECTED AIRCRAFT AGAIN CLEARS THE SELECTION, and without that
   * there is no way back to the empty panel at all -- the only other thing that
   * clears it is the aircraft leaving the watched area, which can be twenty
   * minutes of reading stale-looking detail for something no longer of
   * interest.
   *
   * Deselecting deliberately does NOT pan. The pan exists to bring a newly
   * chosen aircraft into view; moving the map as a parting gesture would take
   * the reader somewhere they did not ask to go.
   *
   * `panTo` and not a fit: the zoom the reader chose is theirs, and changing it
   * under a tap is the same offence as re-fitting on a data tick.
   */
  private _select(id: string): void {
    const previous = this._selectedId;
    this._selectedId = previous === id ? undefined : id;
    // Repaints both ends in one pass, and copes with either being absent -- so
    // this covers select, switch and deselect without branching three ways.
    this._layer?.select(this._selectedId);
    if (this._selectedId === undefined) return;

    // The MARKER's position, not the fix's: under predicted motion the aircraft
    // is drawn ahead of its last fix, and panning to the fix would leave the
    // thing that was just tapped off centre by however far it has flown.
    const flight = this._drawn.get(id);
    const centre = this._layer?.positionOf(id) ?? (flight ? ([flight.latitude, flight.longitude] as [number, number]) : undefined);
    if (centre) this._mapEl()?.panTo(centre);
  }

  /**
   * How the aircraft move, with the accessibility override applied.
   *
   * `prefers-reduced-motion` wins over the config outright: someone who has
   * asked their operating system for less motion is not asking this card's
   * opinion, and jumping to each fix is the honest rendering anyway.
   */
  private _motionMode(): MotionMode {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "none";
    return this._config?.motion ?? DEFAULTS.motion;
  }

  /**
   * Which way to point the marker.
   *
   * It has to point the way the marker is being MOVED, or it reads as an
   * aircraft flying sideways -- and the two modes move it differently.
   * Interpolating slides it along the segment between two fixes, so that
   * segment's bearing is the right answer (see travelHeading). Predicting
   * carries it along the REPORTED heading, so that is what the icon must use:
   * pointing a turning aircraft down the bearing of the leg it has just flown
   * would aim it at where it has been while it flies where it is going.
   */
  private _displayHeading(flight: Flight, mode: MotionMode): number | null {
    if (mode === "predicted") return flight.heading;
    const before = this._drawn.get(flight.id);
    if (!before) return flight.heading;
    return travelHeading(
      [before.latitude, before.longitude],
      [flight.latitude, flight.longitude],
      flight.heading,
      TRAVEL_MIN_KM
    );
  }

  /** A small marker at the centre of the watched area, or none. */
  private _drawAreaCentre(): void {
    const bounds = this._bounds();
    const show = !!bounds && !!this._config?.show_area_center;
    this._layer?.setCentre(
      show ? boundsCenter(bounds) : null,
      this._themeColor("--primary-color", "#03a9f4"),
      this._themeColor("--card-background-color", "#ffffff")
    );
  }

  /**
   * Fit the frame to the watched area -- once on load, and again only when the
   * user asks via the recentre control.
   *
   * Never on a data tick: `ha-map` records a user pan or pinch by setting its
   * own `_pauseAutoFit`, and re-fitting behind that is the single worst thing
   * this card could do to someone reading the map.
   */
  private _fitToArea(el: HaMapElement): void {
    const bounds = this._bounds();
    // No bounds: leave ha-map on its own home-centred view rather than fitting
    // to something invented.
    if (!bounds) return;
    // A positive offset tightens the fit by whole zoom levels; see
    // padForZoomOffset for why this is padding rather than a zoom assignment.
    const offset = this._config?.zoom_offset ?? DEFAULTS.zoom_offset;
    el.fitBounds(boundsCorners(bounds), { pad: padForZoomOffset(FIT_PAD, offset) });
    // A configured zoom overrides the fit, but only its scale: the fit above
    // has already centred on the watched area, and ha-map zooms about the
    // current centre.
    const zoom = this._config?.zoom;
    if (zoom !== undefined) el.zoom = zoom;
  }

  private _onRecentre = (): void => {
    const el = this._mapEl();
    if (el) this._fitToArea(el);
  };

  private _renderMap(): TemplateResult {
    // A custom property rather than a height, so the narrow-screen cap in the
    // stylesheet can read it -- an inline height would beat any media query.
    const frame = `--fmc-map-height:${this._config?.map_height ?? DEFAULTS.map_height}px`;
    if (this._mapAvailable === null) {
      return html`<div class="placeholder" style=${frame}>Loading map…</div>`;
    }
    if (!this._mapAvailable) {
      return html`<div class="placeholder error" style=${frame}>
        Map unavailable — Home Assistant's map component did not load.
      </div>`;
    }
    return html`
      <div class="map-wrap" style=${frame}>
        <ha-map .autoFit=${false} .themeMode=${this._config?.theme_mode ?? DEFAULTS.theme_mode}></ha-map>
        <button class="recentre" title="Recentre on the watched area" @click=${this._onRecentre}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${RECENTRE_PATH}></path></svg>
        </button>
      </div>
    `;
  }

  private _renderDetail(): TemplateResult {
    const id = this._selectedId;
    const flight = id ? this._flights().find((f) => f.id === id) : undefined;
    // Reading the flight out of the CURRENT tick, not out of `_drawn`: the
    // panel must show live telemetry, not whatever it said when it was tapped.
    return flight && this._config
      ? renderDetail(flight, this._config, this._hour12())
      : renderEmptyDetail();
  }

  /**
   * Whether to print clock times as 12-hour.
   *
   * Follows the viewer's Home Assistant setting where they have made one.
   * `language` and `system` are left to the browser, which is what those two
   * settings mean; anything unreadable falls back to 12-hour, this being a US
   * install and the rest of these dashboards being 12-hour.
   */
  private _hour12(): boolean {
    const preference = this._hass?.locale?.time_format;
    if (preference === "24") return false;
    if (preference === "12") return true;
    try {
      return Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hour12 ?? true;
    } catch {
      return true;
    }
  }

  render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config) return nothing;

    const st = this._entity();
    // The count of what is actually on the map, not the sensor's own state:
    // this card is the map, and a row with no usable position is not drawn.
    const count = this._flights().length;

    return html`
      <ha-card>
        <div class="header">
          <div class="title">${this._title(st)}</div>
          ${st ? html`<div class="count">${count} aircraft</div>` : nothing}
        </div>
        ${st
          ? html`${this._renderMap()}${this._renderDetail()}`
          : html`<div class="body error">Entity <code>${config.entity}</code> not found.</div>`}
      </ha-card>
    `;
  }
}

if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, FlightMapCard);
}
