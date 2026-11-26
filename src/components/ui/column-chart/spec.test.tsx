import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { formatMoney, formatMoneyNumber } from "@/helpers/money";
import type { MoneyUnit } from "@/types/currency";
import { formatPercent } from "@/utils/number";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { ColumnChart } from "./index";

/** Persian, rials, as the tests render: build the figures the chart reads out. */
const UNIT: MoneyUnit = "rial";

const points = [
  {
    key: "1405-06",
    label: "شهریور ۱۴۰۵",
    shortLabel: "شهریور",
    income: 45_000_000,
    expense: 39_600_000,
  },
  {
    key: "1405-07",
    label: "مهر ۱۴۰۵",
    shortLabel: "مهر",
    income: 66_100_000,
    expense: 40_300_000,
  },
  {
    key: "1405-08",
    label: "آبان ۱۴۰۵",
    shortLabel: "آبان",
    income: 45_000_000,
    expense: 29_100_000,
    partial: true,
  },
];

const column = (label: string) =>
  screen.getByRole("button", { name: new RegExp(label) });

describe("ColumnChart", () => {
  it("reads out the picked month's figures, including its savings rate", () => {
    renderWithApp(
      <ColumnChart
        points={points}
        selectedKey="1405-07"
        aria-label="ماه به ماه"
      />,
    );

    const readout = screen.getByText("مهر ۱۴۰۵").closest("div")!;
    // Income and expense read without their unit in the readout; the net shows it.
    expect(readout).toHaveTextContent(
      formatMoneyNumber(66_100_000, UNIT, "fa"),
    );
    expect(readout).toHaveTextContent(
      formatMoneyNumber(40_300_000, UNIT, "fa"),
    );
    expect(readout).toHaveTextContent(
      formatMoneyNumber(66_100_000 - 40_300_000, UNIT, "fa"),
    );
    expect(readout).toHaveTextContent(t("chart.units.rial"));
    // Saved 25.8M of 66.1M: a savings rate of 39%.
    expect(readout).toHaveTextContent(formatPercent(39, "fa"));
  });

  it("names every column for screen readers and keeps one tab stop", () => {
    renderWithApp(
      <ColumnChart
        points={points}
        selectedKey="1405-08"
        aria-label="ماه به ماه"
      />,
    );

    const last = points[points.length - 1]!;
    expect(
      screen.getByRole("group", { name: "ماه به ماه" }),
    ).toBeInTheDocument();
    const net = last.income - last.expense;
    expect(column(last.label)).toHaveAttribute(
      "aria-label",
      t("chart.column", {
        label: last.label,
        income: formatMoney(last.income, UNIT, "fa"),
        expense: formatMoney(last.expense, UNIT, "fa"),
        net: formatMoney(net, UNIT, "fa"),
      }),
    );
    // The picked month is the one tab stop; the arrows move between columns.
    expect(column(last.label)).not.toHaveAttribute("tabindex", "-1");
    for (const point of points.slice(0, -1)) {
      expect(column(point.label)).toHaveAttribute("tabindex", "-1");
    }
  });

  it("moves between the columns with the arrows of the reading direction", async () => {
    const user = userEvent.setup();
    renderWithApp(
      <ColumnChart
        points={points}
        selectedKey="1405-06"
        aria-label="ماه به ماه"
      />,
    );

    // Persian reads right to left: the left arrow goes to the next month.
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(column("مهر ۱۴۰۵")).toHaveFocus();
    // The readout follows the focused column.
    expect(screen.getByText("مهر ۱۴۰۵")).toBeInTheDocument();
    expect(screen.queryByText("شهریور ۱۴۰۵")).not.toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(column("شهریور ۱۴۰۵")).toHaveFocus();
  });

  it("says «بدون درآمد» for a month without income instead of a rate", () => {
    renderWithApp(
      <ColumnChart
        points={[
          {
            key: "1405-01",
            label: "فروردین ۱۴۰۵",
            shortLabel: "فروردین",
            income: 0,
            expense: 12_000_000,
          },
        ]}
        aria-label="ماه به ماه"
      />,
    );

    const readout = screen.getByText("فروردین ۱۴۰۵").closest("div")!;
    expect(within(readout).getByText(t("chart.noIncome"))).toBeInTheDocument();
  });
});
