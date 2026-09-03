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
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  formatSquawk,
  formatVerticalSpeed,
  fr24Url,
  type Units,
} from "./format";
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

export function renderEmptyDetail(): TemplateResult {
  return html`<div class="detail empty">Tap an aircraft on the map</div>`;
}

export function renderDetail(flight: Flight, units: Units): TemplateResult {
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
