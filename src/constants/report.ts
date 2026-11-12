import type { Route } from "next";

/** Periods the reports page offers: one month, the last 3, 6 or 12 months, or a custom range. */
export const REPORT_PERIODS = ["month", "3m", "6m", "12m", "custom"] as const;

/** Periods of whole months up to the current one, and how many months each covers. */
export const REPORT_RECENT_MONTHS = { "3m": 3, "6m": 6, "12m": 12 } as const;

/** What /reports shows without a period in the URL. */
export const DEFAULT_REPORT_PERIOD = "6m";

/**
 * The reports page's tabs, each its own page with its own queries: the findings (/reports),
 * where the money went (/reports/breakdown) and how it moved over time (/reports/trends). They
 * keep the period's search params.
 */
export const REPORT_SECTIONS = ["overview", "breakdown", "trends"] as const;

export const REPORT_SECTION_PATHS = {
  overview: "/reports",
  breakdown: "/reports/breakdown",
  trends: "/reports/trends",
} as const satisfies Record<(typeof REPORT_SECTIONS)[number], Route>;

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

/** Categories the «biggest movers» card ranks by how much their spending changed. */
export const REPORT_MOVERS_COUNT = 5;

/**
 * An expense description is recurring when it appears in more than this share of the months
 * shown (and in at least REPORT_RECURRING_MIN_MONTHS of them): 2 of 3, 4 of 6, 7 of 12.
 */
export const REPORT_RECURRING_SHARE = 0.5;
export const REPORT_RECURRING_MIN_MONTHS = 2;

/** Recurring expenses the card lists, those in the most months first. */
export const REPORT_RECURRING_COUNT = 8;

/** The largest expenses and incomes of the period the card lists, of each type. */
export const REPORT_LARGEST_COUNT = 5;

/** The savings rate chart stops at −100%: a month that spent far more shows its real rate in words. */
export const REPORT_SAVINGS_FLOOR = -100;
