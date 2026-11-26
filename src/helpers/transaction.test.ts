import { describe, expect, it } from "vitest";

import {
  isIncomeOrExpense,
  isUnknownTransaction,
  transactionErrors,
  transactionSchema,
} from "./transaction";

const TODAY = "2026-11-19";
const ACCOUNT = "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f";
const OTHER_ACCOUNT = "7a2d3e4f-5b6c-4d7e-8f90-a1b2c3d4e5f6";
const CATEGORY = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

const expense = {
  type: "expense",
  amount: 2_500_000,
  date: "2026-11-18",
  time: null,
  accountId: ACCOUNT,
  toAccountId: null,
  categoryId: CATEGORY,
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

describe("transactionErrors date", () => {
  it("accepts the viewer's today and refuses the day after", () => {
    expect(transactionErrors({ ...expense, date: TODAY }, TODAY)).toEqual({});
    expect(
      transactionErrors({ ...expense, date: "2026-11-20" }, TODAY),
    ).toEqual({ date: "dateFuture" });
  });

  it("refuses a date that doesn't exist, or one in the Jalali form", () => {
    expect(
      transactionErrors({ ...expense, date: "2026-02-29" }, TODAY),
    ).toEqual({ date: "dateMissing" });
    expect(
      transactionErrors({ ...expense, date: "1405/08/27" }, TODAY),
    ).toEqual({ date: "dateMissing" });
  });
});

describe("transactionErrors between fields", () => {
  const transfer = {
    ...expense,
    type: "transfer",
    toAccountId: OTHER_ACCOUNT,
    categoryId: null,
  };

  it("asks a transfer for a different destination account", () => {
    expect(transactionErrors(transfer, TODAY)).toEqual({});
    expect(
      transactionErrors({ ...transfer, toAccountId: null }, TODAY),
    ).toEqual({ toAccountId: "toAccountMissing" });
    expect(
      transactionErrors({ ...transfer, toAccountId: ACCOUNT }, TODAY),
    ).toEqual({ toAccountId: "sameAccount" });
  });

  it("asks income and expense for a category unless the caller allows none", () => {
    for (const type of ["expense", "income"]) {
      expect(
        transactionErrors({ ...expense, type, categoryId: null }, TODAY),
      ).toEqual({ categoryId: "categoryMissing" });
      expect(
        transactionErrors({ ...expense, type, categoryId: null }, TODAY, {
          categoryRequired: false,
        }),
      ).toEqual({});
    }
  });

  it("asks a receivable or payable for neither a destination nor a category", () => {
    for (const type of ["receivable", "payable"]) {
      expect(
        transactionErrors({ ...expense, type, categoryId: null }, TODAY),
      ).toEqual({});
    }
  });
});

describe("transactionSchema output", () => {
  const parse = (input: object) => transactionSchema(TODAY).parse(input);

  it("never stores a category on a transfer, so it can't count as an expense", () => {
    expect(
      parse({
        ...expense,
        type: "transfer",
        toAccountId: OTHER_ACCOUNT,
        categoryId: CATEGORY,
      }),
    ).toMatchObject({
      type: "transfer",
      toAccountId: OTHER_ACCOUNT,
      categoryId: null,
    });
  });

  it("stores a receivable or payable with neither a destination nor a category", () => {
    for (const type of ["receivable", "payable"]) {
      expect(
        parse({
          ...expense,
          type,
          toAccountId: OTHER_ACCOUNT,
          categoryId: CATEGORY,
        }),
      ).toMatchObject({ type, toAccountId: null, categoryId: null });
    }
  });

  it("drops a destination account from income and expense", () => {
    expect(parse({ ...expense, toAccountId: OTHER_ACCOUNT })).toMatchObject({
      toAccountId: null,
      categoryId: CATEGORY,
    });
  });

  it("tidies the text: «؟» alone is no description, tags trimmed and once each", () => {
    expect(
      parse({
        ...expense,
        description: " ؟ ",
        tags: [" کاری ", "کاری", "", "سفر"],
      }),
    ).toMatchObject({ description: "", tags: ["کاری", "سفر"] });
  });
});

describe("what totals count", () => {
  it("counts only income and expense, never transfers or debts", () => {
    expect(isIncomeOrExpense("income")).toBe(true);
    expect(isIncomeOrExpense("expense")).toBe(true);
    for (const type of ["transfer", "receivable", "payable"] as const) {
      expect(isIncomeOrExpense(type)).toBe(false);
    }
  });

  it("calls only income and expense without a category unknown", () => {
    expect(isUnknownTransaction({ type: "expense", categoryId: null })).toBe(
      true,
    );
    expect(
      isUnknownTransaction({ type: "expense", categoryId: CATEGORY }),
    ).toBe(false);
    for (const type of ["transfer", "receivable", "payable"] as const) {
      expect(isUnknownTransaction({ type, categoryId: null })).toBe(false);
    }
  });
});
