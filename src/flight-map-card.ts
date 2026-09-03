/**
 * Flight Map Card -- an interactive map of the aircraft overhead, with a detail
 * panel below it.
 *
 * Everything the card renders comes from one attribute on one entity
 * (`attributes.flights[]` on the Flightradar24 integration's area sensor), so
 * this is a pure frontend plugin with no Python side.
 */

import { LitElement, html, nothing, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { CARD_TYPE, parseConfig, type ParsedConfig } from "./config";
import { cardStyles } from "./styles";
import type { HassEntity, HomeAssistant } from "./types";

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

const DOCS = "https://github.com/johnbr/ha-flight-map-card";

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

  /** Deliberately NOT reactive: assigning it must not schedule a render. */
  private _hass?: HomeAssistant;

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

  private _computeSignature(): string {
    const entity = this._config?.entity;
    if (!entity) return "";
    // The FR24 coordinator ticks once every 60 s, so state + last_updated is a
    // complete fingerprint of the flights array without walking it.
    const st = this._hass?.states?.[entity];
    return st ? `${st.state}|${st.last_updated}` : "missing";
  }

  private _entity(): HassEntity | undefined {
    const entity = this._config?.entity;
    return entity ? this._hass?.states?.[entity] : undefined;
  }

  private _title(st: HassEntity | undefined): string {
    if (this._config?.title !== undefined) return this._config.title;
    const name = st?.attributes?.friendly_name;
    return typeof name === "string" ? name : "Flights overhead";
  }

  render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config) return nothing;

    const st = this._entity();
    const count = st ? Number.parseInt(st.state, 10) : Number.NaN;

    return html`
      <ha-card>
        <div class="header">
          <div class="title">${this._title(st)}</div>
          ${st && Number.isFinite(count) ? html`<div class="count">${count} aircraft</div>` : nothing}
        </div>
        <div class="body">
          ${st
            ? html`Map and detail panel land in the next milestone.`
            : html`<span class="error">Entity <code>${config.entity}</code> not found.</span>`}
        </div>
      </ha-card>
    `;
  }
}

if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, FlightMapCard);
}
