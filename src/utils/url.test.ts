import { describe, expect, it } from "vitest";

import { getSafeRedirect } from "./url";

describe("getSafeRedirect", () => {
  it("keeps a path on this site with its query and hash", () => {
    expect(getSafeRedirect("/transactions?month=1405-08#top")).toBe(
      "/transactions?month=1405-08#top",
    );
    expect(getSafeRedirect("/settings/users")).toBe("/settings/users");
  });

  it("falls back without a target", () => {
    expect(getSafeRedirect(null)).toBe("/");
    expect(getSafeRedirect(undefined, "/budgets")).toBe("/budgets");
    expect(getSafeRedirect("")).toBe("/");
  });

  // #109: each of these leaves the site once the browser normalizes it.
  it.each([
    "https://evil.example",
    "evil.example",
    "//evil.example",
    "/\\evil.example",
    "/.//evil.example",
    "/./\\evil.example",
    "/%2e//evil.example",
    "/..//evil.example",
    "javascript:alert(1)",
  ])("refuses %s", (target) => {
    expect(getSafeRedirect(target)).toBe("/");
  });

  it("normalizes dot segments that stay on the site", () => {
    expect(getSafeRedirect("/a/../transactions")).toBe("/transactions");
  });
});
