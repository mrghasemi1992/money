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
      icon: "utensils",
      subcategories: [
        { name: { fa: "سوپرمارکت", en: "Groceries" }, icon: "shopping-basket" },
        {
          name: { fa: "رستوران و کافه", en: "Restaurants and cafés" },
          icon: "coffee",
        },
      ],
    },
    {
      key: "transport",
      name: { fa: "حمل‌ونقل", en: "Transport" },
      color: "sky",
      icon: "car-front",
      subcategories: [
        { name: { fa: "تاکسی", en: "Taxi" }, icon: "car-taxi-front" },
        { name: { fa: "سوخت", en: "Fuel" }, icon: "fuel" },
      ],
    },
    {
      key: "home",
      name: { fa: "خانه", en: "Home" },
      color: "brown",
      icon: "house",
      subcategories: [
        { name: { fa: "اجاره", en: "Rent" }, icon: "key-round" },
        { name: { fa: "قبوض", en: "Bills" }, icon: "receipt" },
      ],
    },
    {
      key: "health",
      name: { fa: "سلامت", en: "Health" },
      color: "red",
      icon: "heart-pulse",
      subcategories: [
        { name: { fa: "دارو", en: "Pharmacy" }, icon: "pill" },
        { name: { fa: "پزشک", en: "Doctor" }, icon: "stethoscope" },
      ],
    },
    {
      key: "leisure",
      name: { fa: "تفریح", en: "Leisure" },
      color: "amber",
      icon: "popcorn",
      subcategories: [],
    },
    {
      key: "subscriptions",
      name: { fa: "اشتراک‌ها", en: "Subscriptions" },
      color: "violet",
      icon: "repeat",
      subcategories: [],
    },
    {
      key: "clothing",
      name: { fa: "پوشاک", en: "Clothing" },
      color: "pink",
      icon: "shirt",
      subcategories: [],
    },
  ],
  income: [
    {
      key: "salary",
      name: { fa: "حقوق", en: "Salary" },
      color: "green",
      icon: "briefcase-business",
      subcategories: [
        { name: { fa: "حقوق ماهانه", en: "Monthly salary" }, icon: "banknote" },
        { name: { fa: "پاداش", en: "Bonus" }, icon: "award" },
      ],
    },
    {
      key: "freelance",
      name: { fa: "کار آزاد", en: "Freelance" },
      color: "lime",
      icon: "laptop",
      subcategories: [],
    },
    {
      key: "interest",
      name: { fa: "سود سپرده", en: "Interest" },
      color: "teal",
      icon: "percent",
      subcategories: [],
    },
    {
      key: "other-income",
      name: { fa: "سایر درآمدها", en: "Other income" },
      color: "slate",
      icon: "coins",
      subcategories: [
        { name: { fa: "هدیه", en: "Gifts" }, icon: "gift" },
        { name: { fa: "بازپرداخت", en: "Refunds" }, icon: "rotate-ccw" },
      ],
    },
  ],
};
