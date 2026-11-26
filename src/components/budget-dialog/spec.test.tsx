import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SAMPLE_BUDGET_CATEGORIES } from "@/components/budget-list/sample-budgets";
import { setViewport } from "@/test/browser";
import { t } from "@/test/messages";
import { findToast } from "@/test/queries";
import { renderWithApp } from "@/test/render";

import { BudgetDialog } from "./index";

const BUDGETED = SAMPLE_BUDGET_CATEGORIES.filter(
  (item) => item.budget !== null,
);
const UNBUDGETED = SAMPLE_BUDGET_CATEGORIES.filter(
  (item) => item.budget === null,
);

function setup(props: Partial<Parameters<typeof BudgetDialog>[0]> = {}) {
  const handlers = {
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ ok: true, created: true }),
    onSaved: vi.fn(),
    onRemove: vi.fn(),
  };
  renderWithApp(
    <BudgetDialog
      open
      category={null}
      options={UNBUDGETED}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

const amountField = () =>
  screen.getByRole("textbox", { name: t("budgets.form.amount") });
const submit = () =>
  screen.getByRole("button", { name: t("budgets.form.submit") });

describe("BudgetDialog", () => {
  it("asks for a category and an amount before saving", async () => {
    const { user, onSubmit } = setup();

    await user.click(submit());

    expect(
      screen.getByText(t("budgets.form.errors.categoryMissing")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t("budgets.form.errors.amountMissing")),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("saves a new budget for the chosen category, typed in Persian digits", async () => {
    const category = UNBUDGETED[0]!;
    const { user, onSubmit, onSaved, onOpenChange } = setup({ category });

    expect(
      screen.getByRole("dialog", { name: t("budgets.form.newTitle") }),
    ).toBeInTheDocument();
    await user.type(amountField(), "۱۵۰۰۰۰۰۰");
    await user.click(submit());

    const input = { categoryId: category.id, amount: 15_000_000 };
    expect(onSubmit).toHaveBeenCalledWith(input);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSaved).toHaveBeenCalledWith(input, true);
  });

  it("edits a budget: the category is fixed and its subcategories are named", async () => {
    const category = BUDGETED[0]!;
    const { user, onRemove } = setup({ category });

    const dialog = screen.getByRole("dialog", {
      name: t("budgets.form.editTitle", { name: category.name }),
    });
    expect(amountField()).toHaveValue("۶۰٬۰۰۰٬۰۰۰");
    expect(
      within(dialog).getByRole("combobox", {
        name: t("budgets.form.category"),
      }),
    ).toBeDisabled();
    expect(
      within(dialog).getByText(
        t("budgets.form.subcategories", {
          names: category.subcategories.join(t("common.listSeparator")),
        }),
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: t("budgets.form.remove") }),
    );
    expect(onRemove).toHaveBeenCalledWith(category);
  });

  it("shows a server error on its field and stays open", async () => {
    const { user, onSaved, onOpenChange } = setup({
      category: UNBUDGETED[0]!,
      onSubmit: vi.fn().mockResolvedValue({
        ok: false,
        field: "categoryId",
        error: t("budgets.form.errors.categoryUnavailable"),
      }),
    });

    await user.type(amountField(), "1000");
    await user.click(submit());

    await screen.findByText(t("budgets.form.errors.categoryUnavailable"));
    expect(
      screen.getByRole("combobox", { name: t("budgets.form.category") }),
    ).toHaveAccessibleDescription(t("budgets.form.errors.categoryUnavailable"));
    expect(onSaved).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("stores a limit typed in tomans as rials", async () => {
    const category = UNBUDGETED[0]!;
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, created: true });
    const user = userEvent.setup();
    renderWithApp(
      <BudgetDialog
        open
        category={category}
        options={UNBUDGETED}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        onSaved={vi.fn()}
        onRemove={vi.fn()}
      />,
      { rialUnit: "toman" },
    );

    await user.type(amountField(), "۱۵۰۰۰۰۰");
    await user.click(submit());

    expect(onSubmit).toHaveBeenCalledWith({
      categoryId: category.id,
      amount: 15_000_000,
    });
  });

  it("says the save failed when the action throws", async () => {
    const { user, onSaved } = setup({
      category: UNBUDGETED[0]!,
      onSubmit: vi.fn().mockRejectedValue(new Error("offline")),
    });

    await user.type(amountField(), "1000");
    await user.click(submit());

    expect(await findToast(t("budgets.failed"))).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("opens as a sheet on phones, with the same form", async () => {
    setViewport("mobile");
    const { user, onSubmit } = setup({ category: UNBUDGETED[0]! });

    await user.type(amountField(), "2000");
    await user.click(submit());

    expect(onSubmit).toHaveBeenCalledWith({
      categoryId: UNBUDGETED[0]!.id,
      amount: 2000,
    });
  });
});
