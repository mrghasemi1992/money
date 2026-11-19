import { describe, expect, it } from "vitest";

import {
  formatMoney,
  formatMoneyNumber,
  getMoneyUnit,
  parseMoneyInput,
  unitFractionDigits,
} from "./money";

describe("getMoneyUnit", () => {
  it("shows an IRR book in the viewer's rial or toman, other books in their currency", () => {
    expect(getMoneyUnit("IRR", "toman")).toBe("toman");
    expect(getMoneyUnit("IRR", "rial")).toBe("rial");
    expect(getMoneyUnit("USD", "toman")).toBe("USD");
  });

  it("knows how many decimals each unit has", () => {
    expect(unitFractionDigits("rial")).toBe(0);
    expect(unitFractionDigits("toman")).toBe(1);
    expect(unitFractionDigits("EUR")).toBe(2);
  });
});

describe("formatMoney", () => {
  it("writes rials and tomans from the same stored rials, in Persian digits", () => {
    expect(formatMoney(25_000_000, "rial", "fa")).toBe("۲۵٬۰۰۰٬۰۰۰ ریال");
    expect(formatMoney(25_000_000, "toman", "fa")).toBe("۲٬۵۰۰٬۰۰۰ تومان");
    expect(formatMoney(25_000_005, "toman", "fa")).toBe("۲٬۵۰۰٬۰۰۰٫۵ تومان");
  });

  it("puts dollars, euros and pounds in front in English, with cents", () => {
    expect(formatMoney(123_456, "USD", "en")).toBe("$1,234.56");
    expect(formatMoney(100, "EUR", "en")).toBe("€1.00");
    expect(formatMoney(5, "GBP", "en")).toBe("£0.05");
  });

  it("writes the sign it is asked for, with a real minus", () => {
    expect(formatMoney(-123_456, "USD", "en")).toBe("−$1,234.56");
    expect(formatMoney(1000, "rial", "fa", "plus")).toBe("+۱٬۰۰۰ ریال");
    expect(formatMoney(1000, "rial", "fa", "minus")).toBe("−۱٬۰۰۰ ریال");
    expect(formatMoney(-1000, "rial", "fa", "none")).toBe("۱٬۰۰۰ ریال");
  });

  it("handles the largest safe amount without losing digits", () => {
    expect(formatMoneyNumber(Number.MAX_SAFE_INTEGER, "rial", "en")).toBe(
      "9,007,199,254,740,991",
    );
  });
});

describe("parseMoneyInput", () => {
  it("reads any digits and separators into the stored unit", () => {
    expect(parseMoneyInput("۲٬۵۰۰٬۰۰۰", "rial", "fa")).toEqual({
      value: 2_500_000,
      text: "۲٬۵۰۰٬۰۰۰",
    });
    expect(parseMoneyInput("12.5", "USD", "en")).toEqual({
      value: 1250,
      text: "12.5",
    });
    expect(parseMoneyInput("250000", "toman", "fa").value).toBe(2_500_000);
  });

  it("keeps a decimal point the person is still typing", () => {
    expect(parseMoneyInput("12.", "USD", "en")).toEqual({
      value: 1200,
      text: "12.",
    });
  });

  it("is empty for empty text", () => {
    expect(parseMoneyInput("", "rial", "fa")).toEqual({
      value: null,
      text: "",
    });
  });
});
