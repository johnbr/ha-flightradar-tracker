import { css } from "lit";

/**
 * Card styles. HA theme variables only -- no literal colours -- so the card
 * follows the dashboard theme the way the built-in cards do.
 */
export const cardStyles = css`
  :host {
    display: block;
  }

  ha-card {
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px 8px;
  }

  .title {
    font-family: var(--ha-card-header-font-family, inherit);
    font-size: var(--ha-card-header-font-size, 24px);
    line-height: 1.2;
    color: var(--ha-card-header-color, var(--primary-text-color));
    letter-spacing: -0.012em;
  }

  .count {
    flex: 0 0 auto;
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  /*
   * The map's frame. Position is relative only so the recentre control can sit
   * over it -- nothing here may touch the map's own gesture handling. In
   * particular: never set touch-action on or around the map. Leaflet manages
   * its own touch handling, and "touch-action: none" is what cost the
   * air-quality card pinch-zoom across the whole dashboard.
   */
  .map-wrap,
  .placeholder {
    height: var(--fmc-map-height, 460px);
  }

  .map-wrap {
    position: relative;
  }

  /*
   * On a phone the configured height is usually somebody's desktop number, and
   * a 460 px map plus a detail panel is most of the screen. Cap it rather than
   * override it, so a deliberately short map stays short.
   */
  @media (max-width: 699px) {
    .map-wrap,
    .placeholder {
      height: min(var(--fmc-map-height, 460px), 300px);
    }
  }

  ha-map {
    display: block;
    height: 100%;
    width: 100%;
  }

  .recentre {
    position: absolute;
    top: 8px;
    right: 8px;
    /* Leaflet's own controls sit at 800; this has to clear them. */
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--primary-text-color);
    background: var(--card-background-color, var(--ha-card-background, #fff));
    box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.3));
    opacity: 0.9;
  }

  .recentre:hover {
    opacity: 1;
  }

  .recentre svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
    text-align: center;
    padding: 0 16px;
  }

  /*
   * The detail panel. Below the map, never over it: selecting an aircraft must
   * not obscure the thing you selected it from, and must not resize the map.
   */
  .detail {
    padding: 12px 16px 16px;
    border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
  }

  /* Fixed height, so the card does not collapse when nothing is selected. */
  .detail.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }

  .d-head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }

  .d-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.72rem;
    letter-spacing: 0.03em;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.14));
  }

  .d-sub {
    margin-top: 2px;
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }

  .photo {
    margin: 10px 0 0;
  }

  .photo img {
    display: block;
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: var(--ha-card-border-radius, 12px);
  }

  /* Route: two airports, the bar between them, and what is left to fly. */
  .route {
    margin-top: 12px;
  }

  .leg {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: start;
    gap: 8px;
  }

  .port.right {
    text-align: right;
  }

  .iata {
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--primary-text-color);
  }

  .city {
    font-size: 0.8rem;
    color: var(--secondary-text-color);
  }

  .arrow {
    align-self: center;
    color: var(--secondary-text-color);
  }

  .t-label {
    margin-top: 6px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
  }

  .t-value {
    font-size: 0.95rem;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }

  /* The airline "+1": small, raised, and never mistaken for part of the time. */
  .day {
    margin-left: 2px;
    font-size: 0.65em;
    color: var(--primary-color);
  }

  .t-sched {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }

  .bar {
    position: relative;
    height: 6px;
    margin: 12px 0 6px;
    border-radius: 3px;
    overflow: hidden;
    background: var(--divider-color, rgba(127, 127, 127, 0.25));
  }

  .fill {
    height: 100%;
    border-radius: 3px;
    background: var(--primary-color);
    /* The fraction moves once a tick; let it slide rather than snap. */
    transition: width 1s linear;
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition: none;
    }
  }

  .legend {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
    gap: 10px 12px;
    margin-top: 12px;
  }

  .cell .k {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
  }

  .cell .v {
    font-size: 1rem;
    color: var(--primary-text-color);
    /* Figures that change every minute should not shuffle their neighbours. */
    font-variant-numeric: tabular-nums;
  }

  .fr24 {
    display: inline-block;
    margin-top: 12px;
    font-size: 0.85rem;
    color: var(--primary-color);
    text-decoration: none;
  }

  .fr24:hover {
    text-decoration: underline;
  }

  .body {
    padding: 8px 16px 16px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }

  .error {
    color: var(--error-color);
  }
`;
