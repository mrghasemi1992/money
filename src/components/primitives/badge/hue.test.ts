import { hexToBadgeHue } from './hue';

describe('hexToBadgeHue', () => {
  it('extracts the hue of a pure color', () => {
    expect(hexToBadgeHue('#00FF00')).toBe(120);
    expect(hexToBadgeHue('#0000FF')).toBe(240);
  });

  it('is deterministic for the same input', () => {
    expect(hexToBadgeHue('#3D5A85')).toBe(hexToBadgeHue('#3D5A85'));
  });

  it('leaves hues that are already far from Rust untouched', () => {
    expect(hexToBadgeHue('#00FF00')).toBe(120);
  });

  it('nudges a hue landing on Rust itself away from it', () => {
    const hue = hexToBadgeHue('#B04A2E');
    const distanceFromRust = Math.min(
      Math.abs(hue - 13),
      360 - Math.abs(hue - 13),
    );
    expect(distanceFromRust).toBeGreaterThanOrEqual(15);
  });

  it('nudges pure red — whose raw hue (0°) falls inside the Rust guard band — to the nearest safe edge', () => {
    expect(hexToBadgeHue('#FF0000')).toBe(358);
  });
});
