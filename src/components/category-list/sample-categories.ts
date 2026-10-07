import type { Category, CategoryTree, Subcategory } from "@/types/category";

/** Categories for stories: names stay Persian. */

let next = 0;
const id = () => `7a1c2e90-3b4d-4f5a-8c6d-${String(++next).padStart(12, "0")}`;

function sub(
  name: string,
  transactionCount: number,
  archived = false,
): Subcategory {
  return { id: id(), name, transactionCount, archived };
}

function category(
  fields: Omit<Category, "id" | "archived" | "transactionCount"> &
    Partial<Pick<Category, "archived" | "transactionCount">>,
): Category {
  return { id: id(), archived: false, transactionCount: 0, ...fields };
}

export const SAMPLE_CATEGORIES: CategoryTree = {
  expense: [
    category({
      type: "expense",
      name: "خوراک",
      color: "orange",
      subcategories: [
        sub("سوپرمارکت", 31),
        sub("رستوران و کافه", 14),
        sub("میوه و تره‌بار", 6),
      ],
    }),
    category({
      type: "expense",
      name: "حمل‌ونقل",
      color: "sky",
      subcategories: [
        sub("تاکسی اینترنتی", 22),
        sub("سوخت", 8),
        sub("مترو و اتوبوس", 0),
      ],
    }),
    category({
      type: "expense",
      name: "خانه",
      color: "brown",
      subcategories: [sub("اجاره", 7), sub("قبوض", 19)],
    }),
    category({
      type: "expense",
      name: "تفریح",
      color: "amber",
      subcategories: [sub("سینما و تئاتر", 4), sub("سفر", 3, true)],
    }),
    category({
      type: "expense",
      name: "اشتراک‌ها",
      color: "violet",
      transactionCount: 11,
      subcategories: [],
    }),
    category({
      type: "expense",
      name: "پوشاک",
      color: "pink",
      subcategories: [],
    }),
    category({
      type: "expense",
      name: "آموزش",
      color: "teal",
      archived: true,
      transactionCount: 6,
      subcategories: [],
    }),
  ],
  income: [
    category({
      type: "income",
      name: "حقوق",
      color: "green",
      subcategories: [sub("حقوق ماهانه", 6), sub("پاداش", 1)],
    }),
    category({
      type: "income",
      name: "کار آزاد",
      color: "lime",
      subcategories: [sub("پروژه", 4)],
    }),
  ],
};
