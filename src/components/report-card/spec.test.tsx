import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { ReportCard } from "./index";

const chart = <div role="region" aria-label="بخش نمودار" />;
const table = <div role="region" aria-label="بخش جدول" />;

function setup(
  props: Partial<Parameters<typeof ReportCard>[0]> & { children?: never } = {},
) {
  renderWithApp(
    <ReportCard title="ماه به ماه" chart={chart} table={table} {...props} />,
  );
  return { user: userEvent.setup() };
}

describe("ReportCard", () => {
  it("names the section by its title and opens on the chart", () => {
    setup();

    expect(
      screen.getByRole("region", { name: "ماه به ماه" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "بخش نمودار" }),
    ).toBeInTheDocument();
  });

  it("switches between the chart and the same figures as a table", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("radio", { name: t("chart.table") }));
    expect(
      screen.getByRole("region", { name: "بخش جدول" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "بخش نمودار" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: t("chart.chart") }));
    expect(
      screen.getByRole("region", { name: "بخش نمودار" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "بخش جدول" }),
    ).not.toBeInTheDocument();
  });

  it("opens on the table when asked", () => {
    setup({ defaultView: "table" });

    expect(
      screen.getByRole("region", { name: "بخش جدول" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "بخش نمودار" }),
    ).not.toBeInTheDocument();
  });

  it("shows its finding above the figures", () => {
    setup({ summary: "خوراک بیش از همه بالا رفت." });

    expect(screen.getByText("خوراک بیش از همه بالا رفت.")).toBeInTheDocument();
  });

  it("replaces the figures and their switch with the empty state", () => {
    setup({ empty: "در این دوره درآمد یا هزینه‌ای ثبت نشده." });

    expect(
      screen.getByText("در این دوره درآمد یا هزینه‌ای ثبت نشده."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "بخش نمودار" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "بخش جدول" }),
    ).not.toBeInTheDocument();
  });
});
