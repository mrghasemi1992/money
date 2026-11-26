import { beforeEach, describe, expect, it } from "vitest";

import { NO_TRANSACTION_FILTERS } from "@/helpers/transaction-filters";
import {
  seedAccount,
  seedCategory,
  seedNeverIncomeOrExpense,
  seedTransaction,
  seedUser,
} from "@/test/integration/seed";

import { transactionDayTotals, transactionTotals } from "./transactions";

let userId: string;

beforeEach(async () => {
  userId = await seedUser();
  const bank = await seedAccount({ name: "ملت" });
  const salary = await seedCategory({ name: "حقوق", type: "income" });
  const food = await seedCategory({ name: "خوراک" });
  await seedTransaction({
    type: "income",
    amount: 5_000_000,
    date: "2026-10-01",
    accountId: bank,
    categoryId: salary,
    createdBy: userId,
  });
  await seedTransaction({
    type: "expense",
    amount: 1_200_000,
    date: "2026-10-01",
    accountId: bank,
    categoryId: food,
    createdBy: userId,
  });
  // Unknown: an expense still to be identified, without a category.
  await seedTransaction({
    type: "expense",
    amount: 300_000,
    date: "2026-10-03",
    accountId: bank,
    createdBy: userId,
  });
  await seedNeverIncomeOrExpense("2026-10-02", userId);
});

describe("transactionTotals", () => {
  it("counts only income and expense in the totals, every transaction in the count", async () => {
    expect(
      await transactionTotals({
        ...NO_TRANSACTION_FILTERS,
        from: "2026-10-01",
        to: "2026-10-31",
      }),
    ).toEqual({ income: 5_000_000, expense: 1_500_000, count: 8 });
  });

  it("includes both ends of the range and nothing outside it", async () => {
    expect(
      await transactionTotals({
        ...NO_TRANSACTION_FILTERS,
        from: "2026-10-02",
        to: "2026-10-03",
      }),
    ).toEqual({ income: 0, expense: 300_000, count: 6 });
  });
});

describe("transactionDayTotals", () => {
  it("gives each day's totals, newest first, a day of transfers and debts at zero", async () => {
    expect(
      await transactionDayTotals({
        ...NO_TRANSACTION_FILTERS,
        from: "2026-10-01",
        to: "2026-10-31",
      }),
    ).toEqual([
      { date: "2026-10-03", income: 0, expense: 300_000, count: 1 },
      { date: "2026-10-02", income: 0, expense: 0, count: 5 },
      { date: "2026-10-01", income: 5_000_000, expense: 1_200_000, count: 2 },
    ]);
  });
});
