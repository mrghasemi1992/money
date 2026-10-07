import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";

import { SAMPLE_CATEGORIES } from "@/components/category-list/sample-categories";
import { STARTER_CATEGORIES } from "@/constants/starter-categories";
import type { ActionResult } from "@/types/action";
import type { Category, CategoryTree } from "@/types/category";

import {
  CategorySettings,
  CategorySettingsError,
  CategorySettingsSkeleton,
} from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));
const ok = async (): Promise<ActionResult> => {
  await wait();
  return { ok: true };
};
const created = async () => {
  await wait();
  return { ok: true as const, id: crypto.randomUUID() };
};
const nameTaken = {
  ok: false,
  field: "name",
  error: "دسته‌ای با این نام وجود دارد.",
} as const;

const meta = {
  title: "Components/CategorySettings",
  component: CategorySettings,
  args: {
    categories: SAMPLE_CATEGORIES,
    canWrite: true,
    onCreate: created,
    onCreateSubcategory: created,
    onUpdate: ok,
    onArchive: ok,
    onDelete: ok,
    onRestore: created,
    onAddStarters: async () => {
      await wait();
      return { ok: true, ids: [] };
    },
  },
  argTypes: { categories: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CategorySettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Applies a change to every category and subcategory in the tree. */
function mapTree(
  tree: CategoryTree,
  change: (category: Category) => Category,
): CategoryTree {
  return { expense: tree.expense.map(change), income: tree.income.map(change) };
}

/**
 * The page with working fakes: add, rename, recolor, archive, restore and delete categories
 * and subcategories, and add suggestions on an empty tab. Changes stay in the story, as the
 * page's refresh would show them.
 */
export const Default: Story = {
  render: function Example(args) {
    const [tree, setTree] = useState(args.categories);
    // Undo runs from a toast made earlier: read the latest tree, not the one it saw.
    const latest = useRef(tree);
    latest.current = tree;
    const find = (id: string) =>
      [...latest.current.expense, ...latest.current.income].find(
        (category) =>
          category.id === id ||
          category.subcategories.some((sub) => sub.id === id),
      );
    return (
      <CategorySettings
        {...args}
        categories={tree}
        onCreate={async (input) => {
          await wait();
          if (
            latest.current[input.type].some(
              (item) => item.name === input.name.trim(),
            )
          ) {
            return nameTaken;
          }
          const id = crypto.randomUUID();
          setTree((current) => ({
            ...current,
            [input.type]: [
              ...current[input.type],
              {
                ...input,
                name: input.name.trim(),
                id,
                archived: false,
                transactionCount: 0,
                subcategories: [],
              },
            ],
          }));
          return { ok: true, id };
        }}
        onCreateSubcategory={async ({ parentId, name }) => {
          await wait();
          if (
            find(parentId)?.subcategories.some((s) => s.name === name.trim())
          ) {
            return nameTaken;
          }
          const id = crypto.randomUUID();
          setTree((current) =>
            mapTree(current, (category) =>
              category.id === parentId
                ? {
                    ...category,
                    subcategories: [
                      ...category.subcategories,
                      {
                        id,
                        name: name.trim(),
                        archived: false,
                        transactionCount: 0,
                      },
                    ],
                  }
                : category,
            ),
          );
          return { ok: true, id };
        }}
        onUpdate={async ({ id, name, color }) => {
          await wait();
          setTree((current) =>
            mapTree(current, (category) =>
              category.id === id
                ? {
                    ...category,
                    name: name.trim(),
                    color: color ?? category.color,
                  }
                : {
                    ...category,
                    subcategories: category.subcategories.map((sub) =>
                      sub.id === id ? { ...sub, name: name.trim() } : sub,
                    ),
                  },
            ),
          );
          return { ok: true };
        }}
        onArchive={async ({ id, archived }) => {
          await wait();
          setTree((current) =>
            mapTree(current, (category) =>
              category.id === id
                ? { ...category, archived }
                : {
                    ...category,
                    subcategories: category.subcategories.map((sub) =>
                      sub.id === id ? { ...sub, archived } : sub,
                    ),
                  },
            ),
          );
          return { ok: true };
        }}
        onDelete={async ({ ids }) => {
          await wait();
          const keep = (category: Category) => !ids.includes(category.id);
          setTree((current) =>
            mapTree(
              {
                expense: current.expense.filter(keep),
                income: current.income.filter(keep),
              },
              (category) => ({
                ...category,
                subcategories: category.subcategories.filter(
                  (sub) => !ids.includes(sub.id),
                ),
              }),
            ),
          );
          return { ok: true };
        }}
        onRestore={async ({ type, name, color, subcategories }) => {
          await wait();
          const id = crypto.randomUUID();
          setTree((current) => ({
            ...current,
            [type]: [
              ...current[type],
              {
                id,
                type,
                name,
                color,
                archived: false,
                transactionCount: 0,
                subcategories: subcategories.map((sub) => ({
                  id: crypto.randomUUID(),
                  name: sub,
                  archived: false,
                  transactionCount: 0,
                })),
              },
            ],
          }));
          return { ok: true, id };
        }}
        onAddStarters={async ({ type, keys }) => {
          await wait();
          const added: Category[] = STARTER_CATEGORIES[type]
            .filter((starter) => !keys || keys.includes(starter.key))
            .map((starter) => ({
              id: crypto.randomUUID(),
              type,
              name: starter.name.fa,
              color: starter.color,
              archived: false,
              transactionCount: 0,
              subcategories: starter.subcategories.map((sub) => ({
                id: crypto.randomUUID(),
                name: sub.fa,
                archived: false,
                transactionCount: 0,
              })),
            }));
          setTree((current) => ({
            ...current,
            [type]: [...current[type], ...added],
          }));
          return { ok: true, ids: added.map((category) => category.id) };
        }}
      />
    );
  },
};

/** The income tab. */
export const Income: Story = { args: { defaultType: "income" } };

/** Viewers: the same page without add, edit, archive or delete. */
export const Viewer: Story = { args: { canWrite: false } };

/** No categories yet: suggestions to add with one tap. */
export const Empty: Story = {
  ...Default,
  args: { categories: { expense: [], income: [] } },
};

export const EmptyViewer: Story = {
  args: { categories: { expense: [], income: [] }, canWrite: false },
};

/** loading.tsx */
export const Loading: Story = { render: () => <CategorySettingsSkeleton /> };

/** error.tsx */
export const LoadFailed: Story = {
  render: () => <CategorySettingsError onRetry={() => {}} />,
};
