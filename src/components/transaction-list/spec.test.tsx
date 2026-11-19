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

const days = [...new Set(SAMPLE_TRANSACTIONS.map((row) => row.date))];

describe("TransactionList", () => {
  it("groups the rows by day, newest first, with today named", () => {
    setup();

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(days.length);
    expect(headings[0]).toHaveTextContent(t("common.today"));
    const lists = screen.getAllByRole("list");
    const rows = lists.flatMap((list) => within(list).getAllByRole("listitem"));
    expect(rows).toHaveLength(SAMPLE_TRANSACTIONS.length);
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
