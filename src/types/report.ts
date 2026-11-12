import type {
  REPORT_PERIODS,
  REPORT_RECENT_MONTHS,
  REPORT_SECTIONS,
} from "@/constants/report";

import type { AccountType } from "./account";
import type { CalendarSystem } from "./calendar";
import type { CategoryColor, CategoryIcon } from "./category";

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
  /** Null when id is null. */
  icon: CategoryIcon | null;
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

/** The category of an insight's row, as a transaction row names it: «خوراک / رستوران». */
export type ReportCategoryRef = {
  name: string;
  /** Set for a subcategory: the category it belongs to. */
  parentName: string | null;
  color: CategoryColor;
  icon: CategoryIcon;
};

/** A top-level expense category's spending in the period and the one before, for the movers. */
export type CategoryMover = {
  /** Null for the expenses without a category. */
  id: string | null;
  /** Empty when id is null. */
  name: string;
  color: CategoryColor;
  icon: CategoryIcon | null;
  current: number;
  previous: number;
  /** Its subcategories (and «بدون زیردسته») in either period, the largest change first. */
  subcategories: {
    id: string;
    name: string;
    current: number;
    previous: number;
  }[];
};

/** An expense description that comes back in most months of the period. */
export type RecurringExpense = {
  /** The description folded (case, Arabic letters, spaces): what the rows were grouped by. */
  key: string;
  /** The description as most of its rows write it. */
  description: string;
  /** The category most of its rows have; null when most have none. */
  category: ReportCategoryRef | null;
  /** Positions in the period's months (0 = the oldest) that have it. */
  months: number[];
  /** Transactions and their total over the whole period. */
  count: number;
  amount: number;
};

/** One of the largest incomes or expenses of the period. */
export type LargeTransaction = {
  id: string;
  type: "income" | "expense";
  date: string;
  amount: number;
  description: string;
  account: string;
  /** Null for an unknown transaction (no category yet). */
  category: (ReportCategoryRef & { id: string }) | null;
};

/** A budgeted category and what it spent in each month of the period. */
export type BudgetRecordRow = {
  id: string;
  name: string;
  color: CategoryColor;
  icon: CategoryIcon;
  archived: boolean;
  /** Its monthly limit today: budgets keep no history, so every month is held to it. */
  budget: number;
  /** One per month of the period, oldest first, subcategories rolled up. */
  spent: number[];
};

/** One of the reports page's tabs. */
export type ReportSection = (typeof REPORT_SECTIONS)[number];

/** The overview tab: the totals against the previous period and the findings. */
export type ReportOverviewData = {
  totals: ReportTotals;
  previousTotals: ReportTotals;
  /** The expense categories of the period and of the previous one, for the biggest movers. */
  expenses: CategoryReportRow[];
  previousExpenses: CategoryReportRow[];
  recurring: RecurringExpense[];
  largest: LargeTransaction[];
};

/** The breakdown tab: income and expense by category, spending by account. */
export type ReportBreakdownData = {
  categories: CategoryReport;
  accounts: AccountReportRow[];
};

/** The over-time tab: the chart's months and the budget record over them. */
export type ReportTrendsData = {
  months: ReportMonthTotals[];
  budgets: BudgetRecordRow[];
};

/** What one tab of the reports page shows for a period. */
export type ReportContent =
  | { section: "overview"; data: ReportOverviewData }
  | { section: "breakdown"; data: ReportBreakdownData }
  | { section: "trends"; data: ReportTrendsData };
