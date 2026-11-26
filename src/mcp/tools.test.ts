import type { McpServer } from "@modelcontextprotocol/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listAccounts } from "@/db/accounts";
import { listCategories } from "@/db/categories";
import {
  checkTransactionReferences,
  createTransactions,
  deleteTransactions,
  findSimilarTransactions,
  getTransactionInput,
  listAccountOptions,
  listTransactions,
  transactionTotals,
  updateTransaction,
} from "@/db/transactions";
import { getUserStatus } from "@/db/users";
import type { Account } from "@/types/account";
import type { McpUser } from "@/types/connector";
import type { Currency } from "@/types/currency";
import type { UserRole } from "@/types/user";

import { type McpContext, registerTools } from "./tools";

vi.mock("@/db/accounts", () => ({ listAccounts: vi.fn() }));
vi.mock("@/db/categories", () => ({ listCategories: vi.fn() }));
vi.mock("@/db/users", () => ({ getUserStatus: vi.fn() }));
vi.mock("@/db/transactions", () => ({
  checkTransactionReferences: vi.fn(),
  createTransactions: vi.fn(),
  deleteTransactions: vi.fn(),
  findSimilarTransactions: vi.fn(),
  getTransactionInput: vi.fn(),
  listAccountOptions: vi.fn(),
  listTransactions: vi.fn(),
  transactionTotals: vi.fn(),
  updateTransaction: vi.fn(),
}));

type Handler = (input: unknown) => Promise<{
  content: { type: "text"; text: string }[];
  isError?: boolean;
}>;

/** Registers the tools on a stand-in server and returns them by name. */
function toolsFor(
  role: UserRole,
  currency: Currency = "IRR",
): Map<string, Handler> {
  const tools = new Map<string, Handler>();
  const server = {
    registerTool: (name: string, _config: unknown, handler: Handler) => {
      tools.set(name, handler);
    },
  } as unknown as McpServer;
  registerTools(server, context(role, currency));
  return tools;
}

const USER_ID = "user-1";
const ACCOUNT_ID = "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f";
const CATEGORY_ID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

function context(role: UserRole, currency: Currency): McpContext {
  const user: McpUser = {
    id: USER_ID,
    name: "سارا",
    role,
    disabled: false,
    locale: "fa",
    calendar: "jalali",
    rialUnit: "rial",
    timeZone: "Asia/Tehran",
  };
  return { user, currency, timeZone: "Asia/Tehran", source: "mcp" };
}

function body(result: Awaited<ReturnType<Handler>>): unknown {
  return JSON.parse(result.content[0]!.text);
}

const READ_TOOLS = [
  "today",
  "list_accounts",
  "list_categories",
  "list_transactions",
];
const WRITE_TOOLS = [
  "add_transactions",
  "update_transaction",
  "delete_transactions",
];

beforeEach(() => {
  // 28 Aban 1405, midday in Tehran.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-19T09:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("registerTools", () => {
  it("gives viewers only the read tools", () => {
    expect([...toolsFor("viewer").keys()]).toEqual(READ_TOOLS);
  });

  it("gives editors and admins the write tools too", () => {
    for (const role of ["editor", "admin"] as const) {
      expect([...toolsFor(role).keys()]).toEqual([
        ...READ_TOOLS,
        ...WRITE_TOOLS,
      ]);
    }
  });

  it("tells Claude the date in the user's calendar and whether they may write", async () => {
    const today = toolsFor("viewer").get("today")!;
    expect(body(await today({}))).toMatchObject({
      date: "1405/08/28",
      calendar: "jalali",
      currency: "IRR",
      user: { role: "viewer", can_write: false },
    });
  });
});

describe("today", () => {
  it("turns over at the user's midnight, not the server's", async () => {
    // 21:00 UTC on 19 November is 00:30 on 29 Aban in Tehran.
    vi.setSystemTime(new Date("2026-11-19T21:00:00Z"));
    const today = toolsFor("viewer").get("today")!;
    expect(body(await today({}))).toMatchObject({ date: "1405/08/29" });
  });
});

describe("add_transactions", () => {
  const expense = {
    type: "expense",
    date: "1405/08/27",
    time: "13:05",
    amount: 2_500_000,
    account_id: ACCOUNT_ID,
    category_id: CATEGORY_ID,
    description: "ناهار",
  };

  it("checks the role again and saves nothing for a user who became a viewer", async () => {
    const add = toolsFor("editor").get("add_transactions")!;
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "viewer",
      disabled: false,
    });

    const result = await add({ transactions: [expense] });

    expect(result.isError).toBe(true);
    expect(body(result)).toMatchObject({
      error: expect.stringContaining("viewer"),
    });
    expect(createTransactions).not.toHaveBeenCalled();
  });

  it("refuses a disabled user", async () => {
    const add = toolsFor("admin").get("add_transactions")!;
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "admin",
      disabled: true,
    });

    expect((await add({ transactions: [expense] })).isError).toBe(true);
    expect(createTransactions).not.toHaveBeenCalled();
  });

  it("converts the date and saves as the token's user and source", async () => {
    const add = toolsFor("editor").get("add_transactions")!;
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "editor",
      disabled: false,
    });
    vi.mocked(checkTransactionReferences).mockResolvedValue(null);
    vi.mocked(findSimilarTransactions).mockResolvedValue([]);
    vi.mocked(createTransactions).mockResolvedValue(["tx-1"]);
    vi.mocked(listAccountOptions).mockResolvedValue([
      { id: ACCOUNT_ID, name: "ملت" } as never,
    ]);
    vi.mocked(listCategories).mockResolvedValue({ expense: [], income: [] });

    const result = await add({ transactions: [expense] });

    expect(result.isError).toBeUndefined();
    expect(createTransactions).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          type: "expense",
          date: "2026-11-18",
          time: "13:05",
          amount: 2_500_000,
          accountId: ACCOUNT_ID,
          categoryId: CATEGORY_ID,
          description: "ناهار",
        }),
      ],
      USER_ID,
      "mcp",
    );
    expect(body(result)).toMatchObject({
      saved: [{ id: "tx-1", date: "1405/08/27", account: "ملت" }],
      possible_duplicates: [],
    });
  });

  /** An editor whose stored references all check out. */
  function writer() {
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "editor",
      disabled: false,
    });
    vi.mocked(checkTransactionReferences).mockResolvedValue(null);
    vi.mocked(findSimilarTransactions).mockResolvedValue([]);
    vi.mocked(createTransactions).mockImplementation(async (rows) =>
      rows.map((_, index) => `tx-${index + 1}`),
    );
    vi.mocked(listAccountOptions).mockResolvedValue([]);
    vi.mocked(listCategories).mockResolvedValue({ expense: [], income: [] });
  }

  it("records the token's user, whatever user the input names", async () => {
    writer();
    const add = toolsFor("editor").get("add_transactions")!;

    await add({
      transactions: [
        { ...expense, created_by: "someone-else", user_id: "someone-else" },
      ],
    });

    const [rows, actor] = vi.mocked(createTransactions).mock.calls[0]!;
    expect(actor).toBe(USER_ID);
    expect(rows[0]).not.toHaveProperty("createdBy");
    expect(rows[0]).not.toHaveProperty("created_by");
  });

  it("stores dollars as cents, and refuses what a cent can't hold", async () => {
    writer();
    const add = toolsFor("editor", "USD").get("add_transactions")!;

    await add({ transactions: [{ ...expense, amount: 12.34 }] });
    expect(createTransactions).toHaveBeenCalledWith(
      [expect.objectContaining({ amount: 1234 })],
      USER_ID,
      "mcp",
    );

    vi.mocked(createTransactions).mockClear();
    for (const amount of [12.345, -12, 0]) {
      const result = await add({ transactions: [{ ...expense, amount }] });
      expect(result.isError).toBe(true);
      expect(body(result)).toMatchObject({
        invalid: [{ index: 0, errors: [expect.stringContaining("positive")] }],
      });
    }
    expect(createTransactions).not.toHaveBeenCalled();
  });

  it("refuses part of a rial", async () => {
    writer();
    const add = toolsFor("editor").get("add_transactions")!;

    const result = await add({ transactions: [{ ...expense, amount: 1.5 }] });
    expect(result.isError).toBe(true);
    expect(createTransactions).not.toHaveBeenCalled();
  });

  it("saves a transfer without the category Claude sent, so it is never an expense", async () => {
    writer();
    const add = toolsFor("editor").get("add_transactions")!;
    const TO = "7a2d3e4f-5b6c-4d7e-8f90-a1b2c3d4e5f6";

    await add({
      transactions: [{ ...expense, type: "transfer", to_account_id: TO }],
    });

    expect(createTransactions).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          type: "transfer",
          toAccountId: TO,
          categoryId: null,
        }),
      ],
      USER_ID,
      "mcp",
    );
  });

  it("saves nothing when a transaction breaks the rules", async () => {
    const add = toolsFor("editor").get("add_transactions")!;
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "editor",
      disabled: false,
    });

    const result = await add({
      transactions: [{ ...expense, date: "1405/08/29" }],
    });

    expect(result.isError).toBe(true);
    expect(body(result)).toMatchObject({
      invalid: [{ index: 0, errors: [expect.stringContaining("future")] }],
    });
    expect(createTransactions).not.toHaveBeenCalled();
  });
});

describe("list_accounts", () => {
  const account = (
    overrides: Partial<Account> &
      Pick<Account, "id" | "name" | "type" | "balance">,
  ): Account => ({
    identifiers: { accountNumber: null, cardNumber: null, sheba: null },
    openingBalance: 0,
    archived: false,
    transactionCount: 0,
    firstDate: null,
    ...overrides,
  });

  it("totals the book's own money apart from what people owe, and masks identifiers", async () => {
    vi.mocked(listAccounts).mockResolvedValue([
      account({
        id: "a",
        name: "ملت",
        type: "bank",
        balance: 10_000_000,
        identifiers: {
          accountNumber: null,
          cardNumber: "6104337812346219",
          sheba: "IR820540102680020817909002",
        },
      }),
      account({ id: "b", name: "نقدی", type: "cash", balance: 500_000 }),
      account({
        id: "c",
        name: "علی",
        type: "counterparty",
        balance: 2_000_000,
      }),
      account({
        id: "d",
        name: "وام",
        type: "counterparty",
        balance: -7_000_000,
      }),
      account({
        id: "e",
        name: "قدیمی",
        type: "bank",
        balance: 99_000_000,
        archived: true,
      }),
    ]);

    const result = body(await toolsFor("viewer").get("list_accounts")!({}));

    expect(result).toMatchObject({
      currency: "IRR",
      total_balance: 10_500_000,
      owed_to_user: 2_000_000,
      owed_by_user: 7_000_000,
    });
    const accounts = (result as { accounts: Record<string, unknown>[] })
      .accounts;
    expect(accounts[0]).toMatchObject({
      identifiers: {
        card_number: "•••• 6219",
        sheba: "•••• 9002",
      },
    });
    expect(JSON.stringify(result)).not.toContain("6104337812346219");
    expect(JSON.stringify(result)).not.toContain("IR820540102680020817909002");
    expect(accounts[4]).toMatchObject({ archived: true });
  });
});

describe("list_transactions", () => {
  it("refuses a date that doesn't exist", async () => {
    const list = toolsFor("viewer").get("list_transactions")!;
    const result = await list({ from: "1405/12/31" });
    expect(result.isError).toBe(true);
    expect(listTransactions).not.toHaveBeenCalled();
  });

  it("reads Jalali dates and passes the filters on", async () => {
    vi.mocked(listTransactions).mockResolvedValue({
      rows: [],
      nextCursor: null,
    });
    vi.mocked(transactionTotals).mockResolvedValue({
      count: 0,
      income: 0,
      expense: 0,
    } as never);

    await toolsFor("viewer").get("list_transactions")!({
      from: "1405/08/01",
      to: "1405/08/28",
      unknown_only: true,
      limit: 5,
    });

    expect(listTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "2026-10-23",
        to: "2026-11-19",
        unknownOnly: true,
        createdBy: null,
      }),
      undefined,
      5,
    );
  });
});

describe("update_transaction", () => {
  const stored = {
    type: "expense" as const,
    amount: 2_500_000,
    date: "2026-11-18",
    time: "13:05",
    accountId: ACCOUNT_ID,
    toAccountId: null,
    categoryId: null,
    description: "؟",
    tags: [],
    source: "mcp" as const,
  };
  const TX = "9b8c7d6e-5f4a-4b3c-8d2e-1f0a9b8c7d6e";

  beforeEach(() => {
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "editor",
      disabled: false,
    });
    vi.mocked(getTransactionInput).mockResolvedValue(stored);
    vi.mocked(checkTransactionReferences).mockResolvedValue(null);
    vi.mocked(listAccountOptions).mockResolvedValue([]);
    vi.mocked(listCategories).mockResolvedValue({ expense: [], income: [] });
  });

  it("changes only the given fields, as the token's user", async () => {
    vi.mocked(updateTransaction).mockResolvedValue(true);

    const result = await toolsFor("editor").get("update_transaction")!({
      id: TX,
      category_id: CATEGORY_ID,
    });

    expect(result.isError).toBeUndefined();
    expect(updateTransaction).toHaveBeenCalledWith(
      TX,
      expect.objectContaining({
        amount: 2_500_000,
        date: "2026-11-18",
        time: "13:05",
        categoryId: CATEGORY_ID,
      }),
      USER_ID,
    );
  });

  it("checks the role again and changes nothing for a viewer", async () => {
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "viewer",
      disabled: false,
    });
    const result = await toolsFor("editor").get("update_transaction")!({
      id: TX,
      amount: 1,
    });
    expect(result.isError).toBe(true);
    expect(updateTransaction).not.toHaveBeenCalled();
  });

  it("says when the transaction doesn't exist", async () => {
    vi.mocked(getTransactionInput).mockResolvedValue(null);
    const result = await toolsFor("editor").get("update_transaction")!({
      id: TX,
      amount: 1,
    });
    expect(body(result)).toEqual({ error: `No transaction with id ${TX}.` });
  });
});

describe("delete_transactions", () => {
  const A = "9b8c7d6e-5f4a-4b3c-8d2e-1f0a9b8c7d6e";
  const B = "1b8c7d6e-5f4a-4b3c-8d2e-1f0a9b8c7d6e";

  it("deletes for a writer and lists the ids it didn't find", async () => {
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "admin",
      disabled: false,
    });
    vi.mocked(listAccountOptions).mockResolvedValue([]);
    vi.mocked(listCategories).mockResolvedValue({ expense: [], income: [] });
    vi.mocked(deleteTransactions).mockResolvedValue([
      {
        id: A,
        type: "expense",
        amount: 1000,
        date: "2026-11-18",
        time: null,
        accountId: ACCOUNT_ID,
        toAccountId: null,
        categoryId: null,
        description: "",
        tags: [],
      } as never,
    ]);

    const result = await toolsFor("admin").get("delete_transactions")!({
      ids: [A, B],
    });

    expect(body(result)).toMatchObject({
      deleted: [{ id: A }],
      not_found: [B],
    });
  });

  it("deletes nothing for a user who became a viewer", async () => {
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "viewer",
      disabled: false,
    });
    const result = await toolsFor("editor").get("delete_transactions")!({
      ids: [A],
    });
    expect(result.isError).toBe(true);
    expect(deleteTransactions).not.toHaveBeenCalled();
  });
});
