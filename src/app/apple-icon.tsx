import { appIconResponse } from "@/helpers/app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The app icon, full bleed: iOS applies its own rounded mask. */
export default function AppleIcon() {
  return appIconResponse(size.width, "full");
}
