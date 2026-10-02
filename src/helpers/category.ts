import type { CSSProperties } from "react";

import type { CategoryColor } from "@/types/category";

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
