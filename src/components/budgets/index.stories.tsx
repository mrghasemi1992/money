import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  SAMPLE_BUDGET_CATEGORIES,
  SAMPLE_BUDGET_MONTH,
} from "@/components/budget-list/sample-budgets";
import { resolveBudgetMonth } from "@/helpers/budget";
import { usePreferences } from "@/hooks/use-preferences";
import type { BudgetCategory } from "@/types/budget";

import { Budgets, BudgetsError, BudgetsSkeleton } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

/** The stories' today: 8 October 2026 (16 Mehr 1405). */
const TODAY = "2026-10-08";

const meta = {
  title: "Components/Budgets",
  component: Budgets,
  args: {
    categories: SAMPLE_BUDGET_CATEGORIES,
    month: SAMPLE_BUDGET_MONTH,
    canWrite: true,
    onSave: async () => {
      await wait();
      return { ok: true, created: true };
    },
    onDelete: async ({ categoryId }) => {
      await wait();
      return { ok: true, deleted: { categoryId, amount: 1 } };
    },
  },
  argTypes: { categories: { control: false }, month: { control: false } },
  parameters: {
    layout: "padded",
    nextjs: { navigation: { pathname: "/budgets" } },
  },
  render: function Example(args) {
    const { calendar } = usePreferences();
    // The month follows the toolbar's calendar: Mehr 1405 or October 2026.
    const month = resolveBudgetMonth(null, calendar, TODAY);
    const [categories, setCategories] = useState(args.categories);
    const patch = (id: string, change: Partial<BudgetCategory>) =>
      setCategories((current) =>
        current.map((category) =>
          category.id === id ? { ...category, ...change } : category,
        ),
      );
    return (
      <Budgets
        {...args}
        month={month}
        categories={categories}
        onSave={async (input) => {
          await wait();
          const created =
            categories.find((category) => category.id === input.categoryId)
              ?.budget === null;
          patch(input.categoryId, { budget: input.amount });
          return { ok: true, created };
        }}
        onDelete={async ({ categoryId }) => {
          await wait();
          const amount =
            categories.find((category) => category.id === categoryId)?.budget ??
            0;
          patch(categoryId, { budget: null });
          return { ok: true, deleted: { categoryId, amount } };
        }}
      />
    );
  },
} satisfies Meta<typeof Budgets>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The month with working fakes: set a budget from a category without one, edit, remove and
 * undo. Changes stay in the story, as the page's refresh would show them.
 */
export const Default: Story = {};

/** Viewers read the same page, without add or edit controls. */
export const Viewer: Story = { args: { canWrite: false } };

/** No budgets yet: the empty state, with the expense categories below. */
export const Empty: Story = {
  args: {
    categories: SAMPLE_BUDGET_CATEGORIES.map((category) => ({
      ...category,
      budget: null,
    })),
  },
};

/** No budgets yet, as a viewer sees it. */
export const EmptyViewer: Story = {
  args: { ...Empty.args, canWrite: false },
};

/** No expense categories at all: budgets need them first. */
export const NoCategories: Story = { args: { categories: [] } };

export const Loading: Story = { render: () => <BudgetsSkeleton /> };

export const Error: Story = {
  render: () => <BudgetsError onRetry={() => {}} />,
};
