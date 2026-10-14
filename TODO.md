# TODO

## Port the map layer off Leaflet onto ha-map's engine-neutral API

**Status:** deferred (2026-10-07). Nothing started.

**Why it is open.** HA 2026.10 made `ha-map` a wrapper around a pluggable
`_engine` that defaults to MapLibre, keeping Leaflet only as the no-WebGL
fallback. 14ce384 keeps the card working by forcing the Leaflet engine
(`_forceLeaflet`), but that leans on a private field and on the engine HA now
treats as the fallback. See fact 5 in `src/ha-map.ts`.

**What it would buy**
- Consistency: every other map on a 2026.10 dashboard is MapLibre vector
  tiles with HA's new styles. On the Exterior board the fire map directly
  below this card already is, so the two maps look different.
- Fractional zoom and crisp tiles at every zoom level.
- Future-proofing against Leaflet's rot or removal as the fallback engine.
- Tracks could become GPU-drawn line layers. The markers would not get faster,
  since both engines move DOM markers the same way.

**What it costs**
- A rewrite of the drawing layer: `aircraftIcon` divIcons, layer groups,
  polylines, tooltips, and the `zoomstart`/`viewreset` suspend hooks that keep
  predicted motion from sliding markers across the map (`motion.ts`).
- The target should be ha-map's engine-neutral handles (`addMarker`,
  `addCircle`, paths; each returns an `update`/`remove` handle), not raw
  MapLibre, so the card works on whichever engine HA chooses. That API is new
  in 2026.10 and internal, so let it settle for a release or two first.

**Suggested first step:** prototype only the aircraft markers and tracks on the
engine-neutral handles, and check whether per-frame `update()` keeps up with
predicted motion at about 16 aircraft before committing to the full port.
