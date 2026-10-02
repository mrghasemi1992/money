import type { CATEGORY_COLORS, CATEGORY_TYPES } from "@/constants/category";

/** One of the design's category hues. Tokens: --cat-<color>, --cat-<color>-soft, --cat-<color>-text. */
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export type CategoryType = (typeof CATEGORY_TYPES)[number];
