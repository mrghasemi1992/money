import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The app icon from the design (assets/app-icon.svg), rendered to PNG: the Lucide wallet glyph
 * in white on a full-bleed royal-600 square. iOS applies its own rounded mask.
 */
export default function AppleIcon() {
  return new ImageResponse(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="180"
      height="180"
    >
      <rect width="64" height="64" fill="#223BB2" />
      <g
        transform="translate(17 17) scale(1.25)"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      </g>
    </svg>,
    size,
  );
}
