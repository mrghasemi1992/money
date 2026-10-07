import type { CategoryType, StarterCategory } from "@/types/category";

/**
 * Suggested categories, offered on the categories page while a type has none. Names are in
 * both languages; addStarterCategories stores them in the language of the user who adds them
 * (stored names are plain text, so they don't change with the viewer's language later).
 */
export const STARTER_CATEGORIES: Record<CategoryType, StarterCategory[]> = {
  expense: [
    {
      key: "food",
      name: { fa: "خوراک", en: "Food" },
      color: "orange",
      subcategories: [
        { fa: "سوپرمارکت", en: "Groceries" },
        { fa: "رستوران و کافه", en: "Restaurants and cafés" },
      ],
    },
    {
      key: "transport",
      name: { fa: "حمل‌ونقل", en: "Transport" },
      color: "sky",
      subcategories: [
        { fa: "تاکسی", en: "Taxi" },
        { fa: "سوخت", en: "Fuel" },
      ],
    },
    {
      key: "home",
      name: { fa: "خانه", en: "Home" },
      color: "brown",
      subcategories: [
        { fa: "اجاره", en: "Rent" },
        { fa: "قبوض", en: "Bills" },
      ],
    },
    {
      key: "health",
      name: { fa: "سلامت", en: "Health" },
      color: "red",
      subcategories: [
        { fa: "دارو", en: "Pharmacy" },
        { fa: "پزشک", en: "Doctor" },
      ],
    },
    {
      key: "leisure",
      name: { fa: "تفریح", en: "Leisure" },
      color: "amber",
      subcategories: [],
    },
    {
      key: "subscriptions",
      name: { fa: "اشتراک‌ها", en: "Subscriptions" },
      color: "violet",
      subcategories: [],
    },
    {
      key: "clothing",
      name: { fa: "پوشاک", en: "Clothing" },
      color: "pink",
      subcategories: [],
    },
  ],
  income: [
    {
      key: "salary",
      name: { fa: "حقوق", en: "Salary" },
      color: "green",
      subcategories: [
        { fa: "حقوق ماهانه", en: "Monthly salary" },
        { fa: "پاداش", en: "Bonus" },
      ],
    },
    {
      key: "freelance",
      name: { fa: "کار آزاد", en: "Freelance" },
      color: "lime",
      subcategories: [],
    },
    {
      key: "interest",
      name: { fa: "سود سپرده", en: "Interest" },
      color: "teal",
      subcategories: [],
    },
    {
      key: "other-income",
      name: { fa: "سایر درآمدها", en: "Other income" },
      color: "slate",
      subcategories: [
        { fa: "هدیه", en: "Gifts" },
        { fa: "بازپرداخت", en: "Refunds" },
      ],
    },
  ],
};
