/**
 * Types for the card.
 *
 * `HomeAssistant` is a minimal local interface rather than a dependency on
 * `custom-card-helpers`: this card needs `states` and the locale, nothing more,
 * and that package has been unmaintained long enough that its types lag the
 * frontend it describes.
 */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_updated: string;
  last_changed: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: { language?: string };
  config?: { time_zone?: string };
  themes?: unknown;
}

/**
 * One aircraft, as the Flightradar24 integration publishes it inside
 * `attributes.flights[]`. Flat, one dict per aircraft, no nesting.
 *
 * Absent values arrive as `null`; the two time families additionally use `0`
 * to mean "no such time", which is NOT the epoch -- `time_scheduled_departure`
 * is `0` on plenty of live samples.
 */
export interface Flight {
  id: string;
  callsign: string | null;
  flight_number: string | null;
  aircraft_registration: string | null;
  aircraft_icao_24bit: string | null;
  aircraft_model: string | null;
  aircraft_code: string | null;
  /** "Helicopter" and friends; absent for most airliners. */
  aircraft_category: string | null;
  airline: string | null;
  airline_short: string | null;
  airline_iata: string | null;
  airline_icao: string | null;
  /** jetphotos CDN URLs -- third party, may 404. */
  aircraft_photo_small: string | null;
  aircraft_photo_medium: string | null;
  aircraft_photo_large: string | null;

  airport_origin_name: string | null;
  airport_origin_code_iata: string | null;
  airport_origin_code_icao: string | null;
  airport_origin_city: string | null;
  airport_origin_country_name: string | null;
  airport_origin_country_code: string | null;
  airport_origin_terminal: string | null;
  airport_origin_latitude: number | null;
  airport_origin_longitude: number | null;
  /** SECONDS, not hours. */
  airport_origin_timezone_offset: number | null;
  airport_origin_timezone_abbr: string | null;

  airport_destination_name: string | null;
  airport_destination_code_iata: string | null;
  airport_destination_code_icao: string | null;
  airport_destination_city: string | null;
  airport_destination_country_name: string | null;
  airport_destination_country_code: string | null;
  airport_destination_terminal: string | null;
  airport_destination_latitude: number | null;
  airport_destination_longitude: number | null;
  airport_destination_timezone_offset: number | null;
  airport_destination_timezone_abbr: string | null;

  /** Unix epoch seconds; `0` means absent. */
  time_scheduled_departure: number | null;
  time_scheduled_arrival: number | null;
  time_real_departure: number | null;
  time_real_arrival: number | null;
  time_estimated_departure: number | null;
  time_estimated_arrival: number | null;

  latitude: number;
  longitude: number;
  /** Feet. */
  altitude: number | null;
  /** Degrees true. */
  heading: number | null;
  /** Knots. */
  ground_speed: number | null;
  /** Feet per minute. */
  vertical_speed: number | null;
  squawk: string | null;
  on_ground: number | null;

  /** Kilometres from the configured area centre. */
  distance: number | null;
  /** Closest approach so far, kilometres. */
  closest_distance: number | null;

  /**
   * Track, oldest to newest, at most 50 points, ending on the aircraft's
   * current position. Always present once parsed -- an aircraft with no track
   * carries an empty array, never undefined.
   */
  coordinates: [number, number][];
  details_updated_at?: number | null;
}

export interface FlightMapCardConfig {
  type: string;
  /** The Flightradar24 area sensor carrying `attributes.flights[]`. */
  entity: string;
  /** Header text. Defaults to the entity's friendly name. */
  title?: string;
}
