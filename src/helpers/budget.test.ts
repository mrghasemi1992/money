import { describe, expect, it } from "vitest";

import { budgetErrors, getBudgetStatus } from "./budget";

describe("getBudgetStatus", () => {
  it("is ok below 80% of the budget", () => {
    expect(getBudgetStatus(0, 1000)).toBe("ok");
    expect(getBudgetStatus(799, 1000)).toBe("ok");
  });

  it("is near from 80% up to the budget itself", () => {
    expect(getBudgetStatus(800, 1000)).toBe("near");
    expect(getBudgetStatus(1000, 1000)).toBe("near");
  });

  it("is over only above the budget", () => {
    expect(getBudgetStatus(1001, 1000)).toBe("over");
  });

  it("takes another near ratio", () => {
    expect(getBudgetStatus(500, 1000, 0.5)).toBe("near");
    expect(getBudgetStatus(499, 1000, 0.5)).toBe("ok");
  });

  it("treats any spending on a zero budget as over, and none as ok", () => {
    expect(getBudgetStatus(1, 0)).toBe("over");
    expect(getBudgetStatus(0, 0)).toBe("ok");
  });
});

describe("budgetErrors", () => {
  const categoryId = "4b0f3c1e-7f0a-4a63-9a43-2f6f1f1d2c11";

  it("accepts a category and a positive whole amount", () => {
    expect(budgetErrors({ categoryId, amount: 5_000_000 })).toBeNull();
  });

  it("names each field's first problem", () => {
    expect(budgetErrors({ categoryId: "", amount: 0 })).toEqual({
      categoryId: "categoryMissing",
      amount: "amountMissing",
    });
  });

  it("refuses negative and fractional amounts", () => {
    for (const amount of [-5_000_000, 1.5]) {
      expect(budgetErrors({ categoryId, amount })).toEqual({
        amount: "amountMissing",
      });
    }
  });

  it("calls an amount beyond a safe integer too large, not missing", () => {
    expect(
      budgetErrors({ categoryId, amount: Number.MAX_SAFE_INTEGER + 2 }),
    ).toEqual({ amount: "amountTooLarge" });
    expect(
      budgetErrors({ categoryId, amount: Number.MAX_SAFE_INTEGER }),
    ).toBeNull();
  });
});
