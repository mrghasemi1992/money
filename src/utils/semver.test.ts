import { describe, expect, it } from "vitest";

import { isNewerVersion, normalizeVersion } from "./semver";

describe("versions", () => {
  it("reads tags with or without a v, ignoring pre-release suffixes", () => {
    expect(normalizeVersion("v0.7.0")).toBe("0.7.0");
    expect(normalizeVersion(" 1.2.3-beta.1 ")).toBe("1.2.3");
    expect(normalizeVersion("latest")).toBeNull();
  });

  it("compares major, minor and patch as numbers", () => {
    expect(isNewerVersion("0.10.0", "0.9.9")).toBe(true);
    expect(isNewerVersion("v1.0.0", "0.99.99")).toBe(true);
    expect(isNewerVersion("0.7.0", "0.7.0")).toBe(false);
    expect(isNewerVersion("0.6.9", "0.7.0")).toBe(false);
    expect(isNewerVersion("nonsense", "0.7.0")).toBe(false);
  });
});
