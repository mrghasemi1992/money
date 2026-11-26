import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatCompactMoney, formatMoneyNumber } from "@/helpers/money";
import type { ReportTotals } from "@/types/report";
import { formatPercent } from "@/utils/number";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { ReportSummary } from "./index";

const TOTALS: ReportTotals = { income: 302_400_000, expense: 242_400_000 };
const PREVIOUS: ReportTotals = { income: 281_700_000, expense: 251_900_000 };

type SummaryKey = "income" | "expense" | "net";

const section = (key: SummaryKey) =>
  screen.getByRole("region", { name: t(`reports.summary.${key}`) });

// The formatters write narrow spaces; toHaveTextContent reads them as spaces.
const spaces = (text: string) => text.replace(/\s+/g, " ");
const more = (amount: string) => spaces(t("reports.summary.more", { amount }));
const less = (amount: string) => spaces(t("reports.summary.less", { amount }));
const compact = (value: number) => formatCompactMoney(value, "rial", "fa");

describe("ReportSummary", () => {
  it("names its three cards with their amounts and the previous period", () => {
    renderWithApp(<ReportSummary totals={TOTALS} previous={PREVIOUS} />);

    for (const key of ["income", "expense", "net"] as const) {
      const card = section(key);
      const value =
        key === "net" ? TOTALS.income - TOTALS.expense : TOTALS[key];
      expect(card).toHaveTextContent(formatMoneyNumber(value, "rial", "fa"));
      expect(card).toHaveTextContent(
        t.markup("reports.summary.previous", { amount: () => "" }).trim(),
      );
    }
    expect(section("income")).toHaveTextContent(
      formatMoneyNumber(PREVIOUS.income, "rial", "fa"),
    );
    expect(section("expense")).toHaveTextContent(
      formatMoneyNumber(PREVIOUS.expense, "rial", "fa"),
    );
  });

  it("says the change in words: more income, less expense, a bigger net", () => {
    renderWithApp(<ReportSummary totals={TOTALS} previous={PREVIOUS} />);

    // 302.4M against 281.7M is 7% more; 242.4M against 251.9M is 4% less.
    expect(section("income")).toHaveTextContent(more(formatPercent(7, "fa")));
    expect(section("expense")).toHaveTextContent(less(formatPercent(4, "fa")));
    // The net says the difference as an amount: 60M against 29.8M.
    expect(section("net")).toHaveTextContent(more(compact(30_200_000)));
  });

  it("leaves the percent badges off when the previous period had nothing", () => {
    renderWithApp(
      <ReportSummary totals={TOTALS} previous={{ income: 0, expense: 0 }} />,
    );

    for (const key of ["income", "expense"] as const) {
      expect(section(key)).not.toHaveTextContent(more("").trim());
      expect(section(key)).not.toHaveTextContent(less("").trim());
      expect(section(key)).not.toHaveTextContent(t("reports.summary.same"));
    }
    // The net compares amounts, so it still says the difference.
    expect(section("net")).toHaveTextContent(more(compact(60_000_000)));
  });

  it("says a net that fell below an empty previous period is less", () => {
    renderWithApp(
      <ReportSummary
        totals={{ income: 0, expense: 5_000_000 }}
        previous={{ income: 0, expense: 0 }}
      />,
    );

    expect(section("net")).toHaveTextContent(less(compact(5_000_000)));
  });

  it("says no change when the period is like the one before", () => {
    renderWithApp(<ReportSummary totals={TOTALS} previous={TOTALS} />);

    for (const key of ["income", "expense", "net"] as const) {
      expect(
        within(section(key)).getByText(t("reports.summary.same")),
      ).toBeInTheDocument();
    }
  });
});
