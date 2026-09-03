# Flight Map Card

A Home Assistant Lovelace card that shows **the aircraft overhead on an interactive map, and
the full detail of whichever one you tap** — the experience the Flightradar24 app gives, on a
dashboard.

It is fed entirely by the
[Flightradar24 integration](https://github.com/AlexandrErohin/home-assistant-flightradar24)'s
area sensor: one attribute, on one entity, so this is a pure frontend plugin with no Python
side and nothing to configure on the backend.

## Why another flight card

Two cards already exist and each does half the job:

| Card | Map | Detail |
|---|---|---|
| `flightradar24-card` (bundled with the integration) | Leaflet map with rotated markers and tracks — but `dragging: false` / `touchZoom: false`, so it cannot be panned, and Leaflet is fetched from unpkg.com at render time | a small popup |
| `flightradar-flight-card` (plckr) | none | full: photo, airline, route, progress, times |

This card is the union: a **fully interactive map** (pan, pinch, zoom) whose markers are the
aircraft, with a **detail panel below the map** — never over it, so the map is neither
obscured nor resized when a flight is selected.

Three deliberate choices:

- **The map is Home Assistant's own bundled Leaflet** (`ha-map`, the element behind the
  built-in Map card). No API key, no CDN fetch, theme-aware, and no bytes added to the bundle.
- **Map plus detail only.** There is no flight list — the map *is* the list.
- **Configuration is validated strictly.** An unknown key, or a known key with a bad value,
  throws. The card is deliberately not built on silent fallbacks, where a typo becomes the
  default and "it didn't error" tells you nothing.

## Status

Under construction, milestone by milestone.

- [x] **M0** — repo, tooling, CI; the card registers and renders
- [x] **M1** — `ha-map` mounts, fits to the area bounds, pan/zoom
- [ ] **M2** — aircraft markers: rotated, patched in place per tick
- [ ] **M3** — track polylines
- [ ] **M4** — selection and the detail panel
- [ ] **M5** — route block with airport-local times, progress bar
- [ ] **M6** — units, visual editor
- [ ] **M7** — docs and first release

## Installation

### HACS (custom repository)

1. HACS → ⋮ → **Custom repositories**
2. Repository `https://github.com/johnbr/ha-flightradar-tracker`, category **Dashboard**
3. Install, then reload the browser.

### Manual

Copy `dist/flight-map-card.js` to `<config>/www/community/flight-map-card/` and add it as a
Lovelace resource of type **JavaScript Module**, with a `?v=` query string you bump on every
update — a cached module shows up as Home Assistant's generic "Configuration error", with
nothing on screen naming the cache.

## Configuration

```yaml
type: custom:flight-map-card
entity: sensor.flightradar24_current_in_area
title: Flights overhead
```

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | string | **required** | The Flightradar24 area sensor carrying `attributes.flights[]` |
| `title` | string | the entity's friendly name | Header text |

More options arrive with the milestones above.

### Which entity

Four of the integration's sensors carry the `flights[]` array and are all valid targets:
`current_in_area`, `entered_area`, `exited_area` and `additional_tracked`. The `airport_*`
sensors are **not** — their `flights` attribute is arrivals/departures rows and renders
nonsense.

The array is `_unrecorded_attributes` upstream, so it is live-only and costs no recorder
churn — and there is no history to draw: an aircraft's track comes from the `coordinates`
array on the flight itself.

## Development

```bash
npm ci
npm run typecheck
npm run test:js     # node --test, no build step
npm run build       # rollup -> dist/flight-map-card.js
```

`dist/` is committed on purpose: HACS installs straight from the repository, so a gitignored
bundle would ship no card at all. CI rebuilds and fails on any diff.

The modules under `src/` that hold pure logic — config parsing, geometry, formatting, the
flight diff — are kept **import-free** so `node --test` can type-strip and run them directly;
importing a Lit-decorated module fails to parse before any assertion runs.

## License

MIT
