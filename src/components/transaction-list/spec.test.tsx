import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { TransactionList } from "./index";
import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTIONS,
  sampleDayTotals,
} from "./sample-transactions";

function setup(props: Partial<Parameters<typeof TransactionList>[0]> = {}) {
  const handlers = {
    onOpen: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onLoadMore: vi.fn(),
  };
  renderWithApp(
    <TransactionList
      transactions={SAMPLE_TRANSACTIONS}
      dayTotals={sampleDayTotals(SAMPLE_TRANSACTIONS)}
      canWrite
      today={SAMPLE_TODAY}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

const dayHeadings = () =>
  screen
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent);

describe("TransactionList", () => {
  it("groups the rows by day, newest first, with today and yesterday named", () => {
    setup();

    // The samples are 11 transactions on 6 days; today is 15 Mehr 1405 (7 October 2026).
    const headings = dayHeadings();
    expect(headings).toHaveLength(6);
    expect(headings[0]).toContain("امروز، چهارشنبه ۱۵ مهر ۱۴۰۵");
    expect(headings[1]).toContain("دیروز، سه‌شنبه ۱۴ مهر ۱۴۰۵");
    expect(headings[2]).toContain("دوشنبه ۱۳ مهر ۱۴۰۵");
    expect(headings[5]).toContain("چهارشنبه ۱ مهر ۱۴۰۵");
    const lists = screen.getAllByRole("list");
    const rows = lists.flatMap((list) => within(list).getAllByRole("listitem"));
    expect(rows).toHaveLength(11);
  });

  it("names the days in the viewer's calendar", () => {
    renderWithApp(
      <TransactionList
        transactions={SAMPLE_TRANSACTIONS}
        dayTotals={sampleDayTotals(SAMPLE_TRANSACTIONS)}
        canWrite={false}
        today={SAMPLE_TODAY}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onLoadMore={vi.fn()}
      />,
      { calendar: "gregorian" },
    );

    const headings = dayHeadings();
    expect(headings[0]).toContain("امروز، چهارشنبه ۷ اکتبر ۲۰۲۶");
    expect(headings[5]).toContain("چهارشنبه ۲۳ سپتامبر ۲۰۲۶");
  });

  it("gives writers an edit and a delete button on each row", async () => {
    const { user, onEdit, onDelete } = setup();
    const edits = screen.getAllByRole("button", {
      name: t("transactions.list.edit"),
    });
    const deletes = screen.getAllByRole("button", {
      name: t("transactions.list.delete"),
    });
    expect(edits).toHaveLength(SAMPLE_TRANSACTIONS.length);
    expect(deletes).toHaveLength(SAMPLE_TRANSACTIONS.length);

    await user.click(edits[1]!);
    await user.click(deletes[2]!);
    expect(onEdit).toHaveBeenCalledWith(SAMPLE_TRANSACTIONS[1]);
    expect(onDelete).toHaveBeenCalledWith(SAMPLE_TRANSACTIONS[2]);
  });

  it("gives viewers no edit or delete buttons, but rows still open", async () => {
    const { user, onOpen } = setup({ canWrite: false });

    expect(
      screen.queryByRole("button", { name: t("transactions.list.edit") }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: t("transactions.list.delete") }),
    ).not.toBeInTheDocument();

    const first = screen.getAllByRole("listitem")[0]!;
    await user.click(within(first).getAllByRole("button")[0]!);
    expect(onOpen).toHaveBeenCalledWith(SAMPLE_TRANSACTIONS[0]);
  });

  it("shows each transaction's tags and description", () => {
    setup();
    const tagged = SAMPLE_TRANSACTIONS.find((row) => row.tags.length > 0)!;
    const described = SAMPLE_TRANSACTIONS.find((row) => row.description)!;

    expect(screen.getAllByText(tagged.tags[0]!).length).toBeGreaterThan(0);
    expect(screen.getAllByText(described.description).length).toBeGreaterThan(
      0,
    );
  });

  it("offers more rows only when there are more", async () => {
    const { user, onLoadMore } = setup({ hasMore: true });

    await user.click(
      screen.getByRole("button", { name: t("transactions.loadMore") }),
    );
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it("has no «more» button at the end of the list", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: t("transactions.loadMore") }),
    ).not.toBeInTheDocument();
  });
});
