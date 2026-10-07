import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_CATEGORIES } from "@/components/category-list/sample-categories";
import type { ActionResult } from "@/types/action";

import { CategoryDialog, type CategoryFormValues } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));
const [food] = SAMPLE_CATEGORIES.expense;

const meta = {
  title: "Components/CategoryDialog",
  component: CategoryDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    mode: { kind: "new", type: "expense", color: "teal" },
    onSubmit: async ({
      name,
    }: CategoryFormValues): Promise<ActionResult<"name">> => {
      await wait();
      return name.trim() === "خوراک"
        ? { ok: false, field: "name", error: "دسته‌ای با این نام وجود دارد." }
        : { ok: true };
    },
  },
  argTypes: { mode: { control: false } },
} satisfies Meta<typeof CategoryDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new expense category: name and color. «خوراک» comes back as a taken name. */
export const New: Story = {};

/** Rename and recolor: the subcategories take the new color too. */
export const Edit: Story = { args: { mode: { kind: "edit", category: food } } };

/** A subcategory takes its parent's color. */
export const NewSubcategory: Story = {
  args: { mode: { kind: "newSub", parent: food } },
};

export const RenameSubcategory: Story = {
  args: {
    mode: { kind: "editSub", parent: food, subcategory: food.subcategories[0] },
  },
};
