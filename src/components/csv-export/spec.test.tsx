import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_ACCOUNT_OPTIONS } from "@/components/transaction-list/sample-transactions";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { CsvExport } from "./index";

// 28 Aban 1405 in Tehran.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-19T09:00:00Z"));
});
afterEach(() => vi.useRealTimers());

function setup(onCount = vi.fn().mockResolvedValue(42)) {
  const onDownload = vi.fn();
  renderWithApp(
    <CsvExport
      accounts={SAMPLE_ACCOUNT_OPTIONS}
      onCount={onCount}
      onDownload={onDownload}
    />,
  );
  return { onCount, onDownload, user: userEvent.setup() };
}

const download = () =>
  screen.getByRole("button", { name: t("importExport.export.download") });

describe("CsvExport", () => {
  it("counts this month in the viewer's calendar and downloads it", async () => {
    const { user, onCount, onDownload } = setup();

    // Aban 1405 starts on 23 October 2026.
    expect(onCount).toHaveBeenCalledWith({
      from: "2026-10-23",
      to: "2026-11-19",
      accountId: null,
    });
    expect(await screen.findByText(/۴۲ تراکنش/)).toBeInTheDocument();

    await user.click(download());
    expect(onDownload).toHaveBeenCalledWith(
      "/transactions/export?from=2026-10-23&to=2026-11-19",
    );
    expect(
      screen.getByText(t("importExport.export.downloaded")),
    ).toBeInTheDocument();
  });

  it("switches to last month and this year", async () => {
    const { user, onCount } = setup();

    // The group carries «بازه»; each option keeps its own name.
    expect(
      screen.getByRole("radiogroup", { name: t("importExport.export.range") }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("radio", {
        name: t("importExport.export.presets.lastMonth"),
      }),
    );
    expect(onCount).toHaveBeenLastCalledWith({
      from: "2026-09-23",
      to: "2026-10-22",
      accountId: null,
    });

    await user.click(
      screen.getByRole("radio", {
        name: t("importExport.export.presets.year"),
      }),
    );
    expect(onCount).toHaveBeenLastCalledWith({
      from: "2026-03-21",
      to: "2026-11-19",
      accountId: null,
    });
  });

  it("exports one account", async () => {
    const { user, onCount, onDownload } = setup();
    const account = SAMPLE_ACCOUNT_OPTIONS[1]!;

    await user.click(
      screen.getByRole("combobox", { name: t("importExport.export.account") }),
    );
    await user.click(await screen.findByRole("option", { name: account.name }));
    expect(onCount).toHaveBeenLastCalledWith(
      expect.objectContaining({ accountId: account.id }),
    );

    await user.click(download());
    expect(onDownload).toHaveBeenCalledWith(
      `/transactions/export?from=2026-10-23&to=2026-11-19&account=${account.id}`,
    );
  });

  it("can't download an empty range", async () => {
    setup(vi.fn().mockResolvedValue(0));

    expect(await screen.findByText(/بدون تراکنش/)).toBeInTheDocument();
    expect(download()).toBeDisabled();
  });

  it("still lets the user download when the count fails", async () => {
    setup(vi.fn().mockRejectedValue(new Error("offline")));

    expect(
      await screen.findByText(t("importExport.export.counting")),
    ).toBeInTheDocument();
    expect(download()).toBeEnabled();
  });
});
