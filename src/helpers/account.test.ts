import { describe, expect, it } from "vitest";

import {
  accountFormError,
  accountSchema,
  debtTotals,
  isCounterparty,
} from "./account";

const bankAccount = {
  name: "بانک ملی",
  type: "bank",
  identifiers: { accountNumber: null, cardNumber: null, sheba: null },
  openingBalance: 0,
};

describe("accountFormError", () => {
  it("accepts a bank account with no identifiers", () => {
    expect(accountFormError(bankAccount)).toBeNull();
  });

  it("reports an invalid identifier on its own field", () => {
    expect(
      accountFormError({
        ...bankAccount,
        identifiers: {
          accountNumber: null,
          cardNumber: "1234",
          sheba: null,
        },
      }),
    ).toEqual({ field: "cardNumber", key: "cardNumberInvalid" });
    expect(
      accountFormError({
        ...bankAccount,
        identifiers: {
          accountNumber: null,
          cardNumber: null,
          sheba: "IR123",
        },
      }),
    ).toEqual({ field: "sheba", key: "shebaInvalid" });
    expect(
      accountFormError({
        ...bankAccount,
        identifiers: {
          accountNumber: "abc",
          cardNumber: null,
          sheba: null,
        },
      }),
    ).toEqual({ field: "accountNumber", key: "accountNumberInvalid" });
  });

  it("reports a missing name before the identifiers", () => {
    expect(
      accountFormError({
        ...bankAccount,
        name: " ",
        identifiers: {
          accountNumber: "abc",
          cardNumber: null,
          sheba: null,
        },
      }),
    ).toEqual({ field: "name", key: "nameMissing" });
  });
});

describe("accountSchema", () => {
  it("normalizes each identifier independently: Persian digits, separators, a Sheba without its «IR»", () => {
    expect(
      accountSchema.parse({
        ...bankAccount,
        identifiers: {
          accountNumber: "۱۲۳۴۵-۶۷۸۹۰",
          cardNumber: "6037 9912 3456 6219",
          sheba: "ir820540102680020817909002",
        },
      }).identifiers,
    ).toEqual({
      accountNumber: "1234567890",
      cardNumber: "6037991234566219",
      sheba: "IR820540102680020817909002",
    });
  });

  it("keeps a blank identifier as null", () => {
    expect(
      accountSchema.parse({
        ...bankAccount,
        identifiers: { accountNumber: "  ", cardNumber: "", sheba: null },
      }).identifiers,
    ).toEqual({ accountNumber: null, cardNumber: null, sheba: null });
  });

  it("keeps identifiers of a cash account but the statement clears them", () => {
    // The schema only checks the values; `accountValues` in src/db/accounts.ts
    // nulls them for anything but a bank account.
    expect(
      accountSchema.parse({
        ...bankAccount,
        type: "cash",
        identifiers: { accountNumber: "12345", cardNumber: null, sheba: null },
      }).identifiers.accountNumber,
    ).toBe("12345");
  });
});

describe("counterparties", () => {
  it("are people and lenders, apart from the book's own money", () => {
    expect(isCounterparty({ type: "counterparty" })).toBe(true);
    for (const type of ["bank", "cash", "other"] as const) {
      expect(isCounterparty({ type })).toBe(false);
    }
  });

  it("total what they owe the book apart from what it owes them", () => {
    expect(debtTotals([2_000_000, -7_000_000, 500_000, 0])).toEqual({
      owedToYou: 2_500_000,
      youOwe: 7_000_000,
      net: -4_500_000,
    });
    expect(debtTotals([])).toEqual({ owedToYou: 0, youOwe: 0, net: 0 });
  });
});
