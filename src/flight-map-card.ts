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
import { CARD_TYPE, parseConfig, type ParsedConfig } from "./config";
import { diffFlights, flightLabel, indexById, isHelicopter, isOnGround, parseFlights } from "./flights";
import { boundsCenter, boundsCorners, parseBounds, type AreaBounds } from "./geo";
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
import { aircraftIcon, type AircraftIconStyle, type AircraftShape } from "./markers";
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

/** Map frame height in pixels. Becomes the `map_height` option in M6. */
const MAP_HEIGHT = 380;

/**
 * Padding around the fitted area, as a fraction of its own extent.
 *
 * `ha-map`'s own default is 0.5, which would leave a 50 km box filling barely
 * half the frame. The bounds are already the watched circle's bounding square,
 * so they need only enough slack to keep the edge markers off the border.
 */
const FIT_PAD = 0.05;

/** Aircraft icon box in pixels. Becomes the `icon_size` option in M6. */
const ICON_SIZE = 28;

/**
 * Track line weight and opacity. Deliberately faint: eleven 50-point trails is
 * the normal case here, and they are context for the aircraft, not the subject.
 * Becomes the `show_tracks` option in M6.
 */
const TRACK_WEIGHT = 2;
const TRACK_OPACITY = 0.45;

/** mdi:crosshairs-gps */
const RECENTRE_PATH =
  "M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 " +
  "11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83," +
  "20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z";

/** markers.ts stays runtime-import-free, so the card adapts the flight for it. */
function shapeOf(flight: Flight): AircraftShape {
  return { heading: flight.heading, helicopter: isHelicopter(flight), grounded: isOnGround(flight) };
}

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

  @state() private _config?: ParsedConfig;
  /** null while the lazy `ha-map` chunk is still being fetched. */
  @state() private _mapAvailable: boolean | null = null;

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
  /** A tick that arrived mid-sync, so it is not silently dropped for 60 s. */
  private _resync = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    const signature = this._computeSignature();
    if (signature === this._signature) return;
    this._signature = signature;
    this.requestUpdate();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  setConfig(config: unknown): void {
    this._config = parseConfig(config);
    this._signature = this._computeSignature();
  }

  getCardSize(): number {
    return 8;
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
    // The layers die with the map `ha-map` tears down, so this only drops our
    // references -- keeping them would leave _syncMap believing it is set up.
    this._mapInstance = undefined;
    this._baseLayer = undefined;
    this._trackLayer = undefined;
    this._markerLayer = undefined;
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
        this._baseLayer = leaflet.layerGroup().addTo(map);
        this._trackLayer = leaflet.layerGroup().addTo(map);
        this._markerLayer = leaflet.layerGroup().addTo(map);
        this._centreMarker = undefined;
        // The old layers went down with the old map, so the next diff has to
        // start from empty or every aircraft would be treated as unchanged and
        // never re-added.
        this._markers.clear();
        this._tracks.clear();
        this._drawn.clear();
        this._fitted = false;
      }

      this._drawAreaCentre(leaflet);
      this._syncFlights(leaflet);

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
    const diff = diffFlights(this._drawn, flights);
    if (!diff.added.length && !diff.changed.length && !diff.removed.length) return;

    const style = this._iconStyle();
    const trackColor = style.color;

    for (const id of diff.removed) {
      const marker = this._markers.get(id);
      if (marker) {
        markerLayer.removeLayer(marker);
        this._markers.delete(id);
      }
      const track = this._tracks.get(id);
      if (track) {
        trackLayer.removeLayer(track);
        this._tracks.delete(id);
      }
    }

    for (const flight of diff.added) {
      const marker = leaflet.marker([flight.latitude, flight.longitude], {
        icon: aircraftIcon(leaflet, shapeOf(flight), style),
        // Native tooltip: enough to identify an aircraft before the detail
        // panel exists, and it costs no DOM.
        title: flightLabel(flight),
        keyboard: false,
      });
      marker.addTo(markerLayer);
      this._markers.set(flight.id, marker);
      this._drawTrack(leaflet, flight, trackColor);
    }

    for (const { flight, moved, restyled, retracked } of diff.changed) {
      const marker = this._markers.get(flight.id);
      if (marker) {
        if (moved) marker.setLatLng([flight.latitude, flight.longitude]);
        if (restyled) marker.setIcon(aircraftIcon(leaflet, shapeOf(flight), style));
      }
      if (retracked) this._drawTrack(leaflet, flight, trackColor);
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
  private _drawTrack(leaflet: LeafletLike, flight: Flight, color: string): void {
    const layer = this._trackLayer;
    if (!layer) return;
    const points = flight.coordinates;
    const existing = this._tracks.get(flight.id);

    // One point is a dot, not a trail, and reads as a rendering fault.
    if (points.length < 2) {
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

    const line = leaflet.polyline(points, {
      color,
      weight: TRACK_WEIGHT,
      opacity: TRACK_OPACITY,
      lineJoin: "round",
      lineCap: "round",
      // The trail is context, not a control: a non-interactive line cannot
      // swallow a tap meant for an aircraft, or a drag meant to pan the map.
      interactive: false,
    });
    line.addTo(layer);
    this._tracks.set(flight.id, line);
  }

  private _iconStyle(): AircraftIconStyle {
    return {
      size: ICON_SIZE,
      // The text colour tracks the theme, and ha-map switches its tiles with
      // the same theme, so the silhouette stays legible in both.
      color: this._themeColor("--primary-text-color", "#212121"),
      outline: this._themeColor("--card-background-color", "#ffffff"),
      groundColor: this._themeColor("--disabled-text-color", "#8f8f8f"),
    };
  }

  /** A small marker at the centre of the watched area. */
  private _drawAreaCentre(leaflet: LeafletLike): void {
    const bounds = this._bounds();
    if (!bounds || !this._baseLayer) return;
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
    el.fitBounds(boundsCorners(bounds), { pad: FIT_PAD });
  }

  private _onRecentre = (): void => {
    const el = this._mapEl();
    if (el) this._fitToArea(el);
  };

  private _renderMap(): TemplateResult {
    if (this._mapAvailable === null) {
      return html`<div class="placeholder" style="height:${MAP_HEIGHT}px">Loading map…</div>`;
    }
    if (!this._mapAvailable) {
      return html`<div class="placeholder error" style="height:${MAP_HEIGHT}px">
        Map unavailable — Home Assistant's map component did not load.
      </div>`;
    }
    return html`
      <div class="map-wrap" style="height:${MAP_HEIGHT}px">
        <ha-map .autoFit=${false} .themeMode=${"auto"}></ha-map>
        <button class="recentre" title="Recentre on the watched area" @click=${this._onRecentre}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${RECENTRE_PATH}></path></svg>
        </button>
      </div>
    `;
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
          ? this._renderMap()
          : html`<div class="body error">Entity <code>${config.entity}</code> not found.</div>`}
      </ha-card>
    `;
  }
}

if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, FlightMapCard);
}
