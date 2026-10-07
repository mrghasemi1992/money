import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { STARTER_CATEGORIES } from "@/constants/starter-categories";

import { StarterCategories } from "./index";

const meta = {
  title: "Components/StarterCategories",
  component: StarterCategories,
  args: {
    type: "expense",
    starters: STARTER_CATEGORIES.expense,
    canWrite: true,
    onAdd: () => {},
    onCreate: () => {},
  },
  argTypes: { starters: { control: false } },
} satisfies Meta<typeof StarterCategories>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No expense categories yet: add suggestions one tap at a time, all at once, or your own. */
export const Expense: Story = {};

export const Income: Story = {
  args: { type: "income", starters: STARTER_CATEGORIES.income },
};

/** «افزودن همه» while the suggestions are being added. */
export const Adding: Story = { args: { pending: true } };

/** Every suggestion is already there (archived, for example): only «افزودن دسته». */
export const NoSuggestions: Story = { args: { starters: [] } };

/** Viewers only see that there is nothing yet. */
export const Viewer: Story = { args: { canWrite: false } };
