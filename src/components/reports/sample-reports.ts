import type {
  AccountReportRow,
  BudgetRecordRow,
  CategoryReport,
  CategoryReportRow,
  LargeTransaction,
  RecurringExpense,
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
      icon: "house",
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
      icon: "utensils",
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
      icon: "popcorn",
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
      icon: "car-front",
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
      icon: "repeat",
      amount: 10200000,
      direct: 10200000,
      subcategories: [],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000004",
      name: "سلامت",
      color: "red",
      icon: "heart-pulse",
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
      icon: null,
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
      icon: "briefcase-business",
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
      icon: "laptop",
      amount: 9800000,
      direct: 9800000,
      subcategories: [],
    },
    {
      id: "c0a80101-0000-4000-8000-000000000013",
      name: "سایر درآمدها",
      color: "slate",
      icon: "coins",
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

/** The expense categories of the 6 months before, for the biggest movers. */
export const SAMPLE_PREVIOUS_EXPENSES: CategoryReportRow[] = [
  {
    id: "c0a80101-0000-4000-8000-000000000003",
    name: "خانه",
    color: "brown",
    icon: "house",
    amount: 121800000,
    direct: 0,
    subcategories: [
      { id: "s-rent", name: "اجاره", amount: 108000000 },
      { id: "s-bills", name: "قبوض", amount: 9600000 },
      { id: "s-repairs", name: "تعمیرات", amount: 4200000 },
    ],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000001",
    name: "خوراک",
    color: "orange",
    icon: "utensils",
    amount: 33240000,
    direct: 1100000,
    subcategories: [
      { id: "s-grocery", name: "سوپرمارکت", amount: 19800000 },
      { id: "s-cafe", name: "رستوران و کافه", amount: 8140000 },
      { id: "s-fruit", name: "میوه و تره‌بار", amount: 4200000 },
    ],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000005",
    name: "تفریح",
    color: "amber",
    icon: "popcorn",
    amount: 41600000,
    direct: 0,
    subcategories: [
      { id: "s-travel", name: "سفر", amount: 37400000 },
      { id: "s-cinema", name: "سینما و تئاتر", amount: 4200000 },
    ],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000002",
    name: "حمل‌ونقل",
    color: "sky",
    icon: "car-front",
    amount: 18900000,
    direct: 0,
    subcategories: [
      { id: "s-taxi", name: "تاکسی اینترنتی", amount: 9900000 },
      { id: "s-fuel", name: "سوخت", amount: 7200000 },
      { id: "s-metro", name: "مترو و اتوبوس", amount: 1800000 },
    ],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000006",
    name: "اشتراک‌ها",
    color: "violet",
    icon: "repeat",
    amount: 10200000,
    direct: 10200000,
    subcategories: [],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000004",
    name: "سلامت",
    color: "red",
    icon: "heart-pulse",
    amount: 14160000,
    direct: 0,
    subcategories: [
      { id: "s-doctor", name: "پزشک", amount: 9800000 },
      { id: "s-pharmacy", name: "دارو", amount: 4360000 },
    ],
  },
];

/** Recurring expenses: each appears in the given months, counted back from the newest. */
const RECURRING: (Omit<RecurringExpense, "months"> & { every: number[] })[] = [
  {
    key: "اجاره خانه",
    description: "اجاره خانه",
    category: {
      name: "اجاره",
      parentName: "خانه",
      color: "brown",
      icon: "key-round",
    },
    every: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    count: 6,
    amount: 108000000,
  },
  {
    key: "خرید هفتگی",
    description: "خرید هفتگی",
    category: {
      name: "سوپرمارکت",
      parentName: "خوراک",
      color: "orange",
      icon: "shopping-cart",
    },
    every: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    count: 22,
    amount: 18700000,
  },
  {
    key: "اسنپ تا دفتر",
    description: "اسنپ تا دفتر",
    category: {
      name: "تاکسی اینترنتی",
      parentName: "حمل‌ونقل",
      color: "sky",
      icon: "car-taxi-front",
    },
    every: [0, 1, 2, 4, 5, 6, 8, 9, 10],
    count: 31,
    amount: 6900000,
  },
  {
    key: "اشتراک فیلم",
    description: "اشتراک فیلم",
    category: {
      name: "اشتراک‌ها",
      parentName: null,
      color: "violet",
      icon: "repeat",
    },
    every: [0, 1, 2, 3, 4, 5, 6, 7],
    count: 6,
    amount: 2400000,
  },
  {
    key: "قبض برق",
    description: "قبض برق",
    category: {
      name: "قبوض",
      parentName: "خانه",
      color: "brown",
      icon: "zap",
    },
    every: [1, 3, 5, 7, 9, 11],
    count: 3,
    amount: 4800000,
  },
  {
    key: "کافه",
    description: "کافه",
    category: null,
    every: [2, 3, 4, 5, 9],
    count: 9,
    amount: 3600000,
  },
];

/**
 * Sample recurring expenses for a period's months: `every` counts back from the newest month,
 * and an item is kept when it appears in more than half of them.
 */
export function sampleRecurring(months: ReportMonth[]): RecurringExpense[] {
  const count = months.length;
  return RECURRING.flatMap(({ every, ...item }) => {
    const positions = every
      .map((back) => count - 1 - back)
      .filter((position) => position >= 0)
      .sort((a, b) => a - b);
    return count >= 2 && positions.length > count / 2
      ? [{ ...item, months: positions }]
      : [];
  });
}

export const SAMPLE_LARGEST: LargeTransaction[] = [
  {
    id: "l-1",
    type: "expense",
    date: "2026-09-23",
    amount: 18000000,
    description: "اجاره مهر",
    account: "بانک ملی",
    category: {
      id: "s-rent",
      name: "اجاره",
      parentName: "خانه",
      color: "brown",
      icon: "key-round",
    },
  },
  {
    id: "l-2",
    type: "expense",
    date: "2026-08-14",
    amount: 12600000,
    description: "اقامت در رامسر",
    account: "بانک سامان",
    category: {
      id: "s-travel",
      name: "سفر",
      parentName: "تفریح",
      color: "amber",
      icon: "plane",
    },
  },
  {
    id: "l-3",
    type: "expense",
    date: "2026-07-02",
    amount: 9400000,
    description: "تعمیر یخچال",
    account: "بانک ملی",
    category: {
      id: "s-repairs",
      name: "تعمیرات",
      parentName: "خانه",
      color: "brown",
      icon: "wrench",
    },
  },
  {
    id: "l-4",
    type: "expense",
    date: "2026-09-30",
    amount: 6800000,
    description: "",
    account: "کیف پول نقدی",
    category: null,
  },
  {
    id: "l-5",
    type: "expense",
    date: "2026-06-11",
    amount: 5200000,
    description: "خرید ماهانه",
    account: "بانک سامان",
    category: {
      id: "s-grocery",
      name: "سوپرمارکت",
      parentName: "خوراک",
      color: "orange",
      icon: "shopping-cart",
    },
  },
  {
    id: "l-6",
    type: "income",
    date: "2026-09-22",
    amount: 45000000,
    description: "حقوق شهریور",
    account: "بانک ملی",
    category: {
      id: "s-salary",
      name: "حقوق ماهانه",
      parentName: "حقوق",
      color: "green",
      icon: "briefcase-business",
    },
  },
  {
    id: "l-7",
    type: "income",
    date: "2026-07-23",
    amount: 20000000,
    description: "پاداش نیمه سال",
    account: "بانک ملی",
    category: {
      id: "s-bonus",
      name: "پاداش",
      parentName: "حقوق",
      color: "green",
      icon: "gift",
    },
  },
  {
    id: "l-8",
    type: "income",
    date: "2026-08-05",
    amount: 6200000,
    description: "پروژه طراحی سایت",
    account: "بانک سامان",
    category: {
      id: "c0a80101-0000-4000-8000-000000000012",
      name: "کار آزاد",
      parentName: null,
      color: "lime",
      icon: "laptop",
    },
  },
];

/** Monthly spending of the budgeted categories, newest month last, repeating back in time. */
const BUDGET_SPENDING: (Omit<BudgetRecordRow, "spent"> & {
  spent: number[];
})[] = [
  {
    id: "c0a80101-0000-4000-8000-000000000001",
    name: "خوراک",
    color: "orange",
    icon: "utensils",
    archived: false,
    budget: 6500000,
    spent: [5900000, 7100000, 6200000, 5400000, 6900000, 4100000],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000002",
    name: "حمل‌ونقل",
    color: "sky",
    icon: "car-front",
    archived: false,
    budget: 3000000,
    spent: [2600000, 2900000, 2400000, 3300000, 2700000, 1600000],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000005",
    name: "تفریح",
    color: "amber",
    icon: "popcorn",
    archived: false,
    budget: 4000000,
    spent: [1200000, 15800000, 2100000, 3500000, 1900000, 800000],
  },
  {
    id: "c0a80101-0000-4000-8000-000000000006",
    name: "اشتراک‌ها",
    color: "violet",
    icon: "repeat",
    archived: false,
    budget: 2000000,
    spent: [1700000, 1700000, 1700000, 1700000, 1700000, 1700000],
  },
];

/** Sample budget record for a period's months: the spending pattern repeats back in time. */
export function sampleBudgetRecord(months: ReportMonth[]): BudgetRecordRow[] {
  return BUDGET_SPENDING.map(({ spent, ...row }) => ({
    ...row,
    spent: months.map(
      (_, index) =>
        spent[
          (((spent.length - months.length + index) % spent.length) +
            spent.length) %
            spent.length
        ],
    ),
  }));
}

/** An amount times `factor`, to the nearest 10,000 rials. */
function scaled(amount: number, factor: number): number {
  return Math.round((amount * factor) / 10000) * 10000;
}

/**
 * Sample category rows scaled by `factor` (a single month's share of the 6-month figures), so a
 * month story's categories add up to about its month's total. A category stays the sum of its
 * parts.
 */
export function scaleCategoryRows(
  rows: CategoryReportRow[],
  factor: number,
): CategoryReportRow[] {
  return rows.map((row) => {
    const subcategories = row.subcategories.map((sub) => ({
      ...sub,
      amount: scaled(sub.amount, factor),
    }));
    const direct = scaled(row.direct, factor);
    return {
      ...row,
      direct,
      subcategories,
      amount: direct + subcategories.reduce((sum, sub) => sum + sub.amount, 0),
    };
  });
}

/** Sample accounts scaled like scaleCategoryRows. */
export function scaleAccountRows(
  rows: AccountReportRow[],
  factor: number,
): AccountReportRow[] {
  return rows.map((row) => ({ ...row, amount: scaled(row.amount, factor) }));
}
