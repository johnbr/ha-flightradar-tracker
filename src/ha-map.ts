/**
 * Borrowing Home Assistant's own `<ha-map>` instead of bundling Leaflet.
 *
 * `ha-map` is the element behind the built-in Map card, so the tiles, the
 * dark-mode handling and the pan/zoom behaviour are the ones the rest of the
 * dashboard already has -- at no cost to this bundle, and with no API key.
 *
 * Four facts about it drive everything in this file. All four were re-checked
 * against the running frontend chunk (2026.8, `frontend_latest/52451.*.js`),
 * not taken from documentation.
 *
 * 1. **It is lazily loaded.** On a dashboard with no Map card the tag is an
 *    inert unknown element. The only supported way to pull the chunk in is to
 *    ask the card helpers to build a `map` card and throw it away --
 *    `ensureHaMap()`.
 *
 * 2. **It takes no `hass`.** Since 2026.8 everything it needs (`_states`,
 *    `_config`, `_i18n`, `_formatters`, `_connection`) arrives over Lit context
 *    with `subscribe: true`. Context requests are composed DOM events, so they
 *    cross shadow boundaries and are answered at the app root -- which is why
 *    nothing is threaded through here, and why the element only works inside
 *    the Home Assistant app tree. A Lovelace card always is.
 *
 * 3. **It re-fits itself when `_loaded` flips, and that branch is not gated on
 *    `autoFit`:** `update()` runs `(changed.has("_loaded") || this.autoFit && …)
 *    && this.fitMap()`. With no entities, zones or `layers`, `fitMap()` takes an
 *    early return that centres on the *home* coordinates at zoom 14. So a fit
 *    performed before `_loaded` is true gets silently overwritten by that.
 *    `whenMapReady()` therefore waits for `_loaded`, not just for Leaflet.
 *
 * 4. **`disconnectedCallback()` destroys the map** -- `leafletMap.remove()`,
 *    then `leafletMap`, `Leaflet` and `_loaded` are cleared. Anything added
 *    straight to the Leaflet instance dies with it, so callers must key their
 *    own layers on the *instance* and rebuild when it changes, never on the
 *    element.
 */

/** The Leaflet surface this card uses. Grows as the milestones need more. */
export interface LeafletLike {
  layerGroup(layers?: LeafletLayer[]): LeafletLayerGroup;
  circleMarker(latlng: LatLngTuple, options?: Record<string, unknown>): LeafletPathLayer;
  marker(latlng: LatLngTuple, options?: Record<string, unknown>): LeafletMarker;
  divIcon(options: Record<string, unknown>): LeafletDivIcon;
  polyline(latlngs: LatLngTuple[], options?: Record<string, unknown>): LeafletPolyline;
}

export type LatLngTuple = [number, number];

export interface LeafletLayer {
  addTo(map: LeafletMap | LeafletLayerGroup): this;
  remove(): this;
}

export interface LeafletPathLayer extends LeafletLayer {
  setLatLng(latlng: LatLngTuple): this;
  setStyle(style: Record<string, unknown>): this;
  bindTooltip(content: string, options?: Record<string, unknown>): this;
}

/** Opaque to us: built by `divIcon`, handed straight back to a marker. */
export type LeafletDivIcon = { readonly __divIcon?: never };

export interface LeafletMarker extends LeafletLayer {
  setLatLng(latlng: LatLngTuple): this;
  setIcon(icon: LeafletDivIcon): this;
  setZIndexOffset(offset: number): this;
  on(event: string, handler: (event: unknown) => void): this;
}

export interface LeafletPolyline extends LeafletLayer {
  setLatLngs(latlngs: LatLngTuple[]): this;
  setStyle(style: Record<string, unknown>): this;
  /** Raises the line above its siblings. Used for the selected track in M4. */
  bringToFront(): this;
}

export interface LeafletLayerGroup extends LeafletLayer {
  addLayer(layer: LeafletLayer): this;
  removeLayer(layer: LeafletLayer): this;
  clearLayers(): this;
}

/** Only the members used here; `ha-map` owns the instance. */
export interface LeafletMap {
  invalidateSize(animate?: boolean): void;
  panTo(latlng: LatLngTuple, options?: Record<string, unknown>): void;
  getZoom(): number;
}

export interface HaMapElement extends HTMLElement {
  Leaflet?: LeafletLike;
  /** Public on `ha-map`. This is the Leaflet instance our own layers go on. */
  leafletMap?: LeafletMap;
  /** Its own "Leaflet is up" flag. See fact 3. */
  _loaded?: boolean;
  layers?: LeafletLayer[];
  autoFit?: boolean;
  zoom?: number;
  themeMode?: "auto" | "light" | "dark";
  /** `zoom` in the options is a MAX zoom, not a target. Default pad is 0.5. */
  fitBounds(latlngs: LatLngTuple[], options?: { pad?: number; zoom?: number }): void;
  updateComplete: Promise<unknown>;
}

interface CardHelpers {
  createCardElement(config: Record<string, unknown>): Promise<unknown>;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<CardHelpers>;
  }
}

/** Ceiling on waiting for the lazy chunk. */
const LOAD_TIMEOUT_MS = 10_000;

/** Ceiling on waiting for that element to bring Leaflet up. */
const READY_TIMEOUT_MS = 5_000;
const READY_POLL_MS = 50;

/** Shared across every card instance: the chunk only needs importing once. */
let haMapPromise: Promise<boolean> | undefined;

export async function ensureHaMap(): Promise<boolean> {
  if (customElements.get("ha-map")) return true;

  haMapPromise ??= (async () => {
    try {
      const helpers = await window.loadCardHelpers?.();
      if (!helpers) return false;
      // Building a Map card is what imports the chunk defining `ha-map`; the
      // card itself is discarded. `show_all` is required because the card's own
      // setConfig rejects a config with neither entities nor
      // geo_location_sources, and that exception would be indistinguishable
      // from the chunk failing to load.
      await helpers.createCardElement({ type: "map", show_all: true });
    } catch {
      // Fall through: the import may have completed even if constructing the
      // throwaway card did not.
    }
    if (customElements.get("ha-map")) return true;
    // `whenDefined` never settles if the chunk genuinely failed, so it is
    // raced -- a map that never arrives must not leave the card on "Loading…".
    return Promise.race([
      customElements.whenDefined("ha-map").then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), LOAD_TIMEOUT_MS)),
    ]);
  })();

  return haMapPromise;
}

/**
 * Resolve once the element has Leaflet up *and* has flipped its own `_loaded`.
 *
 * Waiting on `.Leaflet` alone is not enough -- see fact 3. Returns undefined if
 * the map never comes up, which the caller must render as a failure rather than
 * an endless "Loading…".
 */
export async function whenMapReady(el: HaMapElement): Promise<LeafletLike | undefined> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while ((!el.Leaflet || !el._loaded) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
  }
  return el._loaded ? el.Leaflet : undefined;
}
