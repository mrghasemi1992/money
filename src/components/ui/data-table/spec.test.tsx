import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "@/test/render";

import { DataTable } from "./index";

const COLUMNS = [
  { key: "category", label: "دسته‌بندی" },
  { key: "amount", label: "مبلغ", align: "end" as const },
  { key: "share", label: "سهم از کل", align: "end" as const },
];

const rows = [
  { key: "house", cells: ["خانه", "۱۳۲٬۶۰۰٬۰۰۰", "۷۸٪"] },
  {
    key: "house-rent",
    level: 1 as const,
    cells: ["اجاره", "۱۰۸٬۰۰۰٬۰۰۰", "۶۴٪"],
  },
  { key: "food", cells: ["خوراک", "۳۷٬۴۴۰٬۰۰۰", "۲۲٪"] },
];

describe("DataTable", () => {
  it("names the table by its caption and lists the columns", () => {
    renderWithApp(
      <DataTable caption="هزینه به تفکیک دسته" columns={COLUMNS} rows={rows} />,
    );

    expect(
      screen.getByRole("table", { name: "هزینه به تفکیک دسته" }),
    ).toBeInTheDocument();
    for (const column of COLUMNS) {
      expect(
        screen.getByRole("columnheader", { name: column.label }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
  });

  it("heads every row with its first cell, sub-rows included", () => {
    renderWithApp(
      <DataTable caption="هزینه به تفکیک دسته" columns={COLUMNS} rows={rows} />,
    );

    expect(screen.getByRole("rowheader", { name: "خانه" })).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "اجاره" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "خوراک" }),
    ).toBeInTheDocument();
  });
});
