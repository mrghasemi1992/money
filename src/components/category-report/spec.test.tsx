import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SAMPLE_CATEGORY_REPORT } from "@/components/reports/sample-reports";
import { formatMoneyNumber } from "@/helpers/money";
import type { MoneyUnit } from "@/types/currency";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { CategoryReport } from "./index";

/** Persian, rials, as the tests render. */
const UNIT: MoneyUnit = "rial";
const money = (value: number) => formatMoneyNumber(value, UNIT, "fa");

const EXPENSE = SAMPLE_CATEGORY_REPORT.expense;
const total = EXPENSE.reduce((sum, row) => sum + row.amount, 0);

function setup(type: "income" | "expense" = "expense") {
  const rows = type === "expense" ? EXPENSE : SAMPLE_CATEGORY_REPORT.income;
  renderWithApp(<CategoryReport type={type} rows={rows} />);
  return { user: userEvent.setup() };
}

describe("CategoryReport", () => {
  it("names the card by its type and says the total", () => {
    setup();

    const card = screen.getByRole("region", {
      name: t("reports.categories.expenseTitle"),
    });
    expect(
      card
        .textContent!.replace(/\s+/g, " ")
        .includes(t("reports.total", { amount: money(total) })),
    ).toBe(true);
    // The hint says the rows open: their chevron alone doesn't say it.
    expect(
      within(card).getByText(t("reports.categories.hint")),
    ).toBeInTheDocument();
  });

  it("names the transactions without a category", () => {
    setup();

    expect(
      screen.getByText(t("reports.categories.uncategorized")).closest("li"),
    ).toBeInTheDocument();
  });

  it("opens a category to its subcategories, with what its own rows spent", async () => {
    const { user } = setup();

    const food = screen.getByRole("button", { name: /خوراک/ });
    await user.click(food);
    expect(food).toHaveAttribute("aria-expanded", "true");

    const subs = ["سوپرمارکت", "رستوران و کافه", "میوه و تره‌بار"];
    for (const name of subs) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(
      screen.getByText(t("reports.categories.direct")),
    ).toBeInTheDocument();
  });

  it("lists the same figures as a table, subcategories under their category", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("radio", { name: t("chart.table") }));
    const table = screen.getByRole("table", {
      name: t("reports.categories.expenseTitle"),
    });
    expect(
      within(table).getByRole("rowheader", {
        name: t("reports.categories.uncategorized"),
      }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("rowheader", { name: "اجاره" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state without the view switch", () => {
    renderWithApp(<CategoryReport type="expense" rows={[]} />);

    expect(screen.getByText(t("reports.none.expense"))).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("titles the income report for income", () => {
    setup("income");

    expect(
      screen.getByRole("region", {
        name: t("reports.categories.incomeTitle"),
      }),
    ).toBeInTheDocument();
  });
});
