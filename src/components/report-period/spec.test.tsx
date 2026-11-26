import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ReportPeriod } from "@/types/report";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { ReportPeriodBar, ReportPeriodSwitch } from "./index";

// 28 Aban 1405 in Tehran: «ماه» picks Aban, a month before Mehr.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-19T09:00:00Z"));
});
afterEach(() => vi.useRealTimers());

const A_MONTH: ReportPeriod = {
  from: "2026-10-23",
  to: "2026-11-19",
  kind: "month",
  month: { year: 1405, month: 8 },
  isCurrentMonth: true,
  toToday: true,
  previous: { from: "2026-09-23", to: "2026-10-22" },
  months: [],
};

const A_CUSTOM: ReportPeriod = {
  from: "2026-07-23",
  to: "2026-08-21",
  kind: "custom",
  month: null,
  isCurrentMonth: false,
  toToday: false,
  previous: { from: "2026-06-22", to: "2026-07-22" },
  months: [],
};

describe("ReportPeriodSwitch", () => {
  it("offers the periods by name", () => {
    renderWithApp(<ReportPeriodSwitch period={A_MONTH} onChange={vi.fn()} />);

    const group = screen.getByRole("radiogroup", {
      name: t("reports.period"),
    });
    expect(group).toBeInTheDocument();
    (["month", "3m", "6m", "12m", "custom"] as const).forEach((kind) =>
      expect(
        screen.getByRole("radio", { name: t(`reports.periods.${kind}`) }),
      ).toBeInTheDocument(),
    );
  });

  it("picks a month period that starts at the current month", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // A radio that is already picked fires no change, so pick from another period.
    renderWithApp(<ReportPeriodSwitch period={A_CUSTOM} onChange={onChange} />);

    await user.click(
      screen.getByRole("radio", { name: t("reports.periods.month") }),
    );

    expect(onChange).toHaveBeenCalledWith({
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 8 },
    });
  });

  it("picks a month count and keeps the custom range's dates for «بازه دلخواه»", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithApp(<ReportPeriodSwitch period={A_MONTH} onChange={onChange} />);

    await user.click(
      screen.getByRole("radio", { name: t("reports.periods.3m") }),
    );
    expect(onChange).toHaveBeenLastCalledWith({ kind: "3m" });

    await user.click(
      screen.getByRole("radio", { name: t("reports.periods.custom") }),
    );
    expect(onChange).toHaveBeenLastCalledWith({
      kind: "custom",
      from: A_MONTH.from,
      to: A_MONTH.to,
    });
  });
});

describe("ReportPeriodBar", () => {
  it("shows the month and its switcher for a month period, and what it is compared with", () => {
    renderWithApp(<ReportPeriodBar period={A_MONTH} onChange={vi.fn()} />);

    expect(screen.getByText("آبان ۱۴۰۵")).toBeInTheDocument();
    expect(
      screen.getByText(t("reports.compare", { period: "مهر ۱۴۰۵" })),
    ).toBeInTheDocument();
    // The current month has no next one.
    expect(
      screen.getByRole("button", { name: t("calendar.nextMonth") }),
    ).toBeDisabled();
  });

  it("steps a month with the switcher", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithApp(
      <ReportPeriodBar
        period={{ ...A_MONTH, isCurrentMonth: false }}
        onChange={onChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: t("calendar.previousMonth") }),
    );
    expect(onChange).toHaveBeenLastCalledWith({
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 7 },
    });
  });

  it("shows the two dates of a custom range and the range it is compared with", () => {
    renderWithApp(<ReportPeriodBar period={A_CUSTOM} onChange={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: t("reports.rangeFrom") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: t("reports.rangeTo") }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t("reports.compare", { period: "تیر ۱۴۰۵" })),
    ).toBeInTheDocument();
  });
});
