import type { CATEGORY_COLORS } from "@/constants/category";

/** One of the design's category hues. Tokens: --cat-<color>, --cat-<color>-soft, --cat-<color>-text. */
export type CategoryColor = (typeof CATEGORY_COLORS)[number];
