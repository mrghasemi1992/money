import { describe, expect, it } from "vitest";

import {
  daysInMonth,
  fromCalendarDate,
  isValidCalendarDate,
  monthRange,
  shiftMonth,
  toCalendarDate,
} from "./calendar";

describe("Jalali and Gregorian dates", () => {
  it("converts both ways", () => {
    expect(toCalendarDate("2026-03-21", "jalali")).toEqual({
      year: 1405,
      month: 1,
      day: 1,
    });
    expect(fromCalendarDate({ year: 1405, month: 7, day: 16 }, "jalali")).toBe(
      "2026-10-08",
    );
    expect(toCalendarDate("2026-10-08", "gregorian")).toEqual({
      year: 2026,
      month: 10,
      day: 8,
    });
  });

  it("knows the length of each month, leap years included", () => {
    expect(daysInMonth("jalali", 1405, 1)).toBe(31);
    expect(daysInMonth("jalali", 1405, 7)).toBe(30);
    expect(daysInMonth("jalali", 1405, 12)).toBe(29);
    expect(daysInMonth("jalali", 1403, 12)).toBe(30);
    expect(daysInMonth("gregorian", 2028, 2)).toBe(29);
  });

  it("refuses dates that don't exist", () => {
    expect(
      isValidCalendarDate({ year: 1405, month: 12, day: 30 }, "jalali"),
    ).toBe(false);
    expect(
      isValidCalendarDate({ year: 1405, month: 13, day: 1 }, "jalali"),
    ).toBe(false);
    expect(
      isValidCalendarDate({ year: 2026, month: 2, day: 29 }, "gregorian"),
    ).toBe(false);
    expect(
      isValidCalendarDate({ year: 1403, month: 12, day: 30 }, "jalali"),
    ).toBe(true);
  });
});

describe("monthRange", () => {
  it("gives a Jalali month as Gregorian dates, for the queries", () => {
    expect(monthRange("jalali", 1405, 7)).toEqual({
      start: "2026-09-23",
      end: "2026-10-22",
    });
    expect(monthRange("jalali", 1405, 12)).toEqual({
      start: "2027-02-20",
      end: "2027-03-20",
    });
    expect(monthRange("gregorian", 2026, 2)).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
  });

  it("shifts months across years", () => {
    expect(shiftMonth(1405, 1, -1)).toEqual({ year: 1404, month: 12 });
    expect(shiftMonth(1405, 12, 1)).toEqual({ year: 1406, month: 1 });
  });
});
