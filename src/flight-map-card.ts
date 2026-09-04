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
import {
  aircraftKind,
  collectAirports,
  diffFlights,
  flightLabel,
  indexById,
  isOnGround,
  parseFlights,
} from "./flights";
import {
  boundsCenter,
  boundsCorners,
  padForZoomOffset,
  parseBounds,
  projectKm,
  travelHeading,
  type AreaBounds,
} from "./geo";
import {
  ensureHaMap,
  whenMapReady,
  type HaMapElement,
  type LeafletLayerGroup,
  type LeafletLike,
  type LeafletMap,
  type LeafletMarker,
  type LeafletPathLayer,
  type LeafletPolyline,
} from "./ha-map";
import { renderDetail, renderEmptyDetail } from "./detail";
import { MotionTracker, type MotionFix } from "./motion";
import { aircraftIcon, airportIcon, type AircraftIconStyle, type AircraftShape } from "./markers";
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
 * Track line weight and opacity. Deliberately faint: eleven 50-point trails is
 * the normal case here, and they are context for the aircraft, not the subject.
 */
const TRACK_WEIGHT = 2;
const TRACK_OPACITY = 0.45;
/** The selected aircraft's own trail, raised above the rest. */
const SELECTED_TRACK_WEIGHT = 3;
const SELECTED_TRACK_OPACITY = 0.9;

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

/**
 * How often a predicted aircraft is re-aimed.
 *
 * Deliberately a whole second rather than an animation frame. Each step arms a
 * CSS transition of exactly one step and aims at where the aircraft WILL be one
 * step from now, so the browser does the in-between drawing on the compositor
 * at display rate -- the JS only has to hand it a new target once a second. A
 * requestAnimationFrame loop would write sixty times as many styles per marker
 * to produce the same picture, on a dashboard that already logs websocket
 * backpressure.
 *
 * It also means a late step degrades into a slightly longer straight segment
 * rather than into a stall.
 */
const MOTION_STEP_MS = 1000;

/** mdi:crosshairs-gps */
const RECENTRE_PATH =
  "M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 " +
  "11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83," +
  "20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z";

/** markers.ts stays runtime-import-free, so the card adapts the flight for it. */
function shapeOf(flight: Flight, selected: boolean): AircraftShape {
  return {
    // The way the marker is being MOVED, which is not always the reported
    // heading -- see `_displayHeading`. Falls back to the reported heading, so
    // this is never worse than the raw value.
    heading: flight.heading_display ?? flight.heading,
    kind: aircraftKind(flight),
    grounded: isOnGround(flight),
    selected,
  };
}

/** motion.ts stays runtime-import-free, so the card adapts the flight for it. */
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

/**
 * How long after a zoom starts to leave the markers alone.
 *
 * Leaflet rewrites every marker transform as a zoom settles; a motion step
 * landing in that window would race it. `zoomend` clears the guard, and this is
 * only the backstop for a zoom that somehow never ends -- expiring on its own
 * means a missed event costs a second of stillness, not a permanently frozen
 * map.
 */
const ZOOM_GUARD_MS = 2000;

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
   * the Leaflet map down. Only a change to this string triggers an update.
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
   * The Leaflet instance our layers are attached to. `ha-map` destroys and
   * rebuilds its map across a disconnect, so this -- not the element -- is what
   * says whether our layers are still alive.
   */
  private _mapInstance?: LeafletMap;
  /**
   * Area furniture -- the centre marker. Its own group, added first, so that
   * the track and aircraft groups the later milestones add land above it: add
   * order is draw order within Leaflet's overlay pane.
   */
  private _baseLayer?: LeafletLayerGroup;
  /** Aircraft tracks, between the area furniture and the markers. */
  private _trackLayer?: LeafletLayerGroup;
  /** Aircraft markers, on top. */
  private _markerLayer?: LeafletLayerGroup;
  private _airportLayer?: LeafletLayerGroup;
  /** Which airports are drawn, so the layer is only rebuilt when the set moves. */
  private _airportKey = "";
  private _centreMarker?: LeafletPathLayer;
  /** One marker per flight id -- the identity that survives a tick. */
  private _markers = new Map<string, LeafletMarker>();
  /** One polyline per flight id, for aircraft with a track worth drawing. */
  private _tracks = new Map<string, LeafletPolyline>();
  /** What the markers currently show, so the next tick can be diffed. */
  private _drawn = new Map<string, Flight>();
  /** Memo of the parsed attribute, keyed on the entity fingerprint. */
  private _parsedFor = "";
  private _parsed: Flight[] = [];
  /** The area is fitted exactly once per map instance -- never on a data tick. */
  private _fitted = false;
  private _syncing = false;
  /** A tick that arrived mid-sync, so it is not silently dropped. */
  private _resync = false;

  /** When the last tick was seen, and how long the gap before it was. */
  private _lastTickAt = 0;
  private _glideMs = GLIDE_MIN_MS;
  /** Marker elements currently mid-glide, so the transition can be removed. */
  private _gliding: HTMLElement[] = [];
  private _glideTimer?: number;

  /** Predicted motion: one fix per aircraft, and the step timer that flies them. */
  private readonly _motion = new MotionTracker();
  private _motionTimer?: number;
  /**
   * Leaflet rewrites every marker transform when a zoom settles, so a step
   * landing mid-zoom would race it. Steps are simply skipped while zooming --
   * the next one is at most a second away.
   */
  private _zoomingUntil = 0;
  /** When the last motion step ran, so a late one can redraw instead of slide. */
  private _lastStepAt = 0;

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
      this._motion.setGapMs(this._glideMs);
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
    // Re-attaching gets a brand new Leaflet instance; _syncMap notices and
    // rebuilds the layers on it.
    void this._syncMap();
  }

  disconnectedCallback(): void {
    this._endGlide();
    this._stopMotion();
    this._motion.clear();
    // The layers die with the map `ha-map` tears down, so this only drops our
    // references -- keeping them would leave _syncMap believing it is set up.
    this._mapInstance = undefined;
    this._baseLayer = undefined;
    this._trackLayer = undefined;
    this._markerLayer = undefined;
    this._airportLayer = undefined;
    this._airportKey = "";
    this._centreMarker = undefined;
    this._markers.clear();
    this._tracks.clear();
    this._drawn.clear();
    this._fitted = false;
    super.disconnectedCallback();
  }

  protected updated(_changed: PropertyValues): void {
    void this._syncMap();
  }

  /** Empty every layer and forget what was drawn, so the next sync rebuilds. */
  private _resetDrawing(): void {
    this._endGlide();
    this._stopMotion();
    this._motion.clear();
    this._baseLayer?.clearLayers();
    this._trackLayer?.clearLayers();
    this._markerLayer?.clearLayers();
    this._airportLayer?.clearLayers();
    this._airportKey = "";
    this._centreMarker = undefined;
    this._markers.clear();
    this._tracks.clear();
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
   * Leaflet writes its options into SVG *presentation attributes*, which do not
   * accept `var()` -- passing the variable name through would silently draw
   * nothing. Resolving it here also means the marker follows a theme switch on
   * the next redraw rather than freezing at build time.
   */
  private _themeColor(name: string, fallback: string): string {
    const value = getComputedStyle(this).getPropertyValue(name).trim();
    return value || fallback;
  }

  /**
   * Bring our own layers up on whichever Leaflet instance is current, then fit
   * the watched area once.
   *
   * Runs after every render, so it must be cheap once settled: past the first
   * pass it does one identity comparison and one `setLatLng`.
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
      const leaflet = await whenMapReady(el);
      const map = el.leafletMap;
      if (!leaflet || !map) return;

      if (map !== this._mapInstance) {
        // Add order is draw order in Leaflet's overlay pane: area furniture at
        // the bottom, aircraft above it.
        this._mapInstance = map;
        // Leaflet re-applies every marker's translate3d when a zoom settles.
        // With a glide still armed, all of them would slide across the screen
        // into their new pixel positions -- so the transitions come off first.
        map.on("zoomstart", () => this._suspendForZoom());
        map.on("zoomend", () => {
          this._zoomingUntil = 0;
        });
        this._baseLayer = leaflet.layerGroup().addTo(map);
        // Added before the tracks and the aircraft, so airports sit underneath
        // both: they are the fixed reference, never the subject.
        this._airportLayer = leaflet.layerGroup().addTo(map);
        this._trackLayer = leaflet.layerGroup().addTo(map);
        this._markerLayer = leaflet.layerGroup().addTo(map);
        this._centreMarker = undefined;
        // The old layers went down with the old map, so the next diff has to
        // start from empty or every aircraft would be treated as unchanged and
        // never re-added.
        this._markers.clear();
        this._tracks.clear();
        this._drawn.clear();
        this._motion.clear();
        this._fitted = false;
      }

      this._drawAreaCentre(leaflet);
      this._syncFlights(leaflet);
      // Started here rather than on connect: it needs the markers, and the
      // mode can change under it when the config is edited.
      if (this._motionMode() === "predicted") this._startMotion();
      else this._stopMotion();

      if (!this._fitted) {
        this._fitted = true;
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

  /**
   * Patch the aircraft markers in place: add what arrived, move what moved,
   * restyle what turned, remove what left.
   *
   * Never rebuilt wholesale. Clearing the layer each tick is the obvious
   * implementation and it destroys marker identity -- the field blinks, and
   * from M4 the selected aircraft loses its highlight every 60 seconds.
   */
  private _syncFlights(leaflet: LeafletLike): void {
    const markerLayer = this._markerLayer;
    const trackLayer = this._trackLayer;
    if (!markerLayer || !trackLayer) return;

    const flights = this._flights();
    const mode = this._motionMode();
    // Point each aircraft the way it is actually travelling, BEFORE diffing:
    // markerKey reads `heading_display`, so computing it afterwards would leave
    // the icon a tick behind the position it belongs to.
    for (const flight of flights) {
      flight.heading_display = this._displayHeading(flight, mode);
    }
    this._syncAirports(leaflet, flights);

    const diff = diffFlights(this._drawn, flights);
    if (!diff.added.length && !diff.changed.length && !diff.removed.length) return;

    const style = this._iconStyle();
    // One clock reading for the whole batch, so every fix in this tick is
    // projected from the same instant.
    const at = Date.now();

    for (const id of diff.removed) {
      const marker = this._markers.get(id);
      if (marker) {
        markerLayer.removeLayer(marker);
        this._markers.delete(id);
      }
      this._motion.forget(id);
      const track = this._tracks.get(id);
      if (track) {
        trackLayer.removeLayer(track);
        this._tracks.delete(id);
      }
      // The selected aircraft left the area. Its detail is now history, and
      // leaving it on screen would read as live.
      if (this._selectedId === id) this._selectedId = undefined;
    }

    for (const flight of diff.added) {
      const id = flight.id;
      const marker = leaflet.marker([flight.latitude, flight.longitude], {
        icon: aircraftIcon(leaflet, shapeOf(flight, id === this._selectedId), style),
        // Native tooltip: the callsign without a tap, and it costs no DOM.
        title: flightLabel(flight),
        keyboard: false,
      });
      // Only the id is closed over: the flight object is replaced every tick.
      marker.on("click", () => this._select(id));
      marker.addTo(markerLayer);
      this._markers.set(id, marker);
      if (mode === "predicted") this._motion.update(id, fixOf(flight, at));
      this._drawTrack(leaflet, flight, style);
    }

    for (const { flight, moved, restyled, retracked } of diff.changed) {
      const marker = this._markers.get(flight.id);
      if (marker) {
        // Restyle FIRST: setIcon replaces the icon's element, which would throw
        // away a transition armed on the old one and land the aircraft at its
        // new fix instantly, mid-glide.
        if (restyled)
          marker.setIcon(aircraftIcon(leaflet, shapeOf(flight, flight.id === this._selectedId), style));
        // A tick that did not MOVE the aircraft is not a new fix: taking it on
        // as one would reset the extrapolation clock and snap a predicted
        // marker back to a position it had already flown past.
        if (moved) {
          if (mode === "predicted") {
            // Where the marker is aimed right now, so the tracker can fade the
            // correction out from THERE rather than from a recomputed guess.
            const drawnAt = marker.getLatLng();
            this._motion.update(flight.id, fixOf(flight, at), drawnAt.lat, drawnAt.lng);
          } else {
            if (mode === "glide") this._glide(marker);
            marker.setLatLng([flight.latitude, flight.longitude]);
          }
        }
      }
      if (retracked) this._drawTrack(leaflet, flight, style);
    }

    if (this._gliding.length) {
      // One timer for the whole batch: they all started together.
      window.clearTimeout(this._glideTimer);
      this._glideTimer = window.setTimeout(() => this._endGlide(), this._glideMs + 200);
    }

    this._drawn = indexById(flights);
  }

  /**
   * Draw or re-point one aircraft's trail.
   *
   * `coordinates` is the only source of a track: `flights` is an unrecorded
   * attribute upstream, so the recorder holds no history to build one from.
   *
   * An existing line is re-pointed rather than replaced -- Leaflet updates the
   * SVG path in place, where removing and re-adding would make the whole field
   * of trails flicker once a minute.
   */
  private _drawTrack(leaflet: LeafletLike, flight: Flight, style: AircraftIconStyle): void {
    const layer = this._trackLayer;
    if (!layer) return;
    const points = flight.coordinates;
    const existing = this._tracks.get(flight.id);

    // One point is a dot, not a trail, and reads as a rendering fault.
    if (points.length < 2 || !this._config?.show_tracks) {
      if (existing) {
        layer.removeLayer(existing);
        this._tracks.delete(flight.id);
      }
      return;
    }

    if (existing) {
      existing.setLatLngs(points);
      return;
    }

    const selected = flight.id === this._selectedId;
    const line = leaflet.polyline(points, {
      // A track created while its aircraft is already selected has to be born
      // selected: _paintSelection only runs when the selection itself changes.
      ...(selected
        ? this._selectedTrackStyle(style)
        : { color: style.color, weight: TRACK_WEIGHT, opacity: TRACK_OPACITY }),
      lineJoin: "round",
      lineCap: "round",
      // The trail is context, not a control: a non-interactive line cannot
      // swallow a tap meant for an aircraft, or a drag meant to pan the map.
      interactive: false,
    });
    line.addTo(layer);
    this._tracks.set(flight.id, line);
    if (selected) line.bringToFront();
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

  /**
   * Redraw the airport layer, but only when the SET of airports changes.
   *
   * Airports do not move, so there is nothing to glide and nothing to patch --
   * the whole layer is cheap to rebuild and only does so when a field enters or
   * leaves the flights' origin/destination set, which at a busy GA field is
   * almost never.
   */
  private _syncAirports(leaflet: LeafletLike, flights: Flight[]): void {
    const layer = this._airportLayer;
    if (!layer) return;
    if (!(this._config?.show_airports ?? DEFAULTS.show_airports)) {
      if (this._airportKey !== "") {
        layer.clearLayers();
        this._airportKey = "";
      }
      return;
    }

    const airports = collectAirports(flights, this._bounds());
    const key = airports.map((a) => a.code).join(",");
    if (key === this._airportKey) return;
    this._airportKey = key;

    layer.clearLayers();
    const light = this._mapIsLight();
    const style = {
      color: light === null ? this._themeColor("--secondary-text-color", "#5c5c5c") : light ? "#5c5c5c" : "#c9c9c9",
      outline:
        light === null ? this._themeColor("--card-background-color", "#ffffff") : light ? "#ffffff" : "#1c1c1c",
      labelColor:
        light === null ? this._themeColor("--secondary-text-color", "#5c5c5c") : light ? "#3c3c3c" : "#e0e0e0",
    };
    for (const airport of airports) {
      leaflet
        .marker([airport.latitude, airport.longitude], {
          icon: airportIcon(leaflet, airport.code, style),
          // Never steals a tap from an aircraft, and never takes the selection.
          interactive: false,
          keyboard: false,
          title: airport.name ?? airport.code,
        })
        .addTo(layer);
    }
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
    this._paintSelection(previous);
    if (this._selectedId === undefined) return;

    // The MARKER's position, not the fix's: under predicted motion the aircraft
    // is drawn ahead of its last fix, and panning to the fix would leave the
    // thing that was just tapped off centre by however far it has flown.
    const marker = this._markers.get(id);
    const at = marker?.getLatLng();
    const flight = this._drawn.get(id);
    const centre: [number, number] | undefined = at
      ? [at.lat, at.lng]
      : flight
        ? [flight.latitude, flight.longitude]
        : undefined;
    if (centre) this._mapInstance?.panTo(centre, { animate: true });
  }

  /** Move the selected look from one aircraft to another. */
  private _paintSelection(previous?: string): void {
    const leaflet = this._mapEl()?.Leaflet;
    if (!leaflet) return;
    const style = this._iconStyle();

    if (previous && previous !== this._selectedId) {
      const flight = this._drawn.get(previous);
      const marker = this._markers.get(previous);
      if (flight && marker) marker.setIcon(aircraftIcon(leaflet, shapeOf(flight, false), style));
      this._tracks.get(previous)?.setStyle({
        color: style.color,
        weight: TRACK_WEIGHT,
        opacity: TRACK_OPACITY,
      });
    }

    const id = this._selectedId;
    if (!id) return;
    const flight = this._drawn.get(id);
    const marker = this._markers.get(id);
    if (flight && marker) marker.setIcon(aircraftIcon(leaflet, shapeOf(flight, true), style));
    this._tracks.get(id)?.setStyle(this._selectedTrackStyle(style)).bringToFront();
  }

  /**
   * Slide a marker to its new fix instead of teleporting it.
   *
   * Leaflet positions a marker with `transform: translate3d(...)` on the icon's
   * root element, so a transition on that property turns the next `setLatLng`
   * into a glide. Every position drawn is on the straight line between two REAL
   * fixes -- the aircraft reads as one tick late, never as somewhere it has not
   * been, which is the difference between this and dead reckoning.
   *
   * The transition is armed per move and removed afterwards, because Leaflet
   * also rewrites that transform on zoom and pane resets.
   */
  private _glide(marker: LeafletMarker): void {
    // Someone who has asked for less motion gets the jump; it is the honest
    // rendering anyway.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const element = marker.getElement();
    if (!element) return;
    element.style.transition = `transform ${this._glideMs}ms linear`;
    this._gliding.push(element);
  }

  private _endGlide(): void {
    if (this._glideTimer !== undefined) {
      window.clearTimeout(this._glideTimer);
      this._glideTimer = undefined;
    }
    for (const element of this._gliding) element.style.transition = "";
    this._gliding = [];
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

  private _startMotion(): void {
    if (this._motionTimer !== undefined) return;
    this._lastStepAt = 0;
    this._motionTimer = window.setInterval(() => this._stepMotion(), MOTION_STEP_MS);
  }

  private _stopMotion(): void {
    if (this._motionTimer === undefined) return;
    window.clearInterval(this._motionTimer);
    this._motionTimer = undefined;
    // Leave no armed transitions behind. Stopping can mean the mode changed
    // under the card -- a config edit, or the reader turning reduced-motion on
    // -- and a leftover transition would animate the very next fix, which is
    // exactly what the mode they just chose says not to do.
    for (const marker of this._markers.values()) {
      const element = marker.getElement();
      if (element) element.style.transition = "";
    }
  }

  /**
   * Fly every predicted aircraft one step.
   *
   * Each marker is aimed at where it will be one step from NOW and given a
   * transition of exactly one step, so the browser draws the in-between frames
   * itself. That is what makes a once-a-second timer enough for motion that
   * looks continuous.
   *
   * A step that arrives late -- a backgrounded tab, a throttled timer, a long
   * main-thread stall -- would otherwise animate the whole catch-up across the
   * map as one slow slide. Past two steps the correction is applied without a
   * transition instead: an aircraft that is somewhere else should be redrawn
   * there, not seen travelling there.
   */
  private _stepMotion(): void {
    const now = Date.now();
    // Neither early return advances the clock, and that is the point: whatever
    // comes next is then correctly seen as late and redraws instead of sliding.
    // A hidden tab still fires this timer (throttled to about this interval),
    // so without that it would come back believing it had never missed a step
    // and animate minutes of flight across the map in one second.
    if (now < this._zoomingUntil) return;
    if (document.hidden || !this._markers.size) return;

    const late = this._lastStepAt !== 0 && now - this._lastStepAt > MOTION_STEP_MS * 2;
    this._lastStepAt = now;
    const target = now + MOTION_STEP_MS;

    for (const [id, marker] of this._markers) {
      const step = this._motion.step(id, target);
      if (!step) continue;
      const [lat, lon] = projectKm([step.fromLat, step.fromLon], step.bearing, step.km);
      const element = marker.getElement();
      if (element) {
        element.style.transition = late ? "" : `transform ${MOTION_STEP_MS}ms linear`;
      }
      marker.setLatLng([lat + step.residualLat, lon + step.residualLon]);
    }
  }

  /** Hand the markers back to Leaflet for the length of a zoom. */
  private _suspendForZoom(): void {
    this._zoomingUntil = Date.now() + ZOOM_GUARD_MS;
    this._endGlide();
    for (const marker of this._markers.values()) {
      const element = marker.getElement();
      if (element) element.style.transition = "";
    }
  }

  private _selectedTrackStyle(style: AircraftIconStyle): Record<string, unknown> {
    return {
      color: style.selectedColor,
      weight: SELECTED_TRACK_WEIGHT,
      opacity: SELECTED_TRACK_OPACITY,
    };
  }

  /** A small marker at the centre of the watched area. */
  private _drawAreaCentre(leaflet: LeafletLike): void {
    const bounds = this._bounds();
    if (!bounds || !this._baseLayer || !this._config?.show_area_center) return;
    const at = boundsCenter(bounds);

    if (this._centreMarker) {
      this._centreMarker.setLatLng(at);
      return;
    }

    this._centreMarker = leaflet
      .circleMarker(at, {
        radius: 5,
        weight: 2,
        color: this._themeColor("--primary-color", "#03a9f4"),
        fillColor: this._themeColor("--card-background-color", "#ffffff"),
        fillOpacity: 1,
        // Non-interactive so a click or drag that starts here still pans the
        // map, and so it can never steal a tap meant for an aircraft.
        interactive: false,
      })
      .addTo(this._baseLayer);
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
    // Leaflet caches its container size and only re-reads it when told to, so a
    // frame that has just been laid out would otherwise be fitted at the size
    // it had before.
    el.leafletMap?.invalidateSize(false);
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
