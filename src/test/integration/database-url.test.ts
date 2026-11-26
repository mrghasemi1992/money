import { describe, expect, it, vi } from "vitest";

import { isTestDatabaseName, testDatabaseUrl } from "./database-url";

describe("isTestDatabaseName", () => {
  it("accepts names ending in _test and refuses the book's database", () => {
    expect(isTestDatabaseName("money_test")).toBe(true);
    expect(isTestDatabaseName("test")).toBe(true);
    expect(isTestDatabaseName("neondb")).toBe(false);
    expect(isTestDatabaseName("latest")).toBe(false);
    expect(isTestDatabaseName("money_test_copy")).toBe(false);
  });
});

describe("testDatabaseUrl", () => {
  it("returns a URL that names a test database", () => {
    vi.stubEnv(
      "TEST_DATABASE_URL",
      "postgresql://u:p@ep-1.neon.tech/money_test?sslmode=require",
    );
    expect(testDatabaseUrl()).toBe(
      "postgresql://u:p@ep-1.neon.tech/money_test?sslmode=require",
    );
  });

  it("refuses the book's database, so the tests never wipe it", () => {
    vi.stubEnv(
      "TEST_DATABASE_URL",
      "postgresql://u:p@ep-1.neon.tech/neondb?sslmode=require",
    );
    expect(() => testDatabaseUrl()).toThrow('the database "neondb"');
  });

  it("explains a missing variable", () => {
    vi.stubEnv("TEST_DATABASE_URL", "");
    expect(() => testDatabaseUrl()).toThrow("TEST_DATABASE_URL is not set");
  });
});
