import type { Theme } from "@/types/theme";

/** The iOS startup images, served by src/app/startup-images/[file]/route.tsx. */
export const STARTUP_IMAGES_PATH = "/startup-images";

/** The side of the mark in the middle of the launch screen, in points (CSS pixels). */
export const STARTUP_MARK_SIZE = 96;

/**
 * iPhone screens in points, with their pixel ratio. iOS shows a startup image only when its
 * size matches the screen's pixels exactly, so a new screen size needs a new entry here.
 */
const IPHONE_SCREENS = [
  { width: 440, height: 956, ratio: 3 }, // 16 Pro Max, 17 Pro Max
  { width: 420, height: 912, ratio: 3 }, // Air
  { width: 402, height: 874, ratio: 3 }, // 16 Pro, 17, 17 Pro
  { width: 430, height: 932, ratio: 3 }, // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  { width: 393, height: 852, ratio: 3 }, // 14 Pro, 15, 15 Pro, 16
  { width: 428, height: 926, ratio: 3 }, // 12 Pro Max, 13 Pro Max, 14 Plus
  { width: 390, height: 844, ratio: 3 }, // 12, 12 Pro, 13, 13 Pro, 14, 16e
  { width: 375, height: 812, ratio: 3 }, // X, XS, 11 Pro, 12 mini, 13 mini
  { width: 414, height: 896, ratio: 3 }, // XS Max, 11 Pro Max
  { width: 414, height: 896, ratio: 2 }, // XR, 11
  { width: 414, height: 736, ratio: 3 }, // 8 Plus
  { width: 375, height: 667, ratio: 2 }, // 8, SE (2nd and 3rd generation)
];

const ORIENTATIONS = ["portrait", "landscape"] as const;
const THEMES: Theme[] = ["light", "dark"];

export type StartupImage = {
  /** File name, e.g. `dark-1179x2556.png`. */
  file: string;
  /** Size in pixels. */
  width: number;
  height: number;
  ratio: number;
  theme: Theme;
  /** When iOS picks it: the screen, the orientation and the system's light or dark mode. */
  media: string;
};

/**
 * One startup image per iPhone screen, orientation and theme. iOS picks the theme from the
 * system's appearance (prefers-color-scheme), not from the theme chosen in Money.
 */
export const STARTUP_IMAGES: StartupImage[] = IPHONE_SCREENS.flatMap((screen) =>
  ORIENTATIONS.flatMap((orientation) =>
    THEMES.map((theme) => {
      const portrait = orientation === "portrait";
      const width = (portrait ? screen.width : screen.height) * screen.ratio;
      const height = (portrait ? screen.height : screen.width) * screen.ratio;
      return {
        file: `${theme}-${width}x${height}.png`,
        width,
        height,
        ratio: screen.ratio,
        theme,
        // device-width and device-height stay the portrait ones in landscape.
        media: [
          `(device-width: ${screen.width}px)`,
          `(device-height: ${screen.height}px)`,
          `(-webkit-device-pixel-ratio: ${screen.ratio})`,
          `(orientation: ${orientation})`,
          `(prefers-color-scheme: ${theme})`,
        ].join(" and "),
      };
    }),
  ),
);
