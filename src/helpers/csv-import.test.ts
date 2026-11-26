import { describe, expect, it } from "vitest";

import { SAMPLE_TRANSACTION_OPTIONS } from "@/components/transaction-list/sample-transactions";
import { CSV_FIELDS } from "@/constants/csv";
import type { CsvField } from "@/types/csv";

import {
  accountKey,
  categoryKey,
  importRowSchema,
  planImport,
  usedNewItems,
} from "./csv-import";

const TODAY = "2026-11-19";

/** A row with every column empty but the ones given. */
function row(cells: Record<string, string>) {
  return {
    date: "",
    time: "",
    amount: "",
    type: "",
    account: "",
    toAccount: "",
    category: "",
    subcategory: "",
    description: "",
    tags: "",
    note: "",
    ...cells,
  };
}

/** The error codes of a failed row, in order. */
function errors(
  result: ReturnType<ReturnType<typeof importRowSchema>["safeParse"]>,
) {
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
}

describe("importRowSchema with a type column", () => {
  const schema = importRowSchema({
    amountMode: "typed",
    minorPerUnit: 1,
    dateOrder: null,
    today: TODAY,
  });

  it("reads a Jalali expense with its category and tags", () => {
    const result = schema.safeParse(
      row({
        date: "۱۴۰۵/۰۸/۲۸",
        amount: "۲۵۰٬۰۰۰",
        type: "هزینه",
        account: " ملت ",
        category: "خوراک",
        subcategory: "رستوران",
        description: "ناهار",
        tags: "#کار، سفر",
      }),
    );
    expect(result.success && result.data).toEqual({
      type: "expense",
      date: "2026-11-19",
      time: null,
      amount: 250_000,
      account: "ملت",
      toAccount: null,
      category: "خوراک",
      subcategory: "رستوران",
      description: "ناهار",
      tags: ["کار", "سفر"],
    });
  });

  it("drops the category of a transfer and keeps its destination", () => {
    const result = schema.safeParse(
      row({
        date: "2026-11-01 08:15",
        amount: "1000",
        type: "transfer",
        account: "Melli",
        toAccount: "Cash",
        category: "Food",
      }),
    );
    expect(result.success && result.data).toMatchObject({
      type: "transfer",
      time: "08:15",
      toAccount: "Cash",
      category: null,
    });
  });

  it("refuses future dates, missing types and missing accounts", () => {
    expect(
      errors(schema.safeParse(row({ date: "2026-11-20", amount: "1" }))),
    ).toEqual(["dateFuture", "typeMissing", "accountMissing"]);
  });

  it("refuses a transfer to the same account", () => {
    expect(
      errors(
        schema.safeParse(
          row({
            date: "2026-11-01",
            amount: "1",
            type: "transfer",
            account: "Melli",
            toAccount: " melli ",
          }),
        ),
      ),
    ).toEqual(["sameAccount"]);
  });

  it("refuses a subcategory without its category", () => {
    expect(
      errors(
        schema.safeParse(
          row({
            date: "2026-11-01",
            amount: "1",
            type: "expense",
            account: "Melli",
            subcategory: "Lunch",
          }),
        ),
      ),
    ).toEqual(["subcategoryWithoutCategory"]);
  });
});

describe("importRowSchema with signed amounts", () => {
  const schema = importRowSchema({
    amountMode: "signed",
    minorPerUnit: 100,
    dateOrder: "dmy",
    today: TODAY,
  });

  it("takes the type from the sign, or a transfer from a destination", () => {
    const parse = (cells: Record<string, string>) =>
      schema.safeParse(
        row({ date: "05/11/2026", account: "Wallet", ...cells }),
      );
    expect(parse({ amount: "-12.50" })).toMatchObject({
      success: true,
      data: { type: "expense", amount: 1250, date: "2026-11-05" },
    });
    expect(parse({ amount: "12.50" })).toMatchObject({
      data: { type: "income" },
    });
    expect(parse({ amount: "12.50", toAccount: "Bank" })).toMatchObject({
      data: { type: "transfer" },
    });
  });

  it("joins an old note column to the description", () => {
    expect(
      schema.safeParse(
        row({
          date: "05/11/2026",
          account: "Wallet",
          amount: "-1",
          description: "Coffee",
          note: "with Sara",
        }),
      ),
    ).toMatchObject({ data: { description: "Coffee — with Sara" } });
  });
});

describe("planImport", () => {
  const book = SAMPLE_TRANSACTION_OPTIONS;
  const melli = book.accounts.find((account) => account.name === "بانک ملی")!;
  const food = book.categories.expense.find(
    (category) => category.name === "خوراک",
  )!;
  const context = { book, currency: "IRR" as const, today: TODAY };
  const format = { amountMode: "typed" as const, rialUnit: "rial" as const };

  function record(line: number, cells: Partial<Record<CsvField, string>>) {
    return { line, cells: CSV_FIELDS.map((field) => cells[field] ?? "") };
  }
  const expense = (line: number, cells: Partial<Record<CsvField, string>>) =>
    record(line, {
      date: "1405/07/10",
      amount: "1000",
      type: "هزینه",
      ...cells,
    });

  it("matches the book's names however their letters are written", () => {
    // Arabic «ي» and «ك» fold to Persian ones; extra spaces don't matter.
    const plan = planImport(
      [expense(2, { account: "بانك  ملي", category: "خوراك" })],
      format,
      context,
      {},
    );
    expect(plan.errors).toEqual([]);
    expect(plan.rows[0]).toMatchObject({
      account: { kind: "existing", id: melli.id },
      category: { kind: "existing", id: food.id },
    });
  });

  it("fails rows on an unknown name until the user chooses for it", () => {
    const records = [
      expense(2, { account: "کارت جدید" }),
      expense(3, { account: "کارت جدید" }),
    ];
    const unmatched = planImport(records, format, context, {});
    expect(unmatched.rows).toEqual([]);
    expect(unmatched.errors.map((error) => error.code)).toEqual([
      "accountUnmatched",
      "accountUnmatched",
    ]);
    expect(unmatched.names).toEqual([
      expect.objectContaining({ kind: "account", name: "کارت جدید", rows: 2 }),
    ]);

    const key = accountKey("کارت جدید");
    const created = planImport(records, format, context, { [key]: "new" });
    expect(created.rows).toHaveLength(2);
    expect(created.accounts).toEqual([
      expect.objectContaining({ key, name: "کارت جدید" }),
    ]);

    const mapped = planImport(records, format, context, { [key]: melli.id });
    expect(mapped.rows[0]!.account).toEqual({ kind: "existing", id: melli.id });
    expect(mapped.accounts).toEqual([]);
  });

  it("leaves a category out when the user chose none", () => {
    const key = categoryKey("expense", "سرگرمی جدید");
    const plan = planImport(
      [expense(2, { account: "بانک ملی", category: "سرگرمی جدید" })],
      format,
      context,
      { [key]: "none" },
    );
    expect(plan.rows[0]).toMatchObject({ category: null });
    expect(plan.categories).toEqual([]);
  });

  it("keeps a debt on a person or lender, never on the book's own money", () => {
    const debt = (line: number, account: string) =>
      record(line, {
        date: "1405/07/10",
        amount: "5000000",
        type: "طلب",
        account,
      });
    const person = book.accounts.find(
      (account) => account.name === "علی رضایی",
    )!;

    const onBank = planImport([debt(2, "بانک ملی")], format, context, {});
    expect(onBank.rows).toEqual([]);
    expect(onBank.errors.map((error) => error.code)).toEqual([
      "debtAccountNotCounterparty",
    ]);

    const onPerson = planImport([debt(2, person.name)], format, context, {});
    expect(onPerson.rows[0]).toMatchObject({
      type: "receivable",
      amount: 5_000_000,
      account: { kind: "existing", id: person.id },
      category: null,
    });

    // A new name for a debt is created as a person, not as a bank account.
    const key = accountKey("مینا");
    const onNew = planImport([debt(2, "مینا")], format, context, {
      [key]: "new",
    });
    expect(onNew.accounts).toEqual([
      expect.objectContaining({ key, type: "counterparty" }),
    ]);
  });

  it("creates only what the ready rows use", () => {
    const key = accountKey("حساب تازه");
    const plan = planImport(
      // The only row on the new account has no amount, so the account isn't needed.
      [record(2, { date: "1405/07/10", type: "هزینه", account: "حساب تازه" })],
      format,
      context,
      { [key]: "new" },
    );
    expect(plan.errors.map((error) => error.code)).toEqual(["amountMissing"]);
    expect(
      usedNewItems(plan.rows, plan.accounts, plan.categories).accounts,
    ).toEqual([]);
  });
});
