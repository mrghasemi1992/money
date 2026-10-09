import type {
  AccountReportRow,
  CategoryReport,
  ReportMonth,
  ReportMonthTotals,
  ReportTotals,
} from "@/types/report";

/*
 * Report figures for stories, in rials: a household book from Ordibehesht to the middle of
 * Mehr 1405 (the last 6 months up to 8 October 2026).
 */

/** The stories' today: 8 October 2026 (16 Mehr 1405). */
export const SAMPLE_REPORT_TODAY = "2026-10-08";

export const SAMPLE_REPORT_TOTALS: ReportTotals = {
  income: 302400000,
  expense: 242400000,
};

/** The 6 months before, cut at the same day of the month. */
export const SAMPLE_PREVIOUS_TOTALS: ReportTotals = {
  income: 281700000,
  expense: 251900000,
};

export const SAMPLE_CATEGORY_REPORT: CategoryReport = {
  expense: [
    {
      id: "c0a80101-0000-4000-8000-000000000003",
      name: "خانه",
      color: "brown",
      amount: 132600000,
      direct: 0,
      subcategories: [
        { id: "s-rent", name: "اجاره", amount: 108000000 },
        { id: "s-bills", name: "قبوض", amount: 10200000 },
        { id: "s-repairs", name: "تعمیرات", amount: 14400000 },
      ],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000001",
      name: "خوراک",
      color: "orange",
      amount: 37440000,
      direct: 1260000,
      subcategories: [
        { id: "s-grocery", name: "سوپرمارکت", amount: 20520000 },
        { id: "s-cafe", name: "رستوران و کافه", amount: 11460000 },
        { id: "s-fruit", name: "میوه و تره‌بار", amount: 4200000 },
      ],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000005",
      name: "تفریح",
      color: "amber",
      amount: 25300000,
      direct: 0,
      subcategories: [
        { id: "s-travel", name: "سفر", amount: 20500000 },
        { id: "s-cinema", name: "سینما و تئاتر", amount: 4800000 },
      ],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000002",
      name: "حمل‌ونقل",
      color: "sky",
      amount: 16320000,
      direct: 0,
      subcategories: [
        { id: "s-taxi", name: "تاکسی اینترنتی", amount: 8280000 },
        { id: "s-fuel", name: "سوخت", amount: 6240000 },
        { id: "s-metro", name: "مترو و اتوبوس", amount: 1800000 },
      ],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000006",
      name: "اشتراک‌ها",
      color: "violet",
      amount: 10200000,
      direct: 10200000,
      subcategories: [],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000004",
      name: "سلامت",
      color: "red",
      amount: 7740000,
      direct: 0,
      subcategories: [
        { id: "s-doctor", name: "پزشک", amount: 3600000 },
        { id: "s-pharmacy", name: "دارو", amount: 4140000 },
      ],
    },
    {
      id: null,
      name: "",
      color: "slate",
      amount: 12800000,
      direct: 12800000,
      subcategories: [],
    },
  ],
  income: [
    {
      id: "c0a80101-0000-4000-8000-000000000011",
      name: "حقوق",
      color: "green",
      amount: 290000000,
      direct: 0,
      subcategories: [
        { id: "s-salary", name: "حقوق ماهانه", amount: 270000000 },
        { id: "s-bonus", name: "پاداش", amount: 20000000 },
      ],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000012",
      name: "کار آزاد",
      color: "lime",
      amount: 9800000,
      direct: 9800000,
      subcategories: [],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000013",
      name: "سایر درآمدها",
      color: "slate",
      amount: 2600000,
      direct: 0,
      subcategories: [
        { id: "s-gift", name: "هدیه", amount: 2000000 },
        { id: "s-refund", name: "بازپرداخت", amount: 600000 },
      ],
    },
  ],
};

export const SAMPLE_ACCOUNT_REPORT: AccountReportRow[] = [
  {
    id: "a0a80101-0000-4000-8000-000000000001",
    name: "بانک ملی",
    type: "bank",
    amount: 160300000,
  },
  {
    id: "a0a80101-0000-4000-8000-000000000002",
    name: "بانک سامان",
    type: "bank",
    amount: 60100000,
  },
  {
    id: "a0a80101-0000-4000-8000-000000000003",
    name: "کیف پول نقدی",
    type: "cash",
    amount: 22000000,
  },
];

/** A year of monthly figures; a period's months take the last ones, so the newest is last. */
const MONTHLY: ReportTotals[] = [
  { income: 48300000, expense: 44200000 },
  { income: 45000000, expense: 61400000 },
  { income: 52800000, expense: 40100000 },
  { income: 45000000, expense: 37800000 },
  { income: 70600000, expense: 46900000 },
  { income: 45900000, expense: 42300000 },
  { income: 46200000, expense: 41800000 },
  { income: 54500000, expense: 38900000 },
  { income: 45600000, expense: 52700000 },
  { income: 66100000, expense: 40300000 },
  { income: 45000000, expense: 39600000 },
  { income: 45000000, expense: 29100000 },
];

/** Sample figures for a period's months, newest month last (the running one is smallest). */
export function sampleMonthTotals(months: ReportMonth[]): ReportMonthTotals[] {
  return months.map((month, index) => ({
    ...month,
    ...MONTHLY[(MONTHLY.length - months.length + index) % MONTHLY.length],
  }));
}
