import { describe, expect, it } from "vitest";

import { db } from "@/db";
import { book } from "@/db/schema";
import {
  seedAccount,
  seedBudget,
  seedCategory,
  seedTransaction,
  seedUser,
} from "@/test/integration/seed";

import { bookHoldsAmounts, setBookCurrency } from "./book";

async function storedCurrency(): Promise<string | null> {
  const [row] = await db.select({ currency: book.currency }).from(book);
  return row?.currency ?? null;
}

describe("setBookCurrency", () => {
  it("creates the book's settings, then changes them, while the book holds no amounts", async () => {
    // Accounts with an opening balance of 0 and categories hold no amounts.
    await seedAccount({ openingBalance: 0 });
    await seedCategory({ name: "خوراک" });

    expect(await bookHoldsAmounts()).toBe(false);
    expect(await setBookCurrency("USD")).toBe(true);
    expect(await storedCurrency()).toBe("USD");
    expect(await setBookCurrency("EUR")).toBe(true);
    expect(await storedCurrency()).toBe("EUR");
  });

  it("refuses once the book has a transaction", async () => {
    await setBookCurrency("USD");
    const createdBy = await seedUser();
    const bank = await seedAccount();
    const food = await seedCategory({ name: "خوراک" });
    await seedTransaction({
      type: "expense",
      amount: 1_000,
      date: "2026-10-01",
      accountId: bank,
      categoryId: food,
      createdBy,
    });

    expect(await bookHoldsAmounts()).toBe(true);
    expect(await setBookCurrency("EUR")).toBe(false);
    expect(await storedCurrency()).toBe("USD");
  });

  it("refuses once the book has a budget", async () => {
    await seedBudget(await seedCategory({ name: "خوراک" }), 1_000);

    expect(await bookHoldsAmounts()).toBe(true);
    expect(await setBookCurrency("EUR")).toBe(false);
    expect(await storedCurrency()).toBe(null);
  });

  it("refuses once an account has an opening balance", async () => {
    await seedAccount({ openingBalance: -5_000 });

    expect(await bookHoldsAmounts()).toBe(true);
    expect(await setBookCurrency("EUR")).toBe(false);
    expect(await storedCurrency()).toBe(null);
  });
});
