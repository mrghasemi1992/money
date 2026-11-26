import { describe, expect, it } from "vitest";

import {
  seedAccount,
  seedCategory,
  seedConnection,
  seedTransaction,
  seedUser,
} from "@/test/integration/seed";

import { getBookProgress } from "./dashboard";

describe("getBookProgress", () => {
  it("starts with nothing set up", async () => {
    const userId = await seedUser();

    expect(await getBookProgress(userId)).toEqual({
      hasAccounts: false,
      hasCategories: false,
      hasTransactions: false,
      connectedClaude: false,
    });
  });

  it("doesn't count people and lenders as the book's accounts", async () => {
    const userId = await seedUser();
    const ali = await seedAccount({ name: "علی", type: "counterparty" });
    await seedTransaction({
      type: "receivable",
      amount: 1_000_000,
      date: "2026-10-01",
      accountId: ali,
      createdBy: userId,
    });

    expect(await getBookProgress(userId)).toMatchObject({
      hasAccounts: false,
      hasTransactions: true,
    });
  });

  it("sees an account, a category and this user's connection", async () => {
    const userId = await seedUser();
    const other = await seedUser({ name: "رضا" });
    await seedAccount({ type: "cash" });
    await seedCategory({ name: "خوراک" });
    await seedConnection(other);

    expect(await getBookProgress(userId)).toEqual({
      hasAccounts: true,
      hasCategories: true,
      hasTransactions: false,
      connectedClaude: false,
    });

    await seedConnection(userId);
    expect(await getBookProgress(userId)).toMatchObject({
      connectedClaude: true,
    });
  });
});
