import { describe, expect, it } from "vitest";

import { parseImportAmount } from "./csv-values";

const RIAL = 1;
const TOMAN = 10;
const CENTS = 100;

describe("parseImportAmount", () => {
  it("reads Latin, Persian and Arabic digits with thousands separators", () => {
    expect(parseImportAmount("1,250,000", RIAL)).toEqual({
      minor: 1_250_000,
      negative: false,
    });
    expect(parseImportAmount("۱٬۲۵۰٬۰۰۰", RIAL)).toEqual({
      minor: 1_250_000,
      negative: false,
    });
    expect(parseImportAmount("١٢٣", RIAL)).toEqual({
      minor: 123,
      negative: false,
    });
  });

  it("converts the written unit to the smallest unit", () => {
    expect(parseImportAmount("125,000", TOMAN)).toEqual({
      minor: 1_250_000,
      negative: false,
    });
    expect(parseImportAmount("12.5", CENTS)).toEqual({
      minor: 1250,
      negative: false,
    });
    expect(parseImportAmount("1.234,56", CENTS)).toEqual({
      minor: 123_456,
      negative: false,
    });
  });

  it("reads dots as thousands for a unit without decimals", () => {
    expect(parseImportAmount("1.000", RIAL)).toEqual({
      minor: 1000,
      negative: false,
    });
    expect(parseImportAmount("1.234.567", RIAL)).toEqual({
      minor: 1_234_567,
      negative: false,
    });
  });

  it("marks negative amounts written with a minus or parentheses", () => {
    for (const value of ["-500", "500-", "−500", "(500)"]) {
      expect(parseImportAmount(value, RIAL)).toEqual({
        minor: 500,
        negative: true,
      });
    }
  });

  it("drops currency marks and spaces", () => {
    expect(parseImportAmount("۵۰۰ ریال", RIAL)).toEqual({
      minor: 500,
      negative: false,
    });
    expect(parseImportAmount("$ 12.00", CENTS)).toEqual({
      minor: 1200,
      negative: false,
    });
  });

  it("says why a cell isn't an amount", () => {
    expect(parseImportAmount("  ", RIAL)).toEqual({ error: "amountMissing" });
    expect(parseImportAmount("12,O00", RIAL)).toEqual({
      error: "amountInvalid",
    });
    expect(parseImportAmount("0", RIAL)).toEqual({ error: "amountZero" });
    expect(parseImportAmount("1.5", RIAL)).toEqual({
      error: "amountDecimals",
    });
    expect(parseImportAmount("1.555", CENTS)).toEqual({
      error: "amountDecimals",
    });
    expect(parseImportAmount("9".repeat(16), RIAL)).toEqual({
      error: "amountTooLarge",
    });
  });
});
