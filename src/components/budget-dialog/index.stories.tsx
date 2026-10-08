import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_BUDGET_CATEGORIES } from "@/components/budget-list/sample-budgets";
import type { BudgetField } from "@/helpers/budget";
import type { ActionResult } from "@/types/action";

import { BudgetDialog } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

const UNBUDGETED = SAMPLE_BUDGET_CATEGORIES.filter(
  (category) => category.budget === null,
);

const meta = {
  title: "Components/BudgetDialog",
  component: BudgetDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    category: null,
    options: UNBUDGETED,
    onSubmit: async (): Promise<
      ActionResult<BudgetField, { created: boolean }>
    > => {
      await wait();
      return { ok: true, created: true };
    },
    onSaved: () => {},
    onRemove: () => {},
  },
  argTypes: { category: { control: false }, options: { control: false } },
} satisfies Meta<typeof BudgetDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new budget: choose an expense category without one, and its monthly limit. */
export const New: Story = {};

/** «تعیین بودجه» on a category without a budget: the category is already chosen. */
export const ForCategory: Story = { args: { category: UNBUDGETED[0] } };

/** Editing: the category is fixed, its subcategories are named, and it can be removed. */
export const Edit: Story = { args: { category: SAMPLE_BUDGET_CATEGORIES[0] } };

/** An error from the server comes back on its field. */
export const ServerError: Story = {
  args: {
    category: UNBUDGETED[0],
    onSubmit: async () => {
      await wait();
      return {
        ok: false,
        field: "categoryId",
        error:
          "این دسته‌بندی بایگانی یا حذف شده است. دسته‌ی دیگری انتخاب کنید.",
      };
    },
  },
};
