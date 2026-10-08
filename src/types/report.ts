import type { REPORT_PERIODS, REPORT_RECENT_MONTHS } from "@/constants/report";

import type { AccountType } from "./account";
import type { CalendarSystem } from "./calendar";
import type { CategoryColor } from "./category";

export type ReportPeriodKind = (typeof REPORT_PERIODS)[number];

export type RecentMonthsPeriod = keyof typeof REPORT_RECENT_MONTHS;

/** The period as the URL gives it, before it is resolved against today. */
export type ReportParams =
  | { kind: RecentMonthsPeriod }
  | {
      kind: "month";
      /** A month of the calendar its year belongs to (below 1700 Jalali). */
      month: { calendar: CalendarSystem; year: number; month: number };
    }
  | { kind: "custom"; from: string; to: string };

/** First and last ISO date, both included. */
export type DateRange = { from: string; to: string };

/** A month of the viewer's calendar with its Gregorian dates, cut to the period. */
export type ReportMonth = DateRange & {
  year: number;
  month: number;
  /** Today falls in it, so it runs only to today. */
  current: boolean;
};

/** The period the reports page shows, resolved in the viewer's calendar. */
export type ReportPeriod = DateRange & {
  kind: ReportPeriodKind;
  /** The month picked in the month period, otherwise null. */
  month: { year: number; month: number } | null;
  /** The month period shows the viewer's current month: there is no next one. */
  isCurrentMonth: boolean;
  /** The period runs to today, so the previous period stops at the same day. */
  toToday: boolean;
  /** The same stretch of time just before, for the comparison. */
  previous: DateRange;
  /** The months of the month-by-month chart, oldest first. */
  months: ReportMonth[];
};

/** Income and expense in a period, in the smallest unit. Transfers count in neither. */
export type ReportTotals = { income: number; expense: number };

/** A month of the chart with its totals. */
export type ReportMonthTotals = ReportMonth & ReportTotals;

/** A top-level category with its subcategories rolled up, as the reports list them. */
export type CategoryReportRow = {
  /** Null for the transactions without a category (Claude may save one before it is known). */
  id: string | null;
  /** Empty when id is null. */
  name: string;
  color: CategoryColor;
  /** The category and its subcategories together. */
  amount: number;
  /** Recorded on the category itself rather than a subcategory. */
  direct: number;
  /** Most first; only subcategories with transactions in the period. */
  subcategories: { id: string; name: string; amount: number }[];
};

/** Income and expense categories of a period, most first. */
export type CategoryReport = {
  income: CategoryReportRow[];
  expense: CategoryReportRow[];
};

/** An account and what was spent from it in the period. */
export type AccountReportRow = {
  id: string;
  name: string;
  type: AccountType;
  amount: number;
};

/** Everything the reports page shows for a period. */
export type ReportData = {
  totals: ReportTotals;
  previousTotals: ReportTotals;
  categories: CategoryReport;
  accounts: AccountReportRow[];
  months: ReportMonthTotals[];
};
