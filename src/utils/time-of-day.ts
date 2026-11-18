/*
 * Times of day as `HH:MM` strings (24-hour, Latin digits, "09:05"), the form a transaction's
 * time travels in through the app. No date and no time zone: the local time as written.
 */

import { toLatinDigits } from "./number";

/** Hours and minutes, optional seconds (dropped), any digits, «:» «٫» «.» between them. */
const TYPED_TIME = /^(\d{1,2})\s*[:٫.]\s*(\d{2})(?:\s*[:٫.]\s*\d{2})?$/;

/** True for a time written as `HH:MM`, 00:00 to 23:59. */
export function isTimeOfDay(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/**
 * Reads a typed or copied time ("9:05", "۰۹:۰۵", "14:30:12", "21.40") as `HH:MM`. Returns null
 * when it isn't a time of day.
 */
export function parseTimeOfDay(text: string): string | null {
  const match = TYPED_TIME.exec(toLatinDigits(text.trim()));
  if (!match) return null;
  const time = `${match[1].padStart(2, "0")}:${match[2]}`;
  return isTimeOfDay(time) ? time : null;
}
