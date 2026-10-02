/**
 * Category colors from the design: 10 hues plus neutral slate, chosen to be told apart in both
 * themes. A category is always shown with its name, never by color alone.
 */
export const CATEGORY_COLORS = [
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "teal",
  "sky",
  "violet",
  "pink",
  "brown",
  "slate",
] as const;

/** Persian names of the colors, for the category color picker. */
export const CATEGORY_COLOR_NAMES = {
  red: "قرمز",
  orange: "نارنجی",
  amber: "کهربایی",
  lime: "لیمویی",
  green: "سبز",
  teal: "سبزآبی",
  sky: "آبی آسمانی",
  violet: "بنفش",
  pink: "صورتی",
  brown: "قهوه‌ای",
  slate: "خاکستری",
} as const;
