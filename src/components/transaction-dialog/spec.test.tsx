import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTION_OPTIONS,
  SAMPLE_TRANSACTIONS,
} from "@/components/transaction-list/sample-transactions";
import { t } from "@/test/messages";
import { startsWith } from "@/test/queries";
import { renderWithApp } from "@/test/render";

import { TransactionDialog } from "./index";

const { accounts, categories } = SAMPLE_TRANSACTION_OPTIONS;
const [melli, saman] = accounts;
const people = accounts.filter(
  (account) => account.type === "counterparty" && !account.archived,
);
const food = categories.expense[0]!;
const restaurant = food.subcategories.find(
  (sub) => sub.name === "رستوران و کافه",
)!;
// A category with subcategories is listed as «بدون زیردسته» above them; pick its first one.
const salary = categories.income[0]!.subcategories[0] ?? categories.income[0]!;

function setup(props: Partial<Parameters<typeof TransactionDialog>[0]> = {}) {
  const handlers = {
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ ok: true }),
    onDelete: vi.fn(),
  };
  renderWithApp(
    <TransactionDialog
      open
      transaction={null}
      options={SAMPLE_TRANSACTION_OPTIONS}
      today={SAMPLE_TODAY}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

const amount = () =>
  screen.getByRole("textbox", { name: t("transactions.form.amount") });
const button = (name: string) => screen.getByRole("button", { name });
const kind = (name: string) => screen.getByRole("radio", { name });

/** Picks a category (the web form asks for one on income and expense). */
async function pickCategory(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) {
  await user.click(
    screen.getByRole("combobox", { name: t("transactions.form.category") }),
  );
  await user.click(await screen.findByRole("option", { name }));
}

describe("TransactionDialog", () => {
  it("labels every control and closes with Escape", async () => {
    const { user, onOpenChange } = setup();
    const dialog = screen.getByRole("dialog", {
      name: t("transactions.form.newTitle"),
    });

    // The four kinds and every field read with a name, without color or icon.
    for (const kind of ["expense", "income", "transfer", "debt"] as const) {
      expect(
        within(dialog).getByRole("radio", {
          name: t(`transactions.form.kinds.${kind}`),
        }),
      ).toBeInTheDocument();
    }
    for (const control of [
      ...within(dialog).getAllByRole("textbox"),
      ...within(dialog).getAllByRole("combobox"),
      ...within(dialog).getAllByRole("button"),
    ]) {
      expect(control).toHaveAccessibleName();
    }

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("starts a new expense on today and the first account, and asks for the amount", async () => {
    const { user, onSubmit } = setup();

    await user.click(
      button(t("transactions.form.submit", { type: "expense" })),
    );

    expect(
      screen.getByText(t("transactions.form.errors.amountMissing")),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("saves an expense with its subcategory, description and a Persian-digit time", async () => {
    const { user, onSubmit, onOpenChange } = setup();

    await user.type(amount(), "۲۵۰۰۰۰");
    await user.type(
      screen.getByRole("textbox", {
        name: startsWith(t("transactions.form.time")),
      }),
      "۱۴:۳۰",
    );
    await pickCategory(user, restaurant.name);
    await user.type(
      screen.getByRole("textbox", {
        name: startsWith(t("transactions.form.description")),
      }),
      "ناهار",
    );
    await user.click(
      button(t("transactions.form.submit", { type: "expense" })),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      type: "expense",
      amount: 250_000,
      date: SAMPLE_TODAY,
      time: "14:30",
      accountId: melli!.id,
      toAccountId: null,
      categoryId: restaurant.id,
      description: "ناهار",
      tags: [],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("records a transfer between two of the book's accounts, without a category", async () => {
    const { user, onSubmit } = setup();

    await user.click(kind(t("transactions.form.kinds.transfer")));
    await user.type(amount(), "1000000");
    await user.click(
      screen.getByRole("combobox", { name: t("transactions.form.toAccount") }),
    );
    await user.click(await screen.findByRole("option", { name: saman!.name }));
    await user.click(
      button(t("transactions.form.submit", { type: "transfer" })),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "transfer",
        amount: 1_000_000,
        accountId: melli!.id,
        toAccountId: saman!.id,
        categoryId: null,
      }),
    );
  });

  it("refuses a transfer without a destination", async () => {
    const { user, onSubmit } = setup();

    await user.click(kind(t("transactions.form.kinds.transfer")));
    await user.type(amount(), "1000");
    await user.click(
      button(t("transactions.form.submit", { type: "transfer" })),
    );

    expect(
      screen.getByText(t("transactions.form.errors.toAccountMissing")),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("records a receivable on a person, with no category", async () => {
    const { user, onSubmit } = setup();

    await user.click(kind(t("transactions.form.kinds.debt")));
    await user.click(
      screen.getByRole("checkbox", {
        name: startsWith(t("transactions.form.withoutAccount")),
      }),
    );
    await user.type(amount(), "5000000");
    await user.click(
      button(t("transactions.form.submit", { type: "receivable" })),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "receivable",
        amount: 5_000_000,
        accountId: people[0]!.id,
        toAccountId: null,
        categoryId: null,
      }),
    );
  });

  it("keeps the type, account and date after «ثبت و افزودن بعدی» and stays open", async () => {
    const { user, onSubmit, onOpenChange } = setup();

    await user.click(kind(t("transactions.form.kinds.income")));
    await user.type(amount(), "900");
    await pickCategory(user, salary.name);
    await user.click(button(t("transactions.form.submitAnother")));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "income", amount: 900 }),
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(amount()).toHaveValue("");
    expect(amount()).toHaveFocus();
    expect(kind(t("transactions.form.kinds.income"))).toBeChecked();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("edits a transaction and offers to delete it", async () => {
    const transaction = SAMPLE_TRANSACTIONS.find(
      (item) => item.type === "expense",
    )!;
    const { user, onSubmit, onDelete } = setup({ transaction });

    expect(
      screen.getByRole("dialog", { name: t("transactions.form.editTitle") }),
    ).toBeInTheDocument();
    await user.click(button(t("transactions.form.submitEdit")));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "expense",
        amount: transaction.amount,
        date: transaction.date,
        accountId: transaction.accountId,
      }),
    );

    await user.click(button(t("transactions.form.delete")));
    expect(onDelete).toHaveBeenCalledWith(transaction);
  });

  it("shows the server's error on its field", async () => {
    const message = "این حساب بایگانی یا حذف شده است.";
    const { user, onOpenChange } = setup({
      onSubmit: vi
        .fn()
        .mockResolvedValue({ ok: false, field: "accountId", error: message }),
    });

    await user.type(amount(), "1000");
    await pickCategory(user, restaurant.name);
    await user.click(
      button(t("transactions.form.submit", { type: "expense" })),
    );

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
