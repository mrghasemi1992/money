// Rust (the negative-amount hue) sits at ~13° in both themes. Category
// colors are user-chosen and must never land there, or a category tag would
// visually compete with "this is a loss".
const RUST_HUE = 13;
const RUST_GUARD_DEGREES = 15;

function hexToHue(hex: string): number {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue: number;
  if (max === r) hue = (g - b) / delta;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

function circularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function avoidRustHue(hue: number): number {
  if (circularDistance(hue, RUST_HUE) >= RUST_GUARD_DEGREES) return hue;
  const upperEdge = (RUST_HUE + RUST_GUARD_DEGREES) % 360;
  const lowerEdge = (RUST_HUE - RUST_GUARD_DEGREES + 360) % 360;
  return circularDistance(hue, upperEdge) <= circularDistance(hue, lowerEdge)
    ? upperEdge
    : lowerEdge;
}

/** Extracts a hue (0-360) from a user-chosen hex color, nudged away from the
 * Rust hue if it lands too close. Saturation/lightness are intentionally
 * discarded — Badge renders the hue against fixed per-theme bands so every
 * category badge reads as part of one system regardless of what shade the
 * user picked. */
export function hexToBadgeHue(hex: string): number {
  return avoidRustHue(hexToHue(hex));
}
