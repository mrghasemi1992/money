import { describe, expect, it } from "vitest";

import { transactionErrors } from "./transaction";

const TODAY = "2026-11-19";

const expense = {
  type: "expense",
  amount: 2_500_000,
  date: "2026-11-18",
  time: null,
  accountId: "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f",
  toAccountId: null,
  categoryId: "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  description: "",
  tags: [],
};

describe("transactionErrors amount", () => {
  it("accepts a positive whole amount up to a safe integer", () => {
    expect(transactionErrors(expense, TODAY)).toEqual({});
    expect(
      transactionErrors({ ...expense, amount: Number.MAX_SAFE_INTEGER }, TODAY),
    ).toEqual({});
  });

  it("calls an amount beyond a safe integer too large, not missing", () => {
    expect(
      transactionErrors(
        { ...expense, amount: Number.MAX_SAFE_INTEGER + 2 },
        TODAY,
      ),
    ).toEqual({ amount: "amountTooLarge" });
  });

  it("calls zero, negative and fractional amounts missing", () => {
    for (const amount of [0, -1, 1.5]) {
      expect(transactionErrors({ ...expense, amount }, TODAY)).toEqual({
        amount: "amountMissing",
      });
    }
  });
});
