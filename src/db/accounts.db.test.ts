import { beforeEach, describe, expect, it } from "vitest";

import {
  seedAccount,
  seedCategory,
  seedTransaction,
  seedUser,
} from "@/test/integration/seed";

import { listAccounts } from "./accounts";

let userId: string;

beforeEach(async () => {
  userId = await seedUser();
});

async function balances(): Promise<Record<string, number>> {
  return Object.fromEntries(
    (await listAccounts()).map((account) => [account.name, account.balance]),
  );
}

describe("listAccounts' balances (accountBalance)", () => {
  it("start from the opening balance, add income and subtract expense", async () => {
    const bank = await seedAccount({ name: "ملت", openingBalance: 1_000_000 });
    await seedAccount({ name: "نقد", type: "cash", openingBalance: -50_000 });
    const salary = await seedCategory({ name: "حقوق", type: "income" });
    const food = await seedCategory({ name: "خوراک" });
    await seedTransaction({
      type: "income",
      amount: 500_000,
      date: "2026-10-01",
      accountId: bank,
      categoryId: salary,
      createdBy: userId,
    });
    await seedTransaction({
      type: "expense",
      amount: 200_000,
      date: "2026-10-02",
      accountId: bank,
      categoryId: food,
      createdBy: userId,
    });

    expect(await balances()).toEqual({ ملت: 1_300_000, نقد: -50_000 });
  });

  it("move a transfer from one account to the other without changing their total", async () => {
    const bank = await seedAccount({ name: "ملت", openingBalance: 1_000_000 });
    const cash = await seedAccount({ name: "نقد", type: "cash" });
    await seedTransaction({
      type: "transfer",
      amount: 300_000,
      date: "2026-10-01",
      accountId: bank,
      toAccountId: cash,
      createdBy: userId,
    });

    expect(await balances()).toEqual({ ملت: 700_000, نقد: 300_000 });
  });

  it("make a counterparty's balance what they owe the book", async () => {
    const bank = await seedAccount({ name: "ملت" });
    const ali = await seedAccount({ name: "علی", type: "counterparty" });
    const food = await seedCategory({ name: "خوراک" });
    // Lent 2,000,000 to Ali, who paid 500,000 back.
    await seedTransaction({
      type: "transfer",
      amount: 2_000_000,
      date: "2026-10-01",
      accountId: bank,
      toAccountId: ali,
      createdBy: userId,
    });
    await seedTransaction({
      type: "transfer",
      amount: 500_000,
      date: "2026-10-05",
      accountId: ali,
      toAccountId: bank,
      createdBy: userId,
    });
    // An old debt of his, and one the book owes him.
    await seedTransaction({
      type: "receivable",
      amount: 1_000_000,
      date: "2025-01-01",
      accountId: ali,
      createdBy: userId,
    });
    await seedTransaction({
      type: "payable",
      amount: 300_000,
      date: "2025-02-01",
      accountId: ali,
      createdBy: userId,
    });
    // He paid for dinner.
    await seedTransaction({
      type: "expense",
      amount: 100_000,
      date: "2026-10-06",
      accountId: ali,
      categoryId: food,
      createdBy: userId,
    });

    expect(await balances()).toEqual({ ملت: -1_500_000, علی: 2_100_000 });
  });

  it("count a transfer's transactions and first date on both accounts", async () => {
    const bank = await seedAccount({ name: "ملت" });
    const cash = await seedAccount({ name: "نقد", type: "cash" });
    await seedAccount({ name: "سایر", type: "other" });
    await seedTransaction({
      type: "transfer",
      amount: 300_000,
      date: "2026-10-01",
      accountId: bank,
      toAccountId: cash,
      createdBy: userId,
    });
    await seedTransaction({
      type: "transfer",
      amount: 100_000,
      date: "2026-09-01",
      accountId: cash,
      toAccountId: bank,
      createdBy: userId,
    });

    const summary = (await listAccounts()).map(
      ({ name, transactionCount, firstDate }) => ({
        name,
        transactionCount,
        firstDate,
      }),
    );
    expect(summary).toEqual([
      { name: "ملت", transactionCount: 2, firstDate: "2026-09-01" },
      { name: "نقد", transactionCount: 2, firstDate: "2026-09-01" },
      { name: "سایر", transactionCount: 0, firstDate: null },
    ]);
  });
});
