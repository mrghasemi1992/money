import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteBudget as removeBudget,
  saveBudget as storeBudget,
} from "@/db/budgets";
import * as db from "@/db/budgets";
import { t } from "@/test/messages";
import { outcome, resetServer, signInAs } from "@/test/server";

import * as budgets from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/db/budgets", () => ({ deleteBudget: vi.fn(), saveBudget: vi.fn() }));

const ID = "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f";
const PARENT = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

beforeEach(() => resetServer());

describe("every write", () => {
  it("is refused to viewers, whatever the input", async () => {
    signInAs("viewer");
    for (const write of Object.values(budgets) as ((
      input: unknown,
    ) => Promise<unknown>)[]) {
      expect(await outcome(() => write({ id: ID }))).toBe("notFound");
    }
    // Not one query ran: the role check comes before reading the input.
    for (const query of Object.values(db)) {
      expect(query).not.toHaveBeenCalled();
    }
  });
});

describe("budgets", () => {
  it("sets a budget and says whether it is new", async () => {
    signInAs("editor");
    vi.mocked(storeBudget).mockResolvedValue({ created: true });
    expect(
      await budgets.saveBudget({ categoryId: PARENT, amount: 5_000_000 }),
    ).toEqual({ ok: true, created: true });
    expect(storeBudget).toHaveBeenCalledWith({
      categoryId: PARENT,
      amount: 5_000_000,
    });
  });

  it("refuses an amount that isn't a positive whole number, on its field", async () => {
    signInAs("editor");
    for (const amount of [0, -5_000_000, 2500.5]) {
      expect(await budgets.saveBudget({ categoryId: PARENT, amount })).toEqual({
        ok: false,
        field: "amount",
        error: t("budgets.form.errors.amountMissing"),
      });
    }
    expect(storeBudget).not.toHaveBeenCalled();
  });

  it("refuses an archived category or a subcategory on its field", async () => {
    signInAs("editor");
    vi.mocked(storeBudget).mockResolvedValue("missing");
    expect(
      await budgets.saveBudget({ categoryId: PARENT, amount: 5_000_000 }),
    ).toEqual({
      ok: false,
      field: "categoryId",
      error: t("budgets.form.errors.categoryUnavailable"),
    });
  });

  it("says a budget that's already gone is missing", async () => {
    signInAs("editor");
    vi.mocked(removeBudget).mockResolvedValue(null);
    expect(await budgets.deleteBudget({ categoryId: PARENT })).toEqual({
      ok: false,
      error: t("budgets.missing"),
    });
  });
});
