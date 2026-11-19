import { describe, expect, it } from "vitest";

import { importRowSchema } from "./csv-import";

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
