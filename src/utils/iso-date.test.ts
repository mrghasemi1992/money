import { describe, expect, it } from "vitest";

import { addDays, daysBetween, isIsoDate, todayIso } from "./iso-date";

describe("todayIso", () => {
  // 20:45 UTC on 19 November 2026: already 20 November in Tehran (UTC+3:30), still the
  // 19th in London, and the afternoon of the 19th in Los Angeles.
  const lateEvening = new Date("2026-11-19T20:45:00Z");

  it("is the date in the viewer's time zone, not the server's", () => {
    expect(todayIso("Asia/Tehran", lateEvening)).toBe("2026-11-20");
    expect(todayIso("Europe/London", lateEvening)).toBe("2026-11-19");
    expect(todayIso("America/Los_Angeles", lateEvening)).toBe("2026-11-19");
  });

  it("turns over at the viewer's midnight", () => {
    // 20:29 and 20:30 UTC are 23:59 and 00:00 in Tehran.
    expect(todayIso("Asia/Tehran", new Date("2026-11-19T20:29:00Z"))).toBe(
      "2026-11-19",
    );
    expect(todayIso("Asia/Tehran", new Date("2026-11-19T20:30:00Z"))).toBe(
      "2026-11-20",
    );
  });
});

describe("ISO dates", () => {
  it("accepts only real dates written as YYYY-MM-DD", () => {
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("2026-1-05")).toBe(false);
    expect(isIsoDate("1405/07/16")).toBe(false);
  });

  it("counts days across month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-10-23", "2026-11-19")).toBe(27);
    expect(daysBetween("2026-11-19", "2026-10-23")).toBe(-27);
  });
});
