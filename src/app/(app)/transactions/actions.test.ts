import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkTransactionReferences,
  createTransaction as insertTransaction,
  deleteTransaction as removeTransaction,
  getTransactionInput,
  updateTransaction as saveTransaction,
} from "@/db/transactions";
import { t } from "@/test/messages";
import {
  outcome,
  refresh,
  resetServer,
  signInAs,
  TEST_USER_ID,
} from "@/test/server";

import {
  createTransaction,
  deleteTransaction,
  restoreTransaction,
  updateTransaction,
} from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/i18n/preferences", () => import("@/test/server"));
vi.mock("@/db/transactions", () => ({
  checkTransactionReferences: vi.fn(),
  createTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  getTransactionInput: vi.fn(),
  listTransactions: vi.fn(),
  updateTransaction: vi.fn(),
}));

const ACCOUNT_ID = "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f";
const CATEGORY_ID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const TRANSACTION_ID = "9b8c7d6e-5f4a-4b3c-8d2e-1f0a9b8c7d6e";

const expense = {
  type: "expense",
  amount: 2_500_000,
  date: "2026-11-18",
  time: "13:05",
  accountId: ACCOUNT_ID,
  toAccountId: null,
  categoryId: CATEGORY_ID,
  description: "ناهار",
  tags: ["کاری"],
};

beforeEach(() => {
  resetServer();
  // 28 Aban 1405 in Tehran.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-19T09:00:00Z"));
  vi.mocked(checkTransactionReferences).mockResolvedValue(null);
});
afterEach(() => vi.useRealTimers());

describe("createTransaction", () => {
  it("refuses viewers before reading the input", async () => {
    signInAs("viewer");
    expect(await outcome(() => createTransaction(expense))).toBe("notFound");
    expect(insertTransaction).not.toHaveBeenCalled();
  });

  it("sends signed-out visitors to sign in", async () => {
    expect(await outcome(() => createTransaction(expense))).toBe(
      "redirect /login",
    );
  });

  it("saves as the signed-in user, from the web, whatever the input says", async () => {
    signInAs("editor");
    vi.mocked(insertTransaction).mockResolvedValue("tx-1");

    const result = await createTransaction({
      ...expense,
      createdBy: "someone-else",
    });

    expect(result).toEqual({ ok: true, id: "tx-1" });
    expect(insertTransaction).toHaveBeenCalledWith(
      expect.not.objectContaining({ createdBy: expect.anything() }),
      TEST_USER_ID,
      "web",
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("puts a rule's error on its field, translated", async () => {
    signInAs("admin");

    expect(await createTransaction({ ...expense, date: "2026-11-20" })).toEqual(
      {
        ok: false,
        field: "date",
        error: t("transactions.form.errors.dateFuture"),
      },
    );
    expect(insertTransaction).not.toHaveBeenCalled();
  });

  it("refuses an archived or deleted account on its field", async () => {
    signInAs("editor");
    vi.mocked(checkTransactionReferences).mockResolvedValue(
      "accountUnavailable",
    );

    expect(await createTransaction(expense)).toEqual({
      ok: false,
      field: "accountId",
      error: t("transactions.form.errors.accountUnavailable"),
    });
    expect(insertTransaction).not.toHaveBeenCalled();
  });

  it("refuses input that isn't a transaction", async () => {
    signInAs("editor");
    expect(await createTransaction("drop table")).toMatchObject({ ok: false });
    expect(insertTransaction).not.toHaveBeenCalled();
  });
});

describe("updateTransaction", () => {
  it("records the acting user as the last editor", async () => {
    signInAs("editor");
    vi.mocked(getTransactionInput).mockResolvedValue({
      ...expense,
      type: "expense",
      source: "mcp",
    });
    vi.mocked(saveTransaction).mockResolvedValue(true);

    expect(
      await updateTransaction({ ...expense, id: TRANSACTION_ID, amount: 3000 }),
    ).toEqual({ ok: true });
    expect(saveTransaction).toHaveBeenCalledWith(
      TRANSACTION_ID,
      expect.objectContaining({ amount: 3000 }),
      TEST_USER_ID,
    );
    // The stored transaction may keep an archived account or category.
    expect(checkTransactionReferences).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 3000 }),
      expect.objectContaining({ source: "mcp" }),
    );
  });

  it("fails for a transaction that no longer exists", async () => {
    signInAs("editor");
    vi.mocked(getTransactionInput).mockResolvedValue(null);

    expect(await updateTransaction({ ...expense, id: TRANSACTION_ID })).toEqual(
      { ok: false, error: t("transactions.failed") },
    );
    expect(saveTransaction).not.toHaveBeenCalled();
  });

  it("refuses viewers", async () => {
    signInAs("viewer");
    expect(
      await outcome(() =>
        updateTransaction({ ...expense, id: TRANSACTION_ID }),
      ),
    ).toBe("notFound");
  });
});

describe("deleteTransaction and restoreTransaction", () => {
  it("returns what was deleted, so undo can add it again as the acting user", async () => {
    signInAs("editor");
    const stored = { ...expense, type: "expense" as const };
    vi.mocked(removeTransaction).mockResolvedValue(stored);
    vi.mocked(insertTransaction).mockResolvedValue("tx-2");

    const deleted = await deleteTransaction({ id: TRANSACTION_ID });
    expect(deleted).toEqual({ ok: true, deleted: stored });

    expect(await restoreTransaction(stored)).toEqual({ ok: true, id: "tx-2" });
    expect(insertTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ amount: stored.amount }),
      TEST_USER_ID,
      "web",
    );
  });

  it("refuses a malformed id and viewers", async () => {
    signInAs("editor");
    expect(await deleteTransaction({ id: "1; drop" })).toMatchObject({
      ok: false,
    });
    expect(removeTransaction).not.toHaveBeenCalled();

    signInAs("viewer");
    expect(await outcome(() => deleteTransaction({ id: TRANSACTION_ID }))).toBe(
      "notFound",
    );
  });
});
