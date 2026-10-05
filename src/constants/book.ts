import type { BookSettings } from "@/types/book";

import { DEFAULT_CURRENCY } from "./currency";

/** The book's id in the one-row `book` table. */
export const BOOK_ID = 1;

/** Used until an admin saves the book settings, and for signed-out pages. */
export const DEFAULT_BOOK_SETTINGS: BookSettings = {
  currency: DEFAULT_CURRENCY,
};
