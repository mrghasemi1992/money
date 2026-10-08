import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import {
  DEFAULT_TIME_ZONE,
  IP_TIME_ZONE_HEADER,
  TIME_ZONE_COOKIE,
} from "@/constants/time-zone";
import { isTimeZone } from "@/utils/iso-date";

/**
 * The viewer's time zone for this request: what their browser reported (TimeZoneSync saves
 * the OS time zone in a cookie), otherwise the time zone of their IP address on Vercel,
 * otherwise Asia/Tehran.
 */
export const resolveTimeZone = cache(async (): Promise<string> => {
  const saved = await reportedTimeZone();
  if (saved) return saved;
  const fromIp = (await headers()).get(IP_TIME_ZONE_HEADER);
  if (fromIp && isTimeZone(fromIp)) return fromIp;
  return DEFAULT_TIME_ZONE;
});

/** The time zone the viewer's browser reported (TimeZoneSync's cookie), or null. */
export async function reportedTimeZone(): Promise<string | null> {
  const saved = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return saved && isTimeZone(saved) ? saved : null;
}
