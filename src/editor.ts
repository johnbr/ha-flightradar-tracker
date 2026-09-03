/**
 * The visual editor.
 *
 * One `ha-form` over the whole config, which keeps the schema declarative and
 * gets HA's own entity picker, number boxes and selects for free.
 *
 * Two things it deliberately does NOT do:
 *
 * - It never writes a default into the dashboard. `ha-form` is handed only what
 *   the user actually set, so an untouched option stays absent from the YAML
 *   and keeps following the card's default if that ever changes.
 * - It does not validate. `setConfig` on the card is the one place that decides
 *   what a valid config is, and a second opinion here could only disagree with
 *   it.
 */

import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { DEFAULTS, EDITOR_TYPE, THEME_MODES, type ParsedConfig } from "./config";
import type { HomeAssistant } from "./types";

const LABELS: Record<string, string> = {
  entity: "Flightradar24 area sensor",
  title: "Title",
  map_height: "Map height",
  zoom: "Fixed zoom (overrides the area fit)",
  zoom_offset: "Zoom in beyond the area fit (levels)",
  theme_mode: "Map theme",
  icon_size: "Aircraft icon size",
  show_tracks: "Show tracks",
  show_airports: "Show airports",
  show_area_center: "Mark the area centre",
  show_photo: "Show aircraft photo",
  unit_altitude: "Altitude",
  unit_speed: "Speed",
  unit_distance: "Distance",
};

const SCHEMA = [
  {
    name: "entity",
    required: true,
    // The four sensors that carry `attributes.flights[]` are all `sensor.`;
    // narrowing further would need the integration's own entity list.
    selector: { entity: { domain: "sensor" } },
  },
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "map_height",
        selector: { number: { min: 120, max: 1200, step: 10, mode: "box", unit_of_measurement: "px" } },
      },
      { name: "zoom", selector: { number: { min: 1, max: 20, step: 1, mode: "box" } } },
      { name: "zoom_offset", selector: { number: { min: -2, max: 3, step: 1, mode: "box" } } },
      {
        name: "theme_mode",
        selector: { select: { mode: "dropdown", options: [...THEME_MODES] } },
      },
      {
        name: "icon_size",
        selector: { number: { min: 12, max: 72, step: 1, mode: "box", unit_of_measurement: "px" } },
      },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "unit_altitude",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "ft", label: "Feet" },
              { value: "m", label: "Metres" },
            ],
          },
        },
      },
      {
        name: "unit_speed",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "mph", label: "mph" },
              { value: "kts", label: "Knots" },
              { value: "kmh", label: "km/h" },
            ],
          },
        },
      },
      {
        name: "unit_distance",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "mi", label: "Miles" },
              { value: "km", label: "Kilometres" },
              { value: "nm", label: "Nautical miles" },
            ],
          },
        },
      },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_tracks", selector: { boolean: {} } },
      { name: "show_airports", selector: { boolean: {} } },
      { name: "show_area_center", selector: { boolean: {} } },
      { name: "show_photo", selector: { boolean: {} } },
    ],
  },
];

const DEFAULT_HINT = "tracks off, airports, centre mark and photo on";

/** `units` is nested in the config but flat in the form. */
interface FormData extends Omit<ParsedConfig, "units" | "type"> {
  unit_altitude?: string;
  unit_speed?: string;
  unit_distance?: string;
}

export class FlightMapCardEditor extends LitElement {
  static styles = css`
    .hint {
      margin: 12px 4px 0;
      font-size: 0.8rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
  `;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ParsedConfig;

  setConfig(config: ParsedConfig): void {
    this._config = config;
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this._ensureForm();
  }

  /**
   * `ha-form` ships in a chunk the frontend only loads for a card editor that
   * already uses it, so it can be undefined here. Building a throwaway core
   * editor is what pulls it in -- the same trick as `ensureHaMap`.
   */
  private async _ensureForm(): Promise<void> {
    if (customElements.get("ha-form")) return;
    const helpers = await window.loadCardHelpers?.();
    if (!helpers) return;
    const card = (await helpers.createCardElement({ type: "entities", entities: [] })) as {
      constructor: { getConfigElement?: () => Promise<unknown> };
    } | null;
    await card?.constructor?.getConfigElement?.();
    this.requestUpdate();
  }

  private _computeLabel = (schema: { name: string }): string => LABELS[schema.name] ?? schema.name;

  private _valueChanged = (event: CustomEvent): void => {
    const form = event.detail.value as FormData;
    const next: Record<string, unknown> = { ...this._config, ...form };

    // Fold the three flat unit fields back into the nested mapping the card
    // reads, dropping the form's own keys so they never reach the YAML.
    const units: Record<string, string> = {};
    for (const key of ["altitude", "speed", "distance"] as const) {
      const value = form[`unit_${key}` as keyof FormData];
      if (typeof value === "string" && value !== "") units[key] = value;
      delete next[`unit_${key}`];
    }
    if (Object.keys(units).length) next.units = units;
    else delete next.units;

    // An option cleared in the form is removed rather than written as null,
    // so it goes back to following the card's default.
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") delete next[key];
    }

    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true })
    );
  };

  render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;

    const data: FormData = {
      ...this._config,
      unit_altitude: this._config.units?.altitude,
      unit_speed: this._config.units?.speed,
      unit_distance: this._config.units?.distance,
    };
    delete (data as unknown as Record<string, unknown>).units;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p class="hint">
        Defaults: ${DEFAULTS.map_height} px tall, fitted ${DEFAULTS.zoom_offset} zoom level beyond the
        watched area, ${DEFAULT_HINT}. An option left blank follows the default rather than being
        written into the dashboard. A positive zoom-in crops the area, so set it to 0 to see all of it.
      </p>
    `;
  }
}

if (!customElements.get(EDITOR_TYPE)) {
  customElements.define(EDITOR_TYPE, FlightMapCardEditor);
}
