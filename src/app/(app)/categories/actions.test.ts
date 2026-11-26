import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  categoryNameTaken,
  createCategory as insertCategory,
  createSubcategory as insertSubcategory,
  getCategory,
} from "@/db/categories";
import * as db from "@/db/categories";
import { t } from "@/test/messages";
import { outcome, resetServer, signInAs } from "@/test/server";

import * as categories from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/db/categories", () => ({
  addCategoryTree: vi.fn(),
  categoryNameTaken: vi.fn(),
  createCategory: vi.fn(),
  createSubcategory: vi.fn(),
  deleteCategories: vi.fn(),
  getCategory: vi.fn(),
  listCategories: vi.fn(),
  setCategoryArchived: vi.fn(),
  updateCategory: vi.fn(),
}));

const ID = "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f";
const PARENT = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

beforeEach(() => resetServer());

describe("every write", () => {
  it("is refused to viewers, whatever the input", async () => {
    signInAs("viewer");
    for (const write of Object.values(categories) as ((
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

describe("categories", () => {
  it("adds a category and refuses a taken name", async () => {
    signInAs("editor");
    const input = {
      type: "expense",
      name: "خوراک",
      color: "orange",
      icon: "utensils",
    };
    vi.mocked(categoryNameTaken).mockResolvedValue(false);
    vi.mocked(insertCategory).mockResolvedValue("category-1");
    expect(await categories.createCategory(input)).toEqual({
      ok: true,
      id: "category-1",
    });

    vi.mocked(categoryNameTaken).mockResolvedValue(true);
    expect(await categories.createCategory(input)).toMatchObject({
      ok: false,
      field: "name",
    });
  });

  it("allows one level of subcategories only", async () => {
    signInAs("editor");
    vi.mocked(getCategory).mockResolvedValue({
      id: PARENT,
      parentId: ID,
      type: "expense",
    } as never);

    expect(
      await categories.createSubcategory({
        parentId: PARENT,
        name: "رستوران",
        icon: "utensils",
      }),
    ).toEqual({ ok: false, error: t("categories.failed") });
    expect(insertSubcategory).not.toHaveBeenCalled();
  });
});
