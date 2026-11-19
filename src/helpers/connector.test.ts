import { describe, expect, it } from "vitest";

import {
  formatConnectorDate,
  fromMinorUnits,
  isAllowedMcpClient,
  parseConnectorDate,
  toMinorUnits,
} from "./connector";

describe("isAllowedMcpClient", () => {
  it("allows metadata documents on Claude's and ChatGPT's origins", () => {
    expect(
      isAllowedMcpClient("https://claude.ai/oauth/mcp-oauth-client-metadata"),
    ).toBe(true);
    expect(isAllowedMcpClient("https://chatgpt.com/oauth/client.json")).toBe(
      true,
    );
  });

  // #111: anyone can publish a metadata document, so only these origins count.
  it.each([
    "https://claude.ai.evil.example/client.json",
    "https://evil.example/claude.ai",
    "http://claude.ai/client.json",
    "https://claude.ai:8443/client.json",
    "https://sub.chatgpt.com/client.json",
  ])("refuses %s", (clientId) => {
    expect(isAllowedMcpClient(clientId)).toBe(false);
  });

  it("allows a client id that isn't a URL (registered by hand)", () => {
    expect(isAllowedMcpClient("money-cli")).toBe(true);
  });
});

describe("connector dates", () => {
  it("reads either calendar by its year, with any digits", () => {
    expect(parseConnectorDate("1405/07/16")).toBe("2026-10-08");
    expect(parseConnectorDate("۱۴۰۵/۰۷/۱۶")).toBe("2026-10-08");
    expect(parseConnectorDate("2026-10-08")).toBe("2026-10-08");
    expect(parseConnectorDate("2026/10/8")).toBe("2026-10-08");
  });

  it("refuses dates that don't exist or aren't dates", () => {
    expect(parseConnectorDate("1405/12/31")).toBeNull();
    expect(parseConnectorDate("2026-02-29")).toBeNull();
    expect(parseConnectorDate("yesterday")).toBeNull();
  });

  it("writes a date in the user's calendar", () => {
    expect(formatConnectorDate("2026-10-08", "jalali")).toBe("1405/07/16");
    expect(formatConnectorDate("2026-10-08", "gregorian")).toBe("2026-10-08");
  });
});

describe("connector amounts", () => {
  it("converts the main unit to the smallest one", () => {
    expect(toMinorUnits(2_500_000, "IRR")).toBe(2_500_000);
    expect(toMinorUnits(12.34, "USD")).toBe(1234);
    expect(toMinorUnits(0.1, "EUR")).toBe(10);
    expect(fromMinorUnits(123_456, "GBP")).toBe(1234.56);
  });

  it("refuses amounts the currency can't hold", () => {
    expect(toMinorUnits(0, "USD")).toBeNull();
    expect(toMinorUnits(-5, "USD")).toBeNull();
    expect(toMinorUnits(12.345, "USD")).toBeNull();
    expect(toMinorUnits(1.5, "IRR")).toBeNull();
    expect(toMinorUnits(Number.NaN, "IRR")).toBeNull();
    expect(toMinorUnits(Number.MAX_SAFE_INTEGER, "USD")).toBeNull();
  });
});
