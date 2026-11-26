import { asc, sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { CSV_INSERT_CHUNK } from "@/constants/csv";
import { db } from "@/db";
import { accounts, categories, transactions } from "@/db/schema";
import type { ImportRow } from "@/types/csv";
import { seedAccount, seedCategory, seedUser } from "@/test/integration/seed";

import { saveImport } from "./import";

let actor: string;
let bank: string;
let food: string;

beforeEach(async () => {
  await seedUser({ name: "مریم" });
  actor = await seedUser({ name: "رضا", role: "editor" });
  bank = await seedAccount({ name: "ملت", sortOrder: 0 });
  food = await seedCategory({ name: "خوراک" });
});

function row(line: number, overrides: Partial<ImportRow> = {}): ImportRow {
  return {
    line,
    type: "expense",
    amount: 1_000,
    date: "2026-10-01",
    time: null,
    account: { kind: "existing", id: bank },
    toAccount: null,
    category: { kind: "existing", id: food },
    description: "",
    tags: [],
    ...overrides,
  };
}

async function counts(): Promise<{
  accounts: number;
  categories: number;
  transactions: number;
}> {
  const result = await db.execute<{
    accounts: string;
    categories: string;
    transactions: string;
  }>(sql`
    select
      (select count(*) from ${accounts}) as accounts,
      (select count(*) from ${categories}) as categories,
      (select count(*) from ${transactions}) as transactions
  `);
  const { rows } = result;
  return {
    accounts: Number(rows[0].accounts),
    categories: Number(rows[0].categories),
    transactions: Number(rows[0].transactions),
  };
}

describe("saveImport", () => {
  it("adds the new accounts, categories and rows, in the file's order, as the importing user", async () => {
    const result = await saveImport(
      {
        accounts: [
          { key: "account:نقد", name: "نقد", type: "cash" },
          { key: "account:علی", name: "علی", type: "counterparty" },
        ],
        categories: [
          {
            key: "category:رستوران",
            name: "رستوران",
            type: "expense",
            parent: { kind: "existing", id: food },
            color: "teal",
            icon: "utensils",
          },
        ],
        rows: [
          row(2, {
            date: "2026-10-02",
            category: { kind: "new", key: "category:رستوران" },
            description: "ناهار",
          }),
          row(3, {
            type: "transfer",
            amount: 5_000,
            date: "2026-10-01",
            toAccount: { kind: "new", key: "account:نقد" },
            category: null,
          }),
          row(4, {
            type: "receivable",
            amount: 7_000,
            account: { kind: "new", key: "account:علی" },
            category: null,
          }),
        ],
      },
      actor,
    );

    expect(result).toBe("ok");
    const newAccounts = await db
      .select({
        name: accounts.name,
        type: accounts.type,
        sortOrder: accounts.sortOrder,
      })
      .from(accounts)
      .orderBy(asc(accounts.sortOrder));
    expect(newAccounts).toEqual([
      { name: "ملت", type: "bank", sortOrder: 0 },
      { name: "نقد", type: "cash", sortOrder: 1 },
      { name: "علی", type: "counterparty", sortOrder: 2 },
    ]);
    // Each new key resolved to its own new row: by name, so swapping two would fail.
    const saved = await db.execute(sql`
      select
        t.type, t.amount::int as amount, a.name as account, ta.name as to_account,
        c.name as category, p.name as parent, t.description, t.source,
        t.created_by = ${actor} and t.updated_by = ${actor} as by_actor
      from ${transactions} t
      join ${accounts} a on a.id = t.account_id
      left join ${accounts} ta on ta.id = t.to_account_id
      left join ${categories} c on c.id = t.category_id
      left join ${categories} p on p.id = c.parent_id
      order by t.created_at
    `);
    expect(saved.rows).toEqual([
      {
        type: "expense",
        amount: 1_000,
        account: "ملت",
        to_account: null,
        category: "رستوران",
        parent: "خوراک",
        description: "ناهار",
        source: "csv",
        by_actor: true,
      },
      {
        type: "transfer",
        amount: 5_000,
        account: "ملت",
        to_account: "نقد",
        category: null,
        parent: null,
        description: "",
        source: "csv",
        by_actor: true,
      },
      {
        type: "receivable",
        amount: 7_000,
        account: "علی",
        to_account: null,
        category: null,
        parent: null,
        description: "",
        source: "csv",
        by_actor: true,
      },
    ]);
  });

  it("saves nothing and answers taken when a new name is already used", async () => {
    const result = await saveImport(
      {
        accounts: [{ key: "account:نقد", name: "نقد", type: "cash" }],
        // The book already has «خوراک»: the categories' insert fails after the accounts'.
        categories: [
          {
            key: "category:خوراک",
            name: "خوراک",
            type: "expense",
            parent: null,
            color: "teal",
            icon: "shapes",
          },
        ],
        rows: [
          row(2, {
            account: { kind: "new", key: "account:نقد" },
            category: { kind: "new", key: "category:خوراک" },
          }),
        ],
      },
      actor,
    );

    expect(result).toBe("taken");
    expect(await counts()).toEqual({
      accounts: 1,
      categories: 1,
      transactions: 0,
    });
  });

  it("saves none of the rows when one in a later chunk is refused", async () => {
    const rows = Array.from({ length: CSV_INSERT_CHUNK }, (_, index) =>
      row(index + 2, { account: { kind: "new", key: "account:نقد" } }),
    );
    // A transfer to the account it comes from breaks the transfer check.
    rows.push(
      row(CSV_INSERT_CHUNK + 2, {
        type: "transfer",
        toAccount: { kind: "existing", id: bank },
        category: null,
      }),
    );

    await expect(
      saveImport(
        {
          accounts: [{ key: "account:نقد", name: "نقد", type: "cash" }],
          categories: [],
          rows,
        },
        actor,
      ),
    ).rejects.toThrow();
    expect(await counts()).toEqual({
      accounts: 1,
      categories: 1,
      transactions: 0,
    });
  });
});
