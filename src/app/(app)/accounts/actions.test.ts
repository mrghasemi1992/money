import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountNameTaken,
  createAccount as insertAccount,
  deleteAccount as removeAccount,
  reorderAccounts as saveAccountOrder,
} from "@/db/accounts";
import { t } from "@/test/messages";
import { outcome, resetServer, signInAs } from "@/test/server";

import * as accounts from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/db/accounts", () => ({
  accountNameTaken: vi.fn(),
  createAccount: vi.fn(),
  deleteAccount: vi.fn(),
  reorderAccounts: vi.fn(),
  setAccountArchived: vi.fn(),
  updateAccount: vi.fn(),
}));

const ID = "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f";

beforeEach(() => resetServer());

describe("every write", () => {
  it("is refused to viewers, whatever the input", async () => {
    signInAs("viewer");
    for (const write of Object.values(accounts) as ((
      input: unknown,
    ) => Promise<unknown>)[]) {
      expect(await outcome(() => write({ id: ID }))).toBe("notFound");
    }
    expect(insertAccount).not.toHaveBeenCalled();
  });
});

describe("accounts", () => {
  const account = {
    name: "  بانک ملی ",
    type: "bank",
    identifiers: { accountNumber: null, cardNumber: null, sheba: null },
    openingBalance: 1_000_000,
  };

  it("adds an account with a tidied name", async () => {
    signInAs("editor");
    vi.mocked(accountNameTaken).mockResolvedValue(false);
    vi.mocked(insertAccount).mockResolvedValue("account-1");

    expect(await accounts.createAccount(account)).toEqual({
      ok: true,
      id: "account-1",
    });
    expect(insertAccount).toHaveBeenCalledWith(
      expect.objectContaining({ name: "بانک ملی", openingBalance: 1_000_000 }),
    );
  });

  it("refuses a name another account has, on the name field", async () => {
    signInAs("editor");
    vi.mocked(accountNameTaken).mockResolvedValue(true);

    expect(await accounts.createAccount(account)).toEqual({
      ok: false,
      field: "name",
      error: t("accounts.form.errors.nameTaken"),
    });
    expect(insertAccount).not.toHaveBeenCalled();
  });

  it("refuses a fractional opening balance", async () => {
    signInAs("editor");
    expect(
      await accounts.createAccount({ ...account, openingBalance: 1.5 }),
    ).toMatchObject({ ok: false });
    expect(insertAccount).not.toHaveBeenCalled();
  });

  it("says an account with transactions can only be archived", async () => {
    signInAs("admin");
    vi.mocked(removeAccount).mockResolvedValue(false);
    expect(await accounts.deleteAccount({ id: ID })).toEqual({
      ok: false,
      error: t("accounts.inUse"),
    });
  });

  it("refuses an order with the same account twice", async () => {
    signInAs("editor");
    expect(await accounts.reorderAccounts({ ids: [ID, ID] })).toMatchObject({
      ok: false,
    });
    expect(saveAccountOrder).not.toHaveBeenCalled();
  });
});
