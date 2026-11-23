import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { t } from "@/test/messages";
import { findToast } from "@/test/queries";
import { renderWithApp } from "@/test/render";

import { CsvImport } from "./index";
import { SAMPLE_IMPORT_BOOK } from "./sample-import";

// 28 Aban 1405 in Tehran: the file's Mehr dates are in the past.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-19T09:00:00Z"));
});
afterEach(() => vi.useRealTimers());

/** Two good rows on names the book has, and one without an amount. */
const CSV = `تاریخ,شرح,مبلغ,نوع,حساب,دسته,زیردسته
۱۴۰۵/۰۷/۱۰,خرید هفتگی,۸۵۰٬۰۰۰,هزینه,بانک ملی,خوراک,سوپرمارکت
۱۴۰۵/۰۷/۱۲,حقوق مهر,۴۵٬۰۰۰٬۰۰۰,درآمد,بانک ملی,حقوق,حقوق ماهانه
۱۴۰۵/۰۷/۱۳,نان,,هزینه,بانک ملی,خوراک,
`;

const RESULT = {
  added: 2,
  skipped: 0,
  failed: 1,
  created: { accounts: 0, categories: 0, subcategories: 0 },
};

function setup() {
  const onCheckDuplicates = vi
    .fn()
    .mockResolvedValue({ ok: true, duplicates: [] });
  const onImport = vi.fn().mockResolvedValue({ ok: true, result: RESULT });
  const view = renderWithApp(
    <CsvImport
      book={SAMPLE_IMPORT_BOOK}
      onCheckDuplicates={onCheckDuplicates}
      onImport={onImport}
    />,
  );
  return { onCheckDuplicates, onImport, view, user: userEvent.setup() };
}

const next = (name: string) => screen.getByRole("button", { name });

async function upload(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
  file: File,
) {
  // The visible «انتخاب فایل» button opens this hidden input.
  const input =
    container.querySelector<HTMLInputElement>('input[type="file"]')!;
  await user.upload(input, file);
}

describe("CsvImport", () => {
  it("marks the current step and names the first step's controls", () => {
    setup();

    const uploadStep = screen
      .getAllByText(t("importExport.import.steps.upload"))
      .find((element) => element.closest("ol"))!
      .closest("li")!;
    expect(uploadStep).toHaveAttribute("aria-current", "step");
    expect(
      screen.getByRole("button", {
        name: t("importExport.import.upload.choose"),
      }),
    ).toHaveAccessibleName();
  });

  it("reads a file, maps it, checks it and adds the good rows", async () => {
    const { user, view, onCheckDuplicates, onImport } = setup();

    await upload(
      user,
      view.container,
      new File([CSV], "mehr.csv", { type: "text/csv" }),
    );
    expect(
      await screen.findByText(t("importExport.import.upload.read")),
    ).toBeInTheDocument();
    await user.click(next(t("importExport.import.next.upload")));

    // Columns were guessed from the Persian headers; an IRR book asks rial or toman.
    await user.click(next(t("importExport.import.next.map")));
    expect(
      screen.getByText(t("importExport.import.map.unitMissing")),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("radio", { name: t("preferences.rialUnits.rial") }),
    );
    await user.click(next(t("importExport.import.next.map")));

    await user.click(next(t("importExport.import.next.match")));
    await waitFor(() => expect(onCheckDuplicates).toHaveBeenCalledOnce());
    expect(onCheckDuplicates.mock.calls[0]![0]).toHaveLength(2);

    await user.click(
      await screen.findByRole("button", {
        name: t("importExport.import.next.review", {
          countNumber: 2,
          count: "۲",
        }),
      }),
    );

    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMode: "typed",
        rialUnit: "rial",
        addDuplicates: [],
      }),
    );
    expect(onImport.mock.calls[0]![0].records).toHaveLength(3);
    expect(
      await screen.findByText(t("importExport.import.result.title")),
    ).toBeInTheDocument();
  });

  it("refuses a file that isn't CSV", async () => {
    const { view } = setup();
    // A dropped file skips the input's accept filter, so the import checks the type itself.
    const user = userEvent.setup({ applyAccept: false });

    await upload(
      user,
      view.container,
      new File(["%PDF"], "statement.pdf", { type: "application/pdf" }),
    );

    expect(
      await screen.findByText(t("importExport.import.upload.errors.notCsv")),
    ).toBeInTheDocument();
  });

  it("refuses a file with only a header row", async () => {
    const { user, view } = setup();

    await upload(
      user,
      view.container,
      new File(["تاریخ,مبلغ,حساب\n"], "empty.csv", { type: "text/csv" }),
    );
    await screen.findByText(t("importExport.import.upload.read"));
    await user.click(next(t("importExport.import.next.upload")));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      t("importExport.import.upload.errors.empty"),
    );

    // Unticking «first row is headers» makes it a data row, and the error goes.
    await user.click(
      screen.getByRole("checkbox", {
        name: t("importExport.import.upload.headerRow"),
      }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps the review open and says why when saving fails", async () => {
    const { user, view, onImport } = setup();
    onImport.mockResolvedValue({ ok: false, error: t("importExport.failed") });

    await upload(
      user,
      view.container,
      new File([CSV], "mehr.csv", { type: "text/csv" }),
    );
    await screen.findByText(t("importExport.import.upload.read"));
    await user.click(next(t("importExport.import.next.upload")));
    await user.click(
      screen.getByRole("radio", { name: t("preferences.rialUnits.rial") }),
    );
    await user.click(next(t("importExport.import.next.map")));
    await user.click(next(t("importExport.import.next.match")));
    await user.click(
      await screen.findByRole("button", {
        name: t("importExport.import.next.review", {
          countNumber: 2,
          count: "۲",
        }),
      }),
    );

    expect(await findToast(t("importExport.failed"))).toBeInTheDocument();
    expect(
      screen.queryByText(t("importExport.import.result.title")),
    ).not.toBeInTheDocument();
  });
});
