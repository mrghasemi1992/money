import type {
  Category,
  CategoryIcon,
  CategoryTree,
  Subcategory,
} from "@/types/category";

/** Categories for stories: names stay Persian. */

let next = 0;
const id = () => `7a1c2e90-3b4d-4f5a-8c6d-${String(++next).padStart(12, "0")}`;

function sub(
  name: string,
  icon: CategoryIcon,
  transactionCount: number,
  archived = false,
): Subcategory {
  return { id: id(), name, icon, transactionCount, archived };
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
      icon: "utensils",
      subcategories: [
        sub("سوپرمارکت", "shopping-basket", 31),
        sub("رستوران و کافه", "coffee", 14),
        sub("میوه و تره‌بار", "apple", 6),
      ],
    }),
    category({
      type: "expense",
      name: "حمل‌ونقل",
      color: "sky",
      icon: "car-front",
      subcategories: [
        sub("تاکسی اینترنتی", "car-taxi-front", 22),
        sub("سوخت", "fuel", 8),
        sub("مترو و اتوبوس", "train-front", 0),
      ],
    }),
    category({
      type: "expense",
      name: "خانه",
      color: "brown",
      icon: "house",
      subcategories: [sub("اجاره", "key-round", 7), sub("قبوض", "receipt", 19)],
    }),
    category({
      type: "expense",
      name: "تفریح",
      color: "amber",
      icon: "popcorn",
      subcategories: [
        sub("سینما و تئاتر", "film", 4),
        sub("سفر", "luggage", 3, true),
      ],
    }),
    category({
      type: "expense",
      name: "اشتراک‌ها",
      color: "violet",
      icon: "repeat",
      transactionCount: 11,
      subcategories: [],
    }),
    category({
      type: "expense",
      name: "پوشاک",
      color: "pink",
      icon: "shirt",
      subcategories: [],
    }),
    category({
      type: "expense",
      name: "آموزش",
      color: "teal",
      icon: "graduation-cap",
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
      icon: "briefcase-business",
      subcategories: [
        sub("حقوق ماهانه", "banknote", 6),
        sub("پاداش", "award", 1),
      ],
    }),
    category({
      type: "income",
      name: "کار آزاد",
      color: "lime",
      icon: "laptop",
      subcategories: [sub("پروژه", "handshake", 4)],
    }),
  ],
};
