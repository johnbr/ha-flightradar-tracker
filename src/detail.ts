/**
 * The detail panel: what one aircraft is, and what it is doing.
 *
 * It renders BELOW the map, never over it, so selecting an aircraft never
 * obscures the thing you selected it from.
 *
 * Every block degrades on its own. A helicopter or a GA flight has
 * `airport_destination_*` all null and often no squawk, so blocks and rows
 * disappear rather than printing "null" or a dash -- the live sample as this
 * was written was a Fontana PD helicopter with exactly that shape.
 */

import { html, nothing, type TemplateResult } from "lit";
import { keyed } from "lit/directives/keyed.js";
import {
  dayOffset,
  epochOrNull,
  etaMinutes,
  formatAirportTime,
  formatAltitude,
  formatDistance,
  formatDuration,
  formatHeading,
  formatSpeed,
  formatSquawk,
  formatVerticalSpeed,
  fr24Url,
  type Units,
} from "./format";
import { airportPosition, routeProgress } from "./geo";
import type { Flight } from "./types";

/** A photo that 404s must leave nothing behind, not a broken-image box. */
function hidePhoto(event: Event): void {
  const figure = (event.target as HTMLElement | null)?.closest("figure");
  if (figure instanceof HTMLElement) figure.style.display = "none";
}

function cell(label: string, value: string | null): TemplateResult | typeof nothing {
  if (value === null) return nothing;
  return html`<div class="cell"><div class="k">${label}</div><div class="v">${value}</div></div>`;
}

function chip(value: string | null): TemplateResult | typeof nothing {
  return value ? html`<span class="chip">${value}</span>` : nothing;
}

/** Callsign first: it is what air traffic control and the app both say. */
export function flightTitle(flight: Flight): string {
  return flight.callsign ?? flight.flight_number ?? flight.aircraft_registration ?? flight.id;
}

function subtitle(flight: Flight): string {
  const airline = flight.airline_short ?? flight.airline;
  return [flight.aircraft_model, airline].filter((part): part is string => !!part).join(" · ");
}

function photoUrl(flight: Flight): string | null {
  return flight.aircraft_photo_medium ?? flight.aircraft_photo_large ?? flight.aircraft_photo_small;
}

/**
 * One end of the route: which time to show, and what to call it.
 *
 * Actual beats estimated beats scheduled -- and the scheduled time is kept as a
 * second line whenever it differs, because "lands at 22:43, was meant to land
 * at 22:37" is the interesting part. The zone is printed once, on the primary:
 * both times are at the same airport, so repeating it is noise.
 */
interface Endpoint {
  code: string;
  city: string | null;
  label: string;
  time: string | null;
  scheduled: string | null;
  epoch: number | null;
  offset: number | null;
}

function endpoint(flight: Flight, arrival: boolean, hour12: boolean): Endpoint | null {
  const code = arrival ? flight.airport_destination_code_iata : flight.airport_origin_code_iata;
  if (!code) return null;

  const offset = arrival ? flight.airport_destination_timezone_offset : flight.airport_origin_timezone_offset;
  const abbr = arrival ? flight.airport_destination_timezone_abbr : flight.airport_origin_timezone_abbr;
  const real = epochOrNull(arrival ? flight.time_real_arrival : flight.time_real_departure);
  const estimated = epochOrNull(arrival ? flight.time_estimated_arrival : flight.time_estimated_departure);
  const planned = epochOrNull(arrival ? flight.time_scheduled_arrival : flight.time_scheduled_departure);

  const chosen = real ?? estimated ?? planned;
  const label = real
    ? arrival
      ? "Arrived"
      : "Departed"
    : estimated
      ? arrival
        ? "Arrives (est)"
        : "Departs (est)"
      : arrival
        ? "Arrives"
        : "Departs";

  return {
    code,
    city: arrival ? flight.airport_destination_city : flight.airport_origin_city,
    label,
    time: formatAirportTime(chosen, offset, abbr, hour12),
    // Only worth a line when it is not the time already shown above it.
    scheduled:
      planned !== null && chosen !== null && planned !== chosen
        ? formatAirportTime(planned, offset, null, hour12)
        : null,
    epoch: chosen,
    offset: typeof offset === "number" ? offset : null,
  };
}

function renderEndpoint(end: Endpoint, dayMark: string, right: boolean): TemplateResult {
  return html`
    <div class="port ${right ? "right" : ""}">
      <div class="iata">${end.code}</div>
      ${end.city ? html`<div class="city">${end.city}</div>` : nothing}
      ${end.time
        ? html`<div class="t-label">${end.label}</div>
            <div class="t-value">${end.time}${dayMark ? html`<sup class="day">${dayMark}</sup>` : nothing}</div>`
        : nothing}
      ${end.scheduled ? html`<div class="t-sched">sched ${end.scheduled}</div>` : nothing}
    </div>
  `;
}

/**
 * Route and progress.
 *
 * Both disappear whole when the payload has no destination -- which is most of
 * general aviation, and was the live sample the day this was written. A route
 * block reading "SBD → null" with a 0 % bar is worse than no block.
 */
function renderRoute(flight: Flight, units: Units, hour12: boolean): TemplateResult | typeof nothing {
  const from = endpoint(flight, false, hour12);
  const to = endpoint(flight, true, hour12);
  if (!from || !to) return nothing;

  const days = dayOffset(from.epoch, from.offset, to.epoch, to.offset);
  const dayMark = days > 0 ? `+${days}` : days < 0 ? `${days}` : "";

  const progress = routeProgress(
    airportPosition(flight.airport_origin_latitude, flight.airport_origin_longitude),
    [flight.latitude, flight.longitude],
    airportPosition(flight.airport_destination_latitude, flight.airport_destination_longitude)
  );

  const eta = progress
    ? formatDuration(
        etaMinutes(
          flight.time_estimated_arrival ?? flight.time_scheduled_arrival,
          progress.remainingKm,
          flight.ground_speed,
          Math.floor(Date.now() / 1000)
        )
      )
    : null;

  // Floored, not rounded: 99.8 % rounds to a bar reading "100 % · 2.1 mi to
  // run", which contradicts itself. Only an aircraft actually at the airport
  // gets to say 100.
  const percent = progress ? Math.floor(progress.fraction * 100) : 0;

  return html`
    <div class="route">
      <div class="leg">
        ${renderEndpoint(from, "", false)}
        <div class="arrow" aria-hidden="true">→</div>
        ${renderEndpoint(to, dayMark, true)}
      </div>
      ${progress
        ? html`
            <div
              class="bar"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${percent}
            >
              <div class="fill" style="width:${percent}%"></div>
            </div>
            <div class="legend">
              <span>${formatDistance(progress.flownKm, units.distance)} flown</span>
              <span>
                ${formatDistance(progress.remainingKm, units.distance)} to run${eta ? ` · ${eta}` : ""}
              </span>
            </div>
          `
        : nothing}
    </div>
  `;
}

export function renderEmptyDetail(): TemplateResult {
  return html`<div class="detail empty">Tap an aircraft on the map</div>`;
}

export function renderDetail(flight: Flight, units: Units, hour12: boolean): TemplateResult {
  const photo = photoUrl(flight);
  const link = fr24Url(flight.id, flightTitle(flight));
  const sub = subtitle(flight);

  return html`
    <div class="detail">
      <div class="d-head">
        <div class="d-name">${flightTitle(flight)}</div>
        <div class="chips">${chip(flight.aircraft_code)}${chip(flight.aircraft_registration)}</div>
      </div>
      ${sub ? html`<div class="d-sub">${sub}</div>` : nothing}
      ${photo
        ? // Keyed on the URL so Lit builds a fresh <figure> per aircraft: reusing
          // one that a previous 404 hid would leave the next photo invisible.
          keyed(
            photo,
            html`<figure class="photo">
              <img src=${photo} alt=${flightTitle(flight)} loading="lazy" @error=${hidePhoto} />
            </figure>`
          )
        : nothing}
      ${renderRoute(flight, units, hour12)}
      <div class="grid">
        ${cell("Altitude", formatAltitude(flight.altitude, units.altitude))}
        ${cell("Vertical", formatVerticalSpeed(flight.vertical_speed))}
        ${cell("Ground speed", formatSpeed(flight.ground_speed, units.speed))}
        ${cell("Track", formatHeading(flight.heading))}
        ${cell("Distance", formatDistance(flight.distance, units.distance))}
        ${cell("Closest", formatDistance(flight.closest_distance, units.distance))}
        ${cell("Squawk", formatSquawk(flight.squawk))}
        ${cell("ICAO 24-bit", flight.aircraft_icao_24bit)}
      </div>
      ${link
        ? html`<a class="fr24" href=${link} target="_blank" rel="noopener noreferrer"
            >View on Flightradar24</a
          >`
        : nothing}
    </div>
  `;
}
