/**
 * Category colors from the design: 10 hues plus neutral slate, chosen to be told apart in both
 * themes. A category is always shown with its name, never by color alone. The color names for
 * the picker are the `categoryColor` messages.
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

/** Category types. Stored as text in `categories.type`; a subcategory has its parent's type. */
export const CATEGORY_TYPES = ["expense", "income"] as const;
