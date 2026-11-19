import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { exportTransactions } from "@/db/transactions";
import { outcome, resetServer, signInAs } from "@/test/server";
import type { ExportedTransaction } from "@/types/csv";

import { GET } from "./route";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/i18n/preferences", () => import("@/test/server"));
vi.mock("@/db/transactions", () => ({ exportTransactions: vi.fn() }));

const ACCOUNT = "6f1c1f9e-1b2a-4c3d-8e4f-5a6b7c8d9e0f";

function request(query: string) {
  return new NextRequest(`http://money.localhost/transactions/export?${query}`);
}

const row = (overrides: Partial<ExportedTransaction>): ExportedTransaction => ({
  type: "expense",
  date: "2026-10-02",
  time: null,
  amount: 850_000,
  accountName: "بانک ملی",
  toAccountName: null,
  categoryName: "خوراک",
  subcategoryName: null,
  description: "خرید هفتگی",
  tags: [],
  ...overrides,
});

beforeEach(() => resetServer());

describe("GET /transactions/export", () => {
  it("sends signed-out visitors to sign in", async () => {
    expect(
      await outcome(() => GET(request("from=2026-10-01&to=2026-10-31"))),
    ).toBe("redirect /login");
    expect(exportTransactions).not.toHaveBeenCalled();
  });

  it("streams a UTF-8 file with a BOM, page by page, for any role", async () => {
    signInAs("viewer");
    vi.mocked(exportTransactions)
      .mockResolvedValueOnce({ rows: [row({})], nextCursor: "page-2" })
      .mockResolvedValueOnce({
        rows: [row({ description: "تاکسی", amount: 120_000 })],
        nextCursor: null,
      });

    const response = await GET(
      request(`from=2026-10-01&to=2026-10-31&account=${ACCOUNT}`),
    );
    const bytes = new Uint8Array(await response.arrayBuffer());
    const text = new TextDecoder().decode(bytes);

    expect(response.headers.get("Content-Type")).toBe(
      "text/csv; charset=utf-8",
    );
    expect(response.headers.get("Content-Disposition")).toContain("2026-10-01");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(text.trim().split(/\r?\n/)).toHaveLength(3);
    expect(text).toContain("خرید هفتگی");
    expect(text).toContain("تاکسی");
    expect(exportTransactions).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        from: "2026-10-01",
        to: "2026-10-31",
        accountId: ACCOUNT,
      }),
      "page-2",
      expect.any(Number),
    );
  });

  it("keeps a spreadsheet from running a description as a formula", async () => {
    signInAs("editor");
    vi.mocked(exportTransactions).mockResolvedValue({
      rows: [row({ description: '=HYPERLINK("http://evil.example")' })],
      nextCursor: null,
    });

    const text = await (
      await GET(request("from=2026-10-01&to=2026-10-31"))
    ).text();

    expect(text).toContain(`'=HYPERLINK`);
    expect(text).not.toMatch(/(^|,)"?=HYPERLINK/m);
  });

  it("refuses a range that ends before it starts", async () => {
    signInAs("viewer");
    const response = await GET(request("from=2026-10-31&to=2026-10-01"));
    expect(response.status).toBe(400);
    expect(exportTransactions).not.toHaveBeenCalled();
  });
});
