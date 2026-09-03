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

## What it does

- **A map you can actually use.** Pan, pinch and zoom freely; the card fits the watched area
  once on load and never again, so a data tick can't snap the view back under you. A recentre
  control is the way back.
- **Aircraft that move rather than blink.** Markers are keyed on the flight id and patched in
  place — added, moved, turned, removed — and each one *glides* to its new fix instead of
  teleporting. Every position drawn is on the line between two real fixes; nothing is
  extrapolated.
- **Rotated, per-kind icons.** Aircraft point where they are going. Helicopters get their own
  top-down symbol, and anything on the ground is dimmed.
- **Tracks.** Each aircraft's recent trail, from the sensor's own `coordinates` array.
- **Tap for the detail, tap again to dismiss it.** Tapping another aircraft moves the panel
  straight to it. Below the map, never over it: callsign, type and registration,
  airline, photo, the route with **each airport's own local times** (and the airline "+1" for
  a red-eye), a great-circle progress bar with distance flown, distance to run and time
  remaining, then altitude, vertical speed, track, ground speed, distance, closest approach,
  squawk and the ICAO 24-bit address — each row disappearing when the payload has no value
  for it.
- **Imperial by default**, because the sensor is metric and the house is not. Configurable.

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

**Pick one, not both.** A HACS install serves the card from `/hacsfiles/…` and a manual one
from `/local/community/…`; two registered resources means two copies of the element racing to
register the same tag name. If you are editing the source, the manual path is the one that
lets you deploy a build without cutting a release — and note that HACS overwrites its own
copy on every update, so a hand-edited file under a HACS-managed directory does not survive.

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
| `map_height` | number | `460` | Map frame height in px (120–1200). Capped at 300 px under a 700 px viewport |
| `zoom` | number | — | Fixes the zoom (1–20) instead of fitting the watched area. The map still centres on the area |
| `zoom_offset` | number | `1` | Whole zoom levels to tighten the area fit by (−2–3). **A positive value crops the area** — see below. Ignored when `zoom` is set |
| `theme_mode` | string | `auto` | Basemap theme: `auto` (follow the dashboard), `light`, `dark` |
| `show_airports` | bool | `true` | Draw the airports the overhead traffic is flying between — see below |
| `icon_size` | number | `28` | Aircraft icon box in px (12–72) |

### About `show_airports`

The airports come from the origin and destination fields on the aircraft that
are overhead right now, so they cost no extra request — but **this is not an
airport database**, and the difference shows: a field with nothing in the air
near it does not appear. Around a busy GA area that is academic, because the
local fields are named continuously by their own circuit traffic; a quiet strip
can blink in and out.

Only airports inside the watched area are drawn. Traffic overhead routinely
comes from a thousand kilometres away, and plotting every referenced airport
would scatter markers across the country.

### Aircraft shapes

Three silhouettes, all rotated to the direction of travel:

- **Jet** — mdi:airplane's swept planform. Also the fallback for any type the
  card does not recognise.
- **Light aircraft** — drawn by hand with a straight, unswept, full-span wing.
  Chosen from an explicit list of ICAO type designators (Cessna singles, the
  Piper PA-28/32 family, Beech pistons, Cirrus, Diamond, Mooney and friends).
  It is a list rather than a pattern on purpose: `^C1\d\d$` reads tidily and
  quietly captures a C130 Hercules, and `^BE\d\d$` captures the BE40 Beechjet.
- **Helicopter** — body, boom, tail rotor and the main rotor disc, seen from
  above, because mdi:helicopter is a side elevation and rotating that to a
  compass heading looks like a crash.

`aircraft_category` cannot make this distinction — measured against live data it
reads `"Airplane"` for a Cessna 152 and an A321 alike, and is only useful for
pulling helicopters out.

Markers point along the segment they are visibly travelling, not along the
feed's reported `heading`. The two agree in cruise and diverge in a turn, where
the reported heading has already swung to its new value while the segment being
drawn is still the old one — which reads as an aircraft flying sideways.

### About `zoom_offset`

The card fits the box the integration watches. That box is wide, so fitting all of it puts every
aircraft in the middle of the map at a size where the heading arrow is hard to read — which is why
the default is one level tighter rather than an exact fit.

The cost is real and worth stating plainly: **at the default the map shows a bit over half the
watched area's width**, so an aircraft near the edge of the box is off screen until you pan to it.
It is still tracked, still in the marker set, and the recentre button brings the whole area back.
Set `zoom_offset: 0` to see the entire area at once, which is exactly the fit the card used before
this option existed.

It moves the fit by *whole* zoom levels, so a fractional value is rejected rather than quietly
rounded. `zoom` (a fixed zoom) overrides it entirely.
| `show_tracks` | boolean | `true` | Draw each aircraft's recent track |
| `show_area_center` | boolean | `true` | Mark the centre of the watched area |
| `show_photo` | boolean | `true` | Show the aircraft photo in the detail panel |
| `units.altitude` | `ft` \| `m` | `ft` | |
| `units.speed` | `mph` \| `kts` \| `kmh` | `mph` | |
| `units.distance` | `mi` \| `km` \| `nm` | `mi` | |

There is a visual editor, so none of this has to be typed by hand.

**Every option is validated and a bad value throws** — an unknown key, a number
out of range, `show_tracks: "false"` (a truthy string), or `units.distance: miles`
all produce a card that says what is wrong. Nothing silently becomes a default.

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

## Notes on the data

Four of the integration's sensors carry the `flights` array and are all valid targets:
`current_in_area`, `entered_area`, `exited_area` and `additional_tracked`. The `airport_*`
sensors are **not** — their `flights` attribute is arrivals/departures rows and renders
nonsense.

The array is `_unrecorded_attributes` upstream, so it costs no recorder churn — and equally
there is no history to draw from. Each aircraft's `coordinates` array is the only possible
source of a track.

`flights[]` is the coordinator's insertion order, not distance order, so `flights[0]` is
whichever aircraft entered the box first. This card sorts nearest-first before doing anything
that means "the first one".

**Ground clutter is filtered on the integration side**, with `min_altitude`. Without it, any
airfield inside the configured radius fills the map with parked and taxiing aircraft, and each
one still costs a detail lookup.

**Scan interval.** Each cycle is one feed request plus a detail lookup for every aircraft whose
cached details are stale — and the integration treats any non-helicopter with no
`flight_number` as always stale, so those refetch every single cycle. The endpoint is
unofficial and rate-limited; a 429 comes back as an *empty* feed, and sustained empties make
the integration renew its session, which is itself what trips 429. 20 seconds is comfortable.
Going much below that buys very little, because the card already glides between fixes.

## Acknowledgements

The [Flightradar24 integration](https://github.com/AlexandrErohin/home-assistant-flightradar24)
does all the hard work; this is only a view onto one of its attributes. Its bundled
`flightradar24-card` was the reference for marker rotation and for keying markers by flight id.
