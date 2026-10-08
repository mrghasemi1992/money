import type { BudgetCategory, BudgetMonth } from "@/types/budget";

/**
 * Expense categories for stories, in rials (Mehr 1405): six with a budget (ok, near the limit
 * and over), three without.
 */
export const SAMPLE_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a01",
    name: "خوراک",
    color: "orange",
    archived: false,
    subcategories: ["سوپرمارکت", "رستوران و کافه", "میوه و تره‌بار"],
    spent: 41200000,
    budget: 60000000,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a02",
    name: "حمل‌ونقل",
    color: "sky",
    archived: false,
    subcategories: ["تاکسی اینترنتی", "سوخت", "مترو و اتوبوس"],
    spent: 18900000,
    budget: 22000000,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a03",
    name: "خانه",
    color: "brown",
    archived: false,
    subcategories: ["اجاره", "قبوض", "تعمیرات"],
    spent: 189600000,
    budget: 250000000,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a04",
    name: "تفریح",
    color: "amber",
    archived: false,
    subcategories: ["سینما و تئاتر", "سفر"],
    spent: 24350000,
    budget: 20000000,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a05",
    name: "سلامت",
    color: "red",
    archived: false,
    subcategories: ["دارو", "پزشک"],
    spent: 6800000,
    budget: 15000000,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a06",
    name: "اشتراک‌ها",
    color: "violet",
    archived: false,
    subcategories: ["اینترنت", "سرویس‌های دیجیتال"],
    spent: 9800000,
    budget: 12000000,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a07",
    name: "پوشاک",
    color: "pink",
    archived: false,
    subcategories: ["لباس و کفش"],
    spent: 8400000,
    budget: null,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a08",
    name: "آموزش",
    color: "teal",
    archived: false,
    subcategories: ["کتاب", "کلاس و دوره"],
    spent: 0,
    budget: null,
  },
  {
    id: "5c1b0f6e-1d1a-4f6e-9a51-0a0f3c1e7a09",
    name: "هدیه",
    color: "lime",
    archived: false,
    subcategories: [],
    spent: 3500000,
    budget: null,
  },
];

/** Mehr 1405 on its 16th day (8 October 2026). */
export const SAMPLE_BUDGET_MONTH: BudgetMonth = {
  year: 1405,
  month: 7,
  from: "2026-09-23",
  to: "2026-10-22",
  phase: "current",
  days: 30,
  day: 16,
};
