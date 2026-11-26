import { beforeEach, describe, expect, it } from "vitest";

import type { DateRange } from "@/types/report";
import {
  seedAccount,
  seedBudget,
  seedCategory,
  seedNeverIncomeOrExpense,
  seedTransaction,
  seedUser,
} from "@/test/integration/seed";
import { monthRange } from "@/utils/calendar";

import {
  accountExpenseTotals,
  budgetRecord,
  categoryTotals,
  compareTotals,
  rangeTotals,
} from "./reports";

function jalaliMonth(month: number): DateRange {
  const { start, end } = monthRange("jalali", 1405, month);
  return { from: start, to: end };
}

const MORDAD = jalaliMonth(5);
const SHAHRIVAR = jalaliMonth(6);
const MEHR = jalaliMonth(7);

let ids: Record<"bank" | "cash" | "food" | "restaurant" | "transport", string>;

/*
 * Shahrivar and Mehr 1405 of a Jalali viewer, with transactions on the first and last day of
 * each month, one the day after Mehr, and transfers and debts in Mehr.
 */
beforeEach(async () => {
  const createdBy = await seedUser();
  const bank = await seedAccount({ name: "ملت", sortOrder: 0 });
  const cash = await seedAccount({ name: "نقد", type: "cash", sortOrder: 1 });
  const salary = await seedCategory({ name: "حقوق", type: "income" });
  const food = await seedCategory({ name: "خوراک" });
  const restaurant = await seedCategory({ name: "رستوران", parentId: food });
  const transport = await seedCategory({ name: "رفت‌وآمد" });
  ids = { bank, cash, food, restaurant, transport };

  const add = (
    type: "income" | "expense",
    amount: number,
    date: string,
    categoryId: string | null,
    accountId = bank,
  ) =>
    seedTransaction({ type, amount, date, accountId, categoryId, createdBy });

  // Shahrivar 1405: 2026-08-23 … 2026-09-22.
  await add("expense", 100_000, "2026-08-23", food);
  await add("income", 4_000_000, "2026-09-22", salary);
  // Mehr 1405: 2026-09-23 … 2026-10-22.
  await add("income", 5_000_000, "2026-09-23", salary);
  await add("expense", 250_000, "2026-10-05", transport, cash);
  await add("expense", 50_000, "2026-10-06", null);
  await add("expense", 400_000, "2026-10-10", restaurant);
  await add("expense", 1_000_000, "2026-10-22", food);
  await seedNeverIncomeOrExpense("2026-10-01", createdBy);
  // 1 Aban.
  await add("expense", 777_000, "2026-10-23", food);
});

it("uses the Gregorian dates of the Jalali months", () => {
  expect([MORDAD, SHAHRIVAR, MEHR]).toEqual([
    { from: "2026-07-23", to: "2026-08-22" },
    { from: "2026-08-23", to: "2026-09-22" },
    { from: "2026-09-23", to: "2026-10-22" },
  ]);
});

describe("compareTotals", () => {
  it("sums only income and expense of each month, first and last day included", async () => {
    expect(await compareTotals(MEHR, SHAHRIVAR)).toEqual({
      current: { income: 5_000_000, expense: 1_700_000 },
      previous: { income: 4_000_000, expense: 100_000 },
    });
  });
});

describe("rangeTotals", () => {
  it("gives every month in order, an empty month at zero", async () => {
    expect(await rangeTotals([MORDAD, SHAHRIVAR, MEHR])).toEqual([
      { income: 0, expense: 0 },
      { income: 4_000_000, expense: 100_000 },
      { income: 5_000_000, expense: 1_700_000 },
    ]);
  });
});

describe("categoryTotals", () => {
  it("rolls subcategories into their parent and puts the uncategorized in one row", async () => {
    expect(await categoryTotals(MEHR)).toEqual({
      income: [
        {
          id: expect.any(String),
          name: "حقوق",
          color: "teal",
          icon: "shapes",
          amount: 5_000_000,
          direct: 5_000_000,
          subcategories: [],
        },
      ],
      expense: [
        {
          id: ids.food,
          name: "خوراک",
          color: "teal",
          icon: "shapes",
          amount: 1_400_000,
          direct: 1_000_000,
          subcategories: [
            { id: ids.restaurant, name: "رستوران", amount: 400_000 },
          ],
        },
        {
          id: ids.transport,
          name: "رفت‌وآمد",
          color: "teal",
          icon: "shapes",
          amount: 250_000,
          direct: 250_000,
          subcategories: [],
        },
        {
          id: null,
          name: "",
          color: "slate",
          icon: null,
          amount: 50_000,
          direct: 50_000,
          subcategories: [],
        },
      ],
    });
  });
});

describe("accountExpenseTotals", () => {
  it("sums each account's expenses, leaving out accounts with only transfers and debts", async () => {
    expect(await accountExpenseTotals(MEHR)).toEqual([
      { id: ids.bank, name: "ملت", type: "bank", amount: 1_450_000 },
      { id: ids.cash, name: "نقد", type: "cash", amount: 250_000 },
    ]);
  });
});

describe("budgetRecord", () => {
  it("gives each budgeted category's spending per month, subcategories rolled up", async () => {
    await seedBudget(ids.food, 2_000_000);

    expect(await budgetRecord([SHAHRIVAR, MEHR])).toEqual([
      {
        id: ids.food,
        name: "خوراک",
        color: "teal",
        icon: "shapes",
        archived: false,
        budget: 2_000_000,
        spent: [100_000, 1_400_000],
      },
    ]);
  });
});
