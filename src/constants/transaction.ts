/** Transaction types, in the order forms list them. Stored as text in `transactions.type`. */
export const TRANSACTION_TYPES = ["expense", "income", "transfer"] as const;

/**
 * Where a transaction was recorded. Stored in `transactions.source`. «mcp» is Claude (the
 * first connector), «chatgpt» is ChatGPT through the same MCP endpoint.
 */
export const TRANSACTION_SOURCES = ["web", "mcp", "chatgpt", "csv"] as const;

/**
 * Descriptions that only say «don't know» (daily-transactions marked unknown transactions
 * with «؟»). They are saved as an empty description: what makes a transaction unknown is a
 * missing category, not its description.
 */
export const UNKNOWN_DESCRIPTION_MARKS: readonly string[] = ["؟", "?"];

/**
 * The one free-text field of a transaction. Lists show it on one line and cut long ones off
 * with an ellipsis; the detail shows all of it. Room for an old note merged into it (#133).
 */
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 300;

/** Between a description and a note merged into it (`withNote`, migration 0010). */
export const NOTE_SEPARATOR = " — ";

/** Tags per transaction, and characters per tag. */
export const TRANSACTION_TAGS_MAX = 10;
export const TRANSACTION_TAG_MAX_LENGTH = 30;

/** Rows per page of the transactions list; «نمایش بیشتر» loads the next page. */
export const TRANSACTION_PAGE_SIZE = 50;

/** Existing tags offered as suggestions in the form and the filter, most used first. */
export const TRANSACTION_TAG_SUGGESTIONS_MAX = 200;

/** Characters of a search on the transactions page. */
export const TRANSACTION_SEARCH_MAX_LENGTH = 100;
