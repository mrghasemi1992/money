import type { Locale } from "@/types/locale";

import { toLocaleDigits } from "./number";

/** Seconds as minutes:seconds for countdowns: 299 → "۴:۵۹" (fa) or "4:59" (en). */
export function formatCountdown(totalSeconds: number, locale: Locale): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return toLocaleDigits(`${minutes}:${rest}`, locale);
}
