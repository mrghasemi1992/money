/** The app icon's background (royal-600, `--brand-*`) and glyph color, from assets/app-icon.svg. */
export const APP_ICON_COLORS = { background: "#223BB2", glyph: "#FFFFFF" };

/**
 * Lucide's wallet glyph (ISC, 24 units), drawn by the PNG icons and the iOS startup images.
 * LogoMark draws the same paths in the interface.
 */
export const WALLET_GLYPH_PATHS = [
  "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
  "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
];

/** The PNG icons of the web app manifest, served by src/app/app-icons/[file]/route.tsx. */
export const APP_ICONS_PATH = "/app-icons";

/**
 * «any»: rounded corners and a large glyph, like icon.svg. «maskable»: full bleed with the glyph
 * inside the safe zone (the middle 80% circle), for Android launchers that cut their own shape.
 */
export const APP_ICONS = [
  { file: "icon-192.png", size: 192, purpose: "any" },
  { file: "icon-512.png", size: 512, purpose: "any" },
  { file: "maskable-512.png", size: 512, purpose: "maskable" },
] as const;
