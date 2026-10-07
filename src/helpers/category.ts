import type { CSSProperties } from "react";
import { z } from "zod";

import {
  CATEGORY_COLORS,
  CATEGORY_NAME_MAX_LENGTH,
} from "@/constants/category";
import type { CategoryColor } from "@/types/category";
import { tidyName } from "@/utils/text";

/**
 * CSS variables that point a component at one category hue:
 * --cat (dot), --cat-soft (fill) and --cat-text (label on the fill).
 */
export function categoryColorStyle(color: CategoryColor): CSSProperties {
  return {
    "--cat": `var(--cat-${color})`,
    "--cat-soft": `var(--cat-${color}-soft)`,
    "--cat-text": `var(--cat-${color}-text)`,
  } as CSSProperties;
}

/**
 * A category or subcategory name, shared by the category form and the Server Actions.
 * Messages are keys of `categories.form.errors`.
 */
export const categoryNameSchema = z
  .string()
  .transform(tidyName)
  .pipe(
    z
      .string()
      .min(1, "nameMissing")
      .max(CATEGORY_NAME_MAX_LENGTH, "nameTooLong"),
  );

export const categoryColorSchema = z.enum(CATEGORY_COLORS);

/** Keys of the `categories.form.errors` messages. */
export type CategoryNameError = "nameMissing" | "nameTooLong" | "nameTaken";

/** The name's first problem, or null when it is valid. */
export function categoryNameError(name: string): CategoryNameError | null {
  const parsed = categoryNameSchema.safeParse(name);
  if (parsed.success) return null;
  const message = parsed.error.issues[0]?.message;
  return message === "nameMissing" || message === "nameTooLong"
    ? message
    : null;
}

/**
 * The first color of the palette that none of `used` has, so a new category stands out from
 * its siblings; slate when every hue is taken.
 */
export function nextCategoryColor(used: CategoryColor[]): CategoryColor {
  return CATEGORY_COLORS.find((color) => !used.includes(color)) ?? "slate";
}
