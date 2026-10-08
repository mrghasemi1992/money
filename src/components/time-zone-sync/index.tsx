"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  TIME_ZONE_COOKIE,
  TIME_ZONE_COOKIE_MAX_AGE,
} from "@/constants/time-zone";
import { usePreferences } from "@/hooks/use-preferences";
import { systemTimeZone } from "@/utils/iso-date";

/** The time zone cookie's value in this browser, or null. */
function savedTimeZone(): string | null {
  const prefix = `${TIME_ZONE_COOKIE}=`;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

/**
 * Renders nothing. Saves the device's OS time zone in a cookie, so «today» on the server is
 * the viewer's today (and, through the user record, the Claude connector's). When the page was
 * rendered with another time zone (the first visit, or after travelling or changing the OS
 * setting), renders it again with the right one.
 */
export function TimeZoneSync() {
  const router = useRouter();
  const { timeZone } = usePreferences();

  useEffect(() => {
    const current = systemTimeZone();
    if (!current) return;
    if (savedTimeZone() !== current) {
      document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(current)}; path=/; max-age=${TIME_ZONE_COOKIE_MAX_AGE}; samesite=lax`;
    }
    if (current !== timeZone) router.refresh();
  }, [router, timeZone]);

  return null;
}
