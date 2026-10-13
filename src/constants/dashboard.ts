/** Transactions in the dashboard's recent list. */
export const DASHBOARD_RECENT_COUNT = 8;

/** Budgets the dashboard shows: the ones closest to or over their limit. */
export const DASHBOARD_BUDGET_COUNT = 4;

/** Slices of the month's spending: the largest categories, the rest as «سایر». */
export const DASHBOARD_SPENDING_SLICES = 5;

/**
 * The dashboard's unknown-transactions notice, once closed on this device: the cookie holds
 * what the notice said (`unknownNoticeKey`), so the server leaves it out until that changes.
 */
export const UNKNOWN_NOTICE_COOKIE = "money-unknown-closed";

/** One year, in seconds. */
export const UNKNOWN_NOTICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
