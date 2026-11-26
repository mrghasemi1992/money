import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { formatMoneyNumber } from "@/helpers/money";
import type { MoneyUnit } from "@/types/currency";
import { formatPercent } from "@/utils/number";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { BarList } from "./index";

/** Persian, rials, as the tests render: build the figures the rows write. */
const UNIT: MoneyUnit = "rial";
const money = (value: number) => formatMoneyNumber(value, UNIT, "fa");

const items = [
  {
    id: "house",
    name: "خانه",
    value: 132_600_000,
    color: "brown" as const,
    items: [
      { id: "rent", name: "اجاره", value: 108_000_000 },
      { id: "bills", name: "قبوض", value: 10_200_000 },
    ],
  },
  { id: "food", name: "خوراک", value: 37_440_000, color: "orange" as const },
];

/** The bar's width, in percent of the longest row, read from the row's fill. */
function fillWidth(row: HTMLElement): number {
  const fill = row.querySelector<HTMLSpanElement>(
    '[aria-hidden="true"] > span',
  )!;
  const width = parseFloat(fill.getAttribute("style")!.match(/([\d.]+)%/)![1]);
  return width;
}

describe("BarList", () => {
  it("names the list and writes each amount and its share in words", () => {
    renderWithApp(<BarList items={items} aria-label="هزینه به تفکیک دسته" />);

    const list = screen.getByRole("list", { name: "هزینه به تفکیک دسته" });
    const [house, food] = within(list).getAllByRole("listitem");

    expect(within(house!).getByText(money(132_600_000))).toBeInTheDocument();
    const houseShare = formatPercent(
      (132_600_000 / (132_600_000 + 37_440_000)) * 100,
      "fa",
    );
    // The share is written out, so a bar is never the only way to read it.
    expect(house).toHaveTextContent(t("chart.share", { percent: houseShare }));

    expect(within(food!).getByText(money(37_440_000))).toBeInTheDocument();
  });

  it("bars the longest row at full width and the others in proportion", () => {
    renderWithApp(<BarList items={items} aria-label="هزینه به تفکیک دسته" />);

    const rows = screen.getAllByRole("listitem");
    expect(fillWidth(rows[0]!)).toBeCloseTo(100, 3);
    expect(fillWidth(rows[1]!)).toBeCloseTo(
      (items[1]!.value / items[0]!.value) * 100,
      1,
    );
  });

  it("opens a category to its subcategories and closes it again", async () => {
    const user = userEvent.setup();
    renderWithApp(<BarList items={items} aria-label="هزینه به تفکیک دسته" />);

    const house = screen.getByRole("button", { name: /خانه/ });
    expect(house).toHaveAttribute("aria-expanded", "false");

    await user.click(house);
    expect(house).toHaveAttribute("aria-expanded", "true");

    const rent = screen.getByText("اجاره").closest("li")!;
    expect(within(rent).getByText(money(108_000_000))).toBeInTheDocument();
    const subShare = formatPercent((108_000_000 / 132_600_000) * 100, "fa");
    expect(rent).toHaveTextContent(
      t("chart.shareOf", { percent: subShare, name: "خانه" }),
    );

    await user.click(house);
    expect(house).toHaveAttribute("aria-expanded", "false");
    expect(rent).not.toBeVisible();
  });

  it("leaves rows without sub-items closed as plain rows", () => {
    renderWithApp(<BarList items={items} aria-label="هزینه به تفکیک دسته" />);

    expect(
      screen.queryByRole("button", { name: /خوراک/ }),
    ).not.toBeInTheDocument();
  });
});
