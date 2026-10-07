import type { CATEGORY_COLORS, CATEGORY_TYPES } from "@/constants/category";
import type { Locale } from "./locale";

/** One of the design's category hues. Tokens: --cat-<color>, --cat-<color>-soft, --cat-<color>-text. */
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export type CategoryType = (typeof CATEGORY_TYPES)[number];

/** A subcategory as the categories page lists it. Its color is its parent's. */
export type Subcategory = {
  id: string;
  name: string;
  archived: boolean;
  /** Transactions in this subcategory. */
  transactionCount: number;
};

/** A top-level category with its subcategories, as the categories page lists it. */
export type Category = {
  id: string;
  type: CategoryType;
  name: string;
  color: CategoryColor;
  archived: boolean;
  /** Transactions in the category itself, not counting its subcategories. */
  transactionCount: number;
  subcategories: Subcategory[];
};

/** The book's categories, split by type. */
export type CategoryTree = Record<CategoryType, Category[]>;

/** A suggested category the categories page offers when a type has none (or few). */
export type StarterCategory = {
  /** Stable id of the suggestion, used to pick it; never stored. */
  key: string;
  name: Record<Locale, string>;
  color: CategoryColor;
  subcategories: Record<Locale, string>[];
};
