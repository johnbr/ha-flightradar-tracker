## Flight Map Card

An interactive map of the aircraft overhead — tap one and read its full detail below the map.

- Pan, pinch and zoom freely; a data tick never snaps the view back.
- Aircraft glide between fixes rather than jumping, with rotated per-kind icons and their
  recent tracks.
- Detail panel below the map: photo, airline, the route with each airport's own local times,
  a great-circle progress bar, and live telemetry — every row disappearing when the payload
  has no value for it.
- Draws with Home Assistant's own bundled Leaflet. No API key, no CDN fetch.
- Reads one attribute on the Flightradar24 integration's area sensor. No backend setup.
- Strictly validated configuration: a bad value tells you so instead of silently becoming the
  default.
