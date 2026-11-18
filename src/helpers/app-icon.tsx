import { ImageResponse } from "next/og";

import { APP_ICON_COLORS, WALLET_GLYPH_PATHS } from "@/constants/app-icon";

/**
 * How the Lucide wallet glyph (24 units) sits on the 64-unit icon. «rounded» matches icon.svg:
 * rounded corners and a large glyph. «full» is full bleed with a smaller glyph that stays inside
 * the safe zone of maskable icons and iOS's rounded mask.
 */
const SHAPES = {
  rounded: { radius: 14, offset: 11, scale: 1.75, stroke: 2.4 },
  full: { radius: 0, offset: 17, scale: 1.25, stroke: 2 },
};

export type AppIconShape = keyof typeof SHAPES;

/** The app icon from the design (assets/app-icon.svg) as a square PNG of `size` pixels. */
export function appIconResponse(size: number, shape: AppIconShape) {
  const { radius, offset, scale, stroke } = SHAPES[shape];
  return new ImageResponse(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
    >
      <rect
        width="64"
        height="64"
        rx={radius}
        fill={APP_ICON_COLORS.background}
      />
      <g
        transform={`translate(${offset} ${offset}) scale(${scale})`}
        fill="none"
        stroke={APP_ICON_COLORS.glyph}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {WALLET_GLYPH_PATHS.map((path) => (
          <path key={path} d={path} />
        ))}
      </g>
    </svg>,
    { width: size, height: size },
  );
}
