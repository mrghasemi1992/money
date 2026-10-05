/**
 * "Today" follows the viewer's own device: the browser reports its OS time zone, saved in
 * this cookie so the server renders the same dates.
 */
export const TIME_ZONE_COOKIE = "money-time-zone";

/** One year, in seconds. */
export const TIME_ZONE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Until the browser has reported its time zone (the very first request) and nothing better is known. */
export const DEFAULT_TIME_ZONE = "Asia/Tehran";

/** Vercel sets this request header to the time zone of the visitor's IP address. */
export const IP_TIME_ZONE_HEADER = "x-vercel-ip-timezone";
