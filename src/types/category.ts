import type { CATEGORY_COLORS, CATEGORY_TYPES } from "@/constants/category";
import type { CATEGORY_ICON_GROUPS } from "@/constants/category-icon-words";
import type { CATEGORY_ICONS } from "@/constants/category-icons";
import type { Locale } from "./locale";

/** One of the design's category hues. Tokens: --cat-<color>, --cat-<color>-soft, --cat-<color>-text. */
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export type CategoryType = (typeof CATEGORY_TYPES)[number];

/** A category's icon: the Lucide name of one of CATEGORY_ICONS, as `categories.icon` stores it. */
export type CategoryIcon = keyof typeof CATEGORY_ICONS;

/** A theme of the icon picker. Names: the `categoryIcons.groups` messages. */
export type CategoryIconGroup = (typeof CATEGORY_ICON_GROUPS)[number];

/** An icon's theme and the words that find it; the first word of each language is its name. */
export type CategoryIconWords = {
  group: CategoryIconGroup;
  fa: string[];
  en: string[];
};

/** A subcategory as the categories page lists it. Its color is its parent's; its icon is its own. */
export type Subcategory = {
  id: string;
  name: string;
  icon: CategoryIcon;
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
  icon: CategoryIcon;
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
  icon: CategoryIcon;
  subcategories: { name: Record<Locale, string>; icon: CategoryIcon }[];
};
