/** Transaction types, in the order forms list them. Stored as text in `transactions.type`. */
export const TRANSACTION_TYPES = ["expense", "income", "transfer"] as const;

/** Where a transaction was recorded. Stored in `transactions.source`. */
export const TRANSACTION_SOURCES = ["web", "mcp", "csv"] as const;
