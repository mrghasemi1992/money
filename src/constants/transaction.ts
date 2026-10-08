/** Transaction types, in the order forms list them. Stored as text in `transactions.type`. */
export const TRANSACTION_TYPES = ["expense", "income", "transfer"] as const;

/** Where a transaction was recorded. Stored in `transactions.source`. */
export const TRANSACTION_SOURCES = ["web", "mcp", "csv"] as const;

/**
 * Descriptions that only say «don't know» (daily-transactions marked unknown transactions
 * with «؟»). They are saved as an empty description: what makes a transaction unknown is a
 * missing category, not its description.
 */
export const UNKNOWN_DESCRIPTION_MARKS: readonly string[] = ["؟", "?"];

/** Descriptions show on one line in lists; long ones are cut off with an ellipsis. */
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 100;

export const TRANSACTION_NOTE_MAX_LENGTH = 200;

/** Tags per transaction, and characters per tag. */
export const TRANSACTION_TAGS_MAX = 10;
export const TRANSACTION_TAG_MAX_LENGTH = 30;

/** Rows per page of the transactions list; «نمایش بیشتر» loads the next page. */
export const TRANSACTION_PAGE_SIZE = 50;

/** Existing tags offered as suggestions in the form and the filter, most used first. */
export const TRANSACTION_TAG_SUGGESTIONS_MAX = 200;

/** Characters of a search on the transactions page. */
export const TRANSACTION_SEARCH_MAX_LENGTH = 100;
