/** The app icon's background (royal-600, `--brand-*`) and glyph color, from assets/app-icon.svg. */
export const APP_ICON_COLORS = { background: "#223BB2", glyph: "#FFFFFF" };

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
