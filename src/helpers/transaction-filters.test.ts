import { describe, expect, it } from "vitest";

import {
  countFilters,
  parseTransactionParams,
  resolveTransactionPeriod,
  transactionParamsToSearch,
} from "./transaction-filters";

const ACCOUNT = "6F1C1F9E-1B2A-4C3D-8E4F-5A6B7C8D9E0F";
const TODAY = "2026-11-19";

describe("parseTransactionParams", () => {
  it("reads every filter and drops what isn't valid", () => {
    const params = parseTransactionParams(
      new URLSearchParams(
        `month=1405-07&type=expense&type=bogus&account=${ACCOUNT}&category=1;drop&tag=%20سفر%20&q=%20نان%20&unknown=1`,
      ),
    );
    expect(params).toEqual({
      month: { calendar: "jalali", year: 1405, month: 7 },
      from: null,
      to: null,
      types: ["expense"],
      accountId: ACCOUNT.toLowerCase(),
      categoryId: null,
      tag: "سفر",
      createdBy: null,
      search: "نان",
      unknownOnly: true,
    });
  });

  it("puts a reversed range in order and refuses month 13", () => {
    expect(
      parseTransactionParams({
        from: "2026-11-01",
        to: "2026-10-01",
        month: "1405-13",
      }),
    ).toMatchObject({ from: "2026-10-01", to: "2026-11-01", month: null });
  });

  it("writes the same filters back", () => {
    const query = `?month=1405-07&type=expense&account=${ACCOUNT.toLowerCase()}&unknown=1`;
    const params = parseTransactionParams(new URLSearchParams(query));
    expect(transactionParamsToSearch(params)).toBe(query);
    expect(countFilters(params)).toBe(3);
  });
});

describe("resolveTransactionPeriod", () => {
  const empty = parseTransactionParams({});

  it("shows the viewer's current month without a period", () => {
    expect(resolveTransactionPeriod(empty, "jalali", TODAY)).toEqual({
      kind: "month",
      year: 1405,
      month: 8,
      from: "2026-10-23",
      to: "2026-11-21",
      isCurrent: true,
    });
  });

  it("shows a month of the other calendar as its dates", () => {
    expect(
      resolveTransactionPeriod(
        parseTransactionParams({ month: "2026-10" }),
        "jalali",
        TODAY,
      ),
    ).toEqual({ kind: "range", from: "2026-10-01", to: "2026-10-31" });
  });

  it("marks a past month as not current", () => {
    expect(
      resolveTransactionPeriod(
        parseTransactionParams({ month: "1405-07" }),
        "jalali",
        TODAY,
      ),
    ).toMatchObject({ kind: "month", isCurrent: false });
  });
});
