import { ImageResponse } from "next/og";

import { APP_ICON_COLORS, WALLET_GLYPH_PATHS } from "@/constants/app-icon";
import {
  STARTUP_MARK_SIZE,
  type StartupImage,
} from "@/constants/startup-image";
import { THEME_BRAND_COLORS, THEME_PAGE_COLORS } from "@/constants/theme";

/**
 * The launch screen of the installed app on iOS: the mark (drawn like LogoMark: the brand tile
 * with the wallet glyph) in the middle of the theme's page surface, as a PNG of the screen's size.
 */
export function startupImageResponse({
  width,
  height,
  ratio,
  theme,
}: StartupImage) {
  const mark = STARTUP_MARK_SIZE * ratio;
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: THEME_PAGE_COLORS[theme],
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={mark}
        height={mark}
      >
        <rect width="64" height="64" rx="16" fill={THEME_BRAND_COLORS[theme]} />
        <g
          transform="translate(14 14) scale(1.5)"
          fill="none"
          stroke={APP_ICON_COLORS.glyph}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {WALLET_GLYPH_PATHS.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>
      </svg>
    </div>,
    { width, height },
  );
}
