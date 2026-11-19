import { describe, expect, it } from "vitest";

import {
  compareAmounts,
  parseReportParams,
  recurringMinMonths,
  reportParamsToSearch,
  resolveReportPeriod,
  savingsRate,
} from "./report";

// 28 Aban 1405.
const TODAY = "2026-11-19";

describe("parseReportParams", () => {
  it("reads a range, then a month, then a number of months", () => {
    expect(
      parseReportParams(new URLSearchParams("from=2026-10-01&to=2026-09-01")),
    ).toEqual({ kind: "custom", from: "2026-09-01", to: "2026-10-01" });
    expect(parseReportParams({ month: "1405-07" })).toEqual({
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 7 },
    });
    expect(parseReportParams({ period: "12m" })).toEqual({ kind: "12m" });
    expect(parseReportParams({ period: "99m" })).toEqual({ kind: "6m" });
  });

  it("writes the period back, leaving the default out", () => {
    expect(reportParamsToSearch({ kind: "6m" })).toBe("");
    expect(reportParamsToSearch({ kind: "3m" })).toBe("?period=3m");
    expect(
      reportParamsToSearch({
        kind: "month",
        month: { calendar: "jalali", year: 1405, month: 7 },
      }),
    ).toBe("?month=1405-07");
  });
});

describe("resolveReportPeriod", () => {
  it("takes the last six Jalali months up to today, against the six before", () => {
    const period = resolveReportPeriod({ kind: "6m" }, "jalali", TODAY);
    expect(period).toMatchObject({
      // 1 Khordad 1405 to today.
      from: "2026-05-22",
      to: TODAY,
      toToday: true,
      // 1 Azar 1404 to 28 Ordibehesht 1405: the same days of the month.
      previous: { from: "2025-11-22", to: "2026-05-18" },
    });
    expect(period.months).toHaveLength(6);
  });

  it("compares a past month with the whole month before it", () => {
    expect(
      resolveReportPeriod(
        { kind: "month", month: { calendar: "jalali", year: 1405, month: 7 } },
        "jalali",
        TODAY,
      ),
    ).toMatchObject({
      from: "2026-09-23",
      to: "2026-10-22",
      isCurrentMonth: false,
      previous: { from: "2026-08-23", to: "2026-09-22" },
    });
  });

  it("compares the current month so far with the same days of the last one", () => {
    expect(
      resolveReportPeriod(
        { kind: "month", month: { calendar: "jalali", year: 1405, month: 8 } },
        "jalali",
        TODAY,
      ),
    ).toMatchObject({
      from: "2026-10-23",
      to: TODAY,
      isCurrentMonth: true,
      previous: { from: "2026-09-23", to: "2026-10-20" },
    });
  });

  it("turns a future month into the current one, and another calendar's month into the viewer's", () => {
    expect(
      resolveReportPeriod(
        { kind: "month", month: { calendar: "jalali", year: 1406, month: 1 } },
        "jalali",
        TODAY,
      ).month,
    ).toEqual({ year: 1405, month: 8 });
    expect(
      resolveReportPeriod(
        {
          kind: "month",
          month: { calendar: "gregorian", year: 2026, month: 10 },
        },
        "jalali",
        TODAY,
      ).month,
    ).toEqual({ year: 1405, month: 7 });
  });

  it("stops a custom range at today, with as many days before it to compare", () => {
    expect(
      resolveReportPeriod(
        { kind: "custom", from: "2026-11-10", to: "2027-01-01" },
        "gregorian",
        TODAY,
      ),
    ).toMatchObject({
      from: "2026-11-10",
      to: TODAY,
      previous: { from: "2026-10-31", to: "2026-11-09" },
    });
  });
});

describe("comparisons", () => {
  it("calls a change under half a percent the same", () => {
    expect(compareAmounts(1004, 1000)).toEqual({
      direction: "same",
      percent: 0,
    });
    expect(compareAmounts(1500, 1000)).toEqual({
      direction: "up",
      percent: 50,
    });
    expect(compareAmounts(500, 1000)).toEqual({
      direction: "down",
      percent: 50,
    });
    expect(compareAmounts(10, 0)).toEqual({ direction: "up", percent: null });
  });

  it("has no savings rate without income", () => {
    expect(savingsRate(1000, 750)).toBe(25);
    expect(savingsRate(1000, 1500)).toBe(-50);
    expect(savingsRate(0, 500)).toBeNull();
  });

  it("counts an expense as recurring in more than half the months", () => {
    expect(recurringMinMonths(3)).toBe(2);
    expect(recurringMinMonths(6)).toBe(4);
    expect(recurringMinMonths(12)).toBe(7);
  });
});
