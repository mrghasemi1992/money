import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCALE_COOKIE } from "@/constants/locale";
import { IP_TIME_ZONE_HEADER, TIME_ZONE_COOKIE } from "@/constants/time-zone";
import {
  resetServer,
  setRequestCookies,
  setRequestHeaders,
  signInAs,
} from "@/test/server";
import { negotiateLocale } from "@/utils/locale";

import { resolveLocale } from "./locale";
import { resolveTimeZone } from "./time-zone";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));

beforeEach(() => resetServer());

describe("negotiateLocale", () => {
  it("picks the supported language with the highest weight", () => {
    expect(negotiateLocale("en-GB,en;q=0.9,fa;q=0.8")).toBe("en");
    expect(negotiateLocale("de-DE,fa;q=0.9,en;q=0.8")).toBe("fa");
    expect(negotiateLocale("en;q=0.5,fa;q=0.7")).toBe("fa");
  });

  it("keeps the header's order for equal weights and skips q=0", () => {
    expect(negotiateLocale("en,fa")).toBe("en");
    expect(negotiateLocale("en;q=0,fa;q=0.1")).toBe("fa");
  });

  it("falls back to Persian", () => {
    expect(negotiateLocale(null)).toBe("fa");
    expect(negotiateLocale("de,fr;q=0.9")).toBe("fa");
    expect(negotiateLocale("en;q=abc")).toBe("fa");
  });
});

describe("resolveLocale", () => {
  it("uses the signed-in user's language over the cookie and the browser", async () => {
    signInAs("viewer", { locale: "en" });
    setRequestCookies({ [LOCALE_COOKIE]: "fa" });
    setRequestHeaders({ "accept-language": "fa" });
    expect(await resolveLocale()).toBe("en");
  });

  it("uses a visitor's saved language, then their browser's", async () => {
    setRequestCookies({ [LOCALE_COOKIE]: "en" });
    setRequestHeaders({ "accept-language": "fa" });
    expect(await resolveLocale()).toBe("en");

    setRequestCookies({ [LOCALE_COOKIE]: "klingon" });
    setRequestHeaders({ "accept-language": "en-US" });
    expect(await resolveLocale()).toBe("en");
  });
});

describe("resolveTimeZone", () => {
  it("uses the time zone the browser reported, then the IP's, then Tehran", async () => {
    setRequestCookies({ [TIME_ZONE_COOKIE]: "Europe/Berlin" });
    setRequestHeaders({ [IP_TIME_ZONE_HEADER]: "America/Toronto" });
    expect(await resolveTimeZone()).toBe("Europe/Berlin");

    setRequestCookies({ [TIME_ZONE_COOKIE]: "Not/AZone" });
    expect(await resolveTimeZone()).toBe("America/Toronto");

    setRequestHeaders({ [IP_TIME_ZONE_HEADER]: "nowhere" });
    expect(await resolveTimeZone()).toBe("Asia/Tehran");
  });
});
