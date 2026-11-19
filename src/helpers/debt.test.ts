import { describe, expect, it } from "vitest";

import { debtDraftOf, debtEntry, debtFields } from "./debt";

const PERSON = "person";
const BANK = "bank";
const isCounterparty = (id: string) => id === PERSON || id === "lender";

describe("debtEntry", () => {
  it("stores money lent or borrowed as a transfer with the person", () => {
    expect(debtEntry("receivable", PERSON, BANK)).toEqual({
      type: "transfer",
      accountId: BANK,
      toAccountId: PERSON,
    });
    expect(debtEntry("payable", PERSON, BANK)).toEqual({
      type: "transfer",
      accountId: PERSON,
      toAccountId: BANK,
    });
  });

  it("stores a debt no money moved for as a receivable or payable on the person", () => {
    expect(debtEntry("payable", PERSON, null)).toEqual({
      type: "payable",
      accountId: PERSON,
      toAccountId: null,
    });
  });

  it("puts errors on the field that holds the person or the account", () => {
    expect(debtFields("receivable", BANK)).toEqual({
      person: "toAccountId",
      money: "accountId",
    });
    expect(debtFields("payable", BANK)).toEqual({
      person: "accountId",
      money: "toAccountId",
    });
  });
});

describe("debtDraftOf", () => {
  it("reads back what debtEntry stored", () => {
    for (const direction of ["receivable", "payable"] as const) {
      for (const account of [BANK, null]) {
        const stored = debtEntry(direction, PERSON, account);
        expect(debtDraftOf(stored, isCounterparty)).toEqual({
          direction,
          personId: PERSON,
          moneyAccountId: account,
        });
      }
    }
  });

  it("isn't a debt between two of the book's accounts or two people", () => {
    expect(
      debtDraftOf(
        { type: "transfer", accountId: BANK, toAccountId: "cash" },
        isCounterparty,
      ),
    ).toBeNull();
    expect(
      debtDraftOf(
        { type: "transfer", accountId: PERSON, toAccountId: "lender" },
        isCounterparty,
      ),
    ).toBeNull();
    expect(
      debtDraftOf(
        { type: "expense", accountId: BANK, toAccountId: null },
        isCounterparty,
      ),
    ).toBeNull();
  });
});
