import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatCompactMoney, formatMoneyNumber } from "@/helpers/money";
import { compareAmounts } from "@/helpers/report";
import type { ReportTotals } from "@/types/report";
import { formatPercent } from "@/utils/number";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { ReportSummary } from "./index";

const TOTALS: ReportTotals = { income: 302_400_000, expense: 242_400_000 };
const PREVIOUS: ReportTotals = { income: 281_700_000, expense: 251_900_000 };

type SummaryKey = "income" | "expense" | "net";

const summaryLabel = (key: SummaryKey) =>
  key === "income"
    ? t("reports.summary.income")
    : key === "expense"
      ? t("reports.summary.expense")
      : t("reports.summary.net");

const section = (name: SummaryKey) =>
  screen.getByRole("region", { name: summaryLabel(name) });

/** The badge the component writes for a card's change, with the same helpers. */
function badgeText(
  key: SummaryKey,
  value: number,
  previous: number,
): string | null {
  const change = compareAmounts(value, previous);
  if (change.direction === "same") return t("reports.summary.same");
  if (key !== "net" && change.percent === null) return null;
  const size =
    key === "net"
      ? formatCompactMoney(value - previous, "rial", "fa")
      : formatPercent(change.percent!, "fa");
  const words =
    change.direction === "up"
      ? t("reports.summary.more", { amount: size })
      : t("reports.summary.less", { amount: size });
  // The formatter writes narrow spaces; the reader sees them as spaces.
  return words.replace(/\s+/g, " ");
}

describe("ReportSummary", () => {
  it("names its three cards with their amounts and the previous period", () => {
    renderWithApp(<ReportSummary totals={TOTALS} previous={PREVIOUS} />);

    for (const key of ["income", "expense", "net"] as const) {
      const card = section(key);
      const value =
        key === "net" ? TOTALS.income - TOTALS.expense : TOTALS[key];
      expect(card).toHaveTextContent(formatMoneyNumber(value, "rial", "fa"));
      expect(card).toHaveTextContent("دوره قبل");
      expect(card).toHaveTextContent("ریال");
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

    const incomeBadge = badgeText("income", TOTALS.income, PREVIOUS.income);
    expect(section("income")).toHaveTextContent(incomeBadge!);
    expect(incomeBadge).toContain("بیشتر");

    const expenseBadge = badgeText("expense", TOTALS.expense, PREVIOUS.expense);
    expect(section("expense")).toHaveTextContent(expenseBadge!);
    expect(expenseBadge).toContain("کمتر");

    const net = TOTALS.income - TOTALS.expense;
    const previousNet = PREVIOUS.income - PREVIOUS.expense;
    expect(section("net")).toHaveTextContent(
      badgeText("net", net, previousNet)!,
    );
  });

  it("leaves the percent badge off when the previous period had none", () => {
    renderWithApp(
      <ReportSummary totals={TOTALS} previous={{ income: 0, expense: 0 }} />,
    );

    expect(badgeText("income", TOTALS.income, 0)).toBeNull();
    expect(badgeText("expense", TOTALS.expense, 0)).toBeNull();

    // The net compares amounts, so it still says the difference.
    const net = TOTALS.income - TOTALS.expense;
    expect(section("net")).toHaveTextContent(badgeText("net", net, 0)!);
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
