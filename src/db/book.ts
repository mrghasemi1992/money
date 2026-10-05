import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { BOOK_ID, DEFAULT_BOOK_SETTINGS } from "@/constants/book";
import type { BookSettings } from "@/types/book";

import { db } from "./index";
import { book } from "./schema";

/** The book's settings, read once per request. Defaults until an admin saves them. */
export const getBookSettings = cache(async (): Promise<BookSettings> => {
  const [row] = await db
    .select({ currency: book.currency })
    .from(book)
    .where(eq(book.id, BOOK_ID));
  return row ?? DEFAULT_BOOK_SETTINGS;
});
