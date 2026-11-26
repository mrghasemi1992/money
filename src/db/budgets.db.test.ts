import { beforeEach, describe, expect, it } from "vitest";

import {
  seedAccount,
  seedBudget,
  seedCategory,
  seedNeverIncomeOrExpense,
  seedTransaction,
  seedUser,
} from "@/test/integration/seed";
import { monthRange } from "@/utils/calendar";

import { listBudgetCategories, saveBudget } from "./budgets";

let createdBy: string;
let bank: string;

beforeEach(async () => {
  createdBy = await seedUser();
  bank = await seedAccount();
});

const expense = (amount: number, date: string, categoryId: string) =>
  seedTransaction({
    type: "expense",
    amount,
    date,
    accountId: bank,
    categoryId,
    createdBy,
  });

describe("listBudgetCategories", () => {
  it("sums a Jalali month's expenses per category, subcategories rolled up, edges included", async () => {
    const mehr = monthRange("jalali", 1405, 7);
    expect(mehr).toEqual({ start: "2026-09-23", end: "2026-10-22" });

    const food = await seedCategory({ name: "خوراک" });
    const restaurant = await seedCategory({ name: "رستوران", parentId: food });
    const transport = await seedCategory({ name: "رفت‌وآمد" });
    const salary = await seedCategory({ name: "حقوق", type: "income" });
    await seedBudget(food, 3_000_000);

    await expense(999_000, "2026-09-22", food); // 31 Shahrivar
    await expense(100_000, "2026-09-23", food); // 1 Mehr
    await expense(400_000, "2026-10-10", restaurant);
    await expense(200_000, "2026-10-22", transport); // 30 Mehr
    await expense(888_000, "2026-10-23", transport); // 1 Aban
    await seedTransaction({
      type: "income",
      amount: 5_000_000,
      date: "2026-10-01",
      accountId: bank,
      categoryId: salary,
      createdBy,
    });
    await seedNeverIncomeOrExpense("2026-10-01", createdBy);

    expect(await listBudgetCategories(mehr.start, mehr.end)).toEqual([
      {
        id: food,
        name: "خوراک",
        color: "teal",
        icon: "shapes",
        archived: false,
        subcategories: ["رستوران"],
        spent: 500_000,
        budget: 3_000_000,
      },
      {
        id: transport,
        name: "رفت‌وآمد",
        color: "teal",
        icon: "shapes",
        archived: false,
        subcategories: [],
        spent: 200_000,
        budget: null,
      },
    ]);
  });
});

describe("saveBudget", () => {
  it("adds a budget, then changes it", async () => {
    const food = await seedCategory({ name: "خوراک" });

    expect(await saveBudget({ categoryId: food, amount: 1_000_000 })).toEqual({
      created: true,
    });
    expect(await saveBudget({ categoryId: food, amount: 2_000_000 })).toEqual({
      created: false,
    });
    const [row] = await listBudgetCategories("2026-10-01", "2026-10-31");
    expect(row.budget).toBe(2_000_000);
  });

  it("refuses a subcategory, an income category and an archived category without a budget", async () => {
    const food = await seedCategory({ name: "خوراک" });
    const restaurant = await seedCategory({ name: "رستوران", parentId: food });
    const salary = await seedCategory({ name: "حقوق", type: "income" });
    const old = await seedCategory({ name: "قدیمی", archived: true });

    for (const categoryId of [restaurant, salary, old]) {
      expect(await saveBudget({ categoryId, amount: 1_000_000 })).toBe(
        "missing",
      );
    }
  });

  it("still changes the budget of a category archived after it got one", async () => {
    const food = await seedCategory({ name: "خوراک", archived: true });
    await seedBudget(food, 1_000_000);

    expect(await saveBudget({ categoryId: food, amount: 2_000_000 })).toEqual({
      created: false,
    });
  });
});
