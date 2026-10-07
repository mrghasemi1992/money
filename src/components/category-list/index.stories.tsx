import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "@/components/ui/card";

import { ArchivedCategoryList, CategoryList } from "./index";
import { SAMPLE_CATEGORIES } from "./sample-categories";

const noop = () => {};

const meta = {
  title: "Components/CategoryList",
  component: CategoryList,
  args: {
    categories: SAMPLE_CATEGORIES.expense.filter(
      (category) => !category.archived,
    ),
    canWrite: true,
    "aria-label": "دسته‌های هزینه",
    onEdit: noop,
    onAddSubcategory: noop,
    onArchive: noop,
    onDelete: noop,
    onRenameSubcategory: noop,
    onArchiveSubcategory: noop,
    onDeleteSubcategory: noop,
  },
  argTypes: { categories: { control: false } },
  render: (args) => (
    <Card padding="none">
      <CategoryList {...args} />
    </Card>
  ),
} satisfies Meta<typeof CategoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each category with its subcategories in its color, and a menu on every row. */
export const Expense: Story = {};

export const Income: Story = {
  args: {
    categories: SAMPLE_CATEGORIES.income,
    "aria-label": "دسته‌های درآمد",
  },
};

/** Viewers: no menus, no add-subcategory buttons. */
export const ReadOnly: Story = { args: { canWrite: false } };

/** Archived categories, and archived subcategories of active ones («تفریح / سفر»). */
export const Archived: Story = {
  render: () => {
    const [, , , leisure, , , education] = SAMPLE_CATEGORIES.expense;
    return (
      <Card variant="sunken" padding="none">
        <ArchivedCategoryList
          items={[
            { category: leisure, subcategory: leisure.subcategories[1] },
            { category: education },
          ]}
          canWrite
          onRestore={noop}
          onDelete={noop}
        />
      </Card>
    );
  },
};
