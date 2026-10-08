/** Periods the reports page offers: one month, the last 3, 6 or 12 months, or a custom range. */
export const REPORT_PERIODS = ["month", "3m", "6m", "12m", "custom"] as const;

/** Periods of whole months up to the current one, and how many months each covers. */
export const REPORT_RECENT_MONTHS = { "3m": 3, "6m": 6, "12m": 12 } as const;

/** What /reports shows without a period in the URL. */
export const DEFAULT_REPORT_PERIOD = "6m";

/** Search params of /reports. `month`, `from` and `to` read like the transactions page's. */
export const REPORT_PARAMS = {
  period: "period",
  month: "month",
  from: "from",
  to: "to",
} as const;

/** Months the month-by-month chart shows around a single month: the five before it and itself. */
export const REPORT_TREND_MONTHS = 6;

/** Longest custom range, in months of the viewer's calendar; an earlier start is moved up. */
export const REPORT_MAX_MONTHS = 36;

/** A change smaller than this (in percent) reads «بدون تغییر» / «No change». */
export const REPORT_SAME_PERCENT = 0.5;
