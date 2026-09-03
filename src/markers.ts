/**
 * Aircraft markers.
 *
 * Two things force `L.divIcon` here rather than anything simpler:
 *
 * - **Rotation.** A marker has to point where the aircraft is pointing, and
 *   rotation is unreachable through `ha-map.paths` or through a plain image
 *   icon. A div wrapping an inline SVG, with `transform: rotate()`, is the
 *   working shape -- the same one the integration's own bundled card uses.
 * - **Styling.** The Leaflet map lives inside `ha-map`'s shadow root, so a CSS
 *   class defined in this card's own styles never reaches it. Everything here
 *   is therefore inline, and the colours are passed in already resolved.
 *
 * The default `leaflet-div-icon` class draws a white box behind the icon, so
 * `className` is set to replace it.
 *
 * This module takes a plain shape rather than a `Flight` so that it imports
 * nothing at runtime and `node --test` can type-strip it: Node's ESM resolver
 * wants an explicit extension on a real import, which neither rollup nor tsc
 * needs. Same rule as the other pure modules here.
 */

import type { LeafletDivIcon, LeafletLike } from "./ha-map";

/** mdi:airplane. Nose points north at rotation 0, which is what heading means. */
const PLANE_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 " +
  "19v-5.5l8 2.5z";

/**
 * How much of the icon the aircraft fills; the rest is room for the rotor
 * blades on a helicopter, so both kinds read at the same size.
 */
const VIEWBOX = 24;

/** What the icon has to know about the aircraft. */
export interface AircraftShape {
  /** Degrees true; null draws north-up. */
  heading: number | null;
  helicopter: boolean;
  grounded: boolean;
  selected: boolean;
}

export interface AircraftIconStyle {
  /** Icon box in pixels. */
  size: number;
  /** Body fill. */
  color: string;
  /** Halo, so the silhouette reads over any tile. */
  outline: string;
  /** Body fill for an aircraft on the ground. */
  groundColor: string;
  /** Body fill and halo for the selected aircraft. */
  selectedColor: string;
}

/** Belt and braces: these come from the theme, but they end up inside markup. */
function safe(color: string): string {
  return color.replace(/["'<>]/g, "");
}

function planeSvg(style: AircraftIconStyle, fill: string): string {
  return (
    `<path d="${PLANE_PATH}" fill="${safe(fill)}" stroke="${safe(style.outline)}" stroke-width="1.4" ` +
    `stroke-linejoin="round" paint-order="stroke"></path>`
  );
}

/**
 * A helicopter seen from above: body, tail boom, tail rotor, and the main rotor
 * disc as a cross over the top.
 *
 * Drawn by hand because mdi:helicopter is a side elevation -- rotating that to
 * a compass heading looks like a crash, not a heading.
 */
function helicopterSvg(style: AircraftIconStyle, fill: string): string {
  const body = safe(fill);
  const line = safe(style.outline);
  return (
    `<g stroke="${line}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.9">` +
    `<path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g>` +
    `<g stroke="${body}" stroke-width="1.1" stroke-linecap="round" fill="none">` +
    `<path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g>` +
    `<rect x="11.1" y="12.4" width="1.8" height="8" rx="0.9" fill="${body}" stroke="${line}" ` +
    `stroke-width="1" paint-order="stroke"></rect>` +
    `<rect x="8.7" y="19.2" width="6.6" height="1.6" rx="0.8" fill="${body}" stroke="${line}" ` +
    `stroke-width="1" paint-order="stroke"></rect>` +
    `<ellipse cx="12" cy="10" rx="3.1" ry="4.3" fill="${body}" stroke="${line}" stroke-width="1.2" ` +
    `paint-order="stroke"></ellipse>`
  );
}

/**
 * The icon for one aircraft.
 *
 * Rebuilt only when `markerKey()` changes -- see flights.ts. Calling
 * `setIcon` replaces the marker's DOM node, so doing it on every tick is what
 * makes a field of aircraft blink.
 */
export function aircraftIcon(leaflet: LeafletLike, shape: AircraftShape, style: AircraftIconStyle): LeafletDivIcon {
  const heading = shape.heading === null ? 0 : Math.round(shape.heading);
  const grounded = shape.grounded;
  const fill = shape.selected ? style.selectedColor : grounded ? style.groundColor : style.color;
  const body = shape.helicopter ? helicopterSvg(style, fill) : planeSvg(style, fill);
  // The halo is a circle, so it survives the rotation unchanged -- and it is
  // drawn first, i.e. behind the aircraft.
  const halo = shape.selected
    ? `<circle cx="12" cy="12" r="11" fill="${safe(style.selectedColor)}" opacity="0.25"></circle>`
    : "";
  const inner = halo + body;
  const anchor = style.size / 2;

  return leaflet.divIcon({
    // Replaces `leaflet-div-icon`, whose white box would frame every aircraft.
    className: "fmc-aircraft",
    iconSize: [style.size, style.size],
    iconAnchor: [anchor, anchor],
    html:
      `<div style="width:${style.size}px;height:${style.size}px;transform:rotate(${heading}deg);` +
      `transform-origin:50% 50%;${grounded ? "opacity:0.55;" : ""}">` +
      `<svg viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" style="width:100%;height:100%;display:block" ` +
      `xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg></div>`,
  });
}
