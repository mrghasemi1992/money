import { toPersianDigits } from "./number";

/** Seconds as minutes:seconds in Persian digits, for countdowns: 299 → "۴:۵۹". */
export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return toPersianDigits(`${minutes}:${rest}`);
}
