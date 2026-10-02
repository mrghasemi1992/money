import type { TransactionType } from "@/types/transaction";

/** Transaction types, in the order forms list them. Stored as text in `transactions.type`. */
export const TRANSACTION_TYPES = ["expense", "income", "transfer"] as const;

/** Where a transaction was recorded. Stored in `transactions.source`. */
export const TRANSACTION_SOURCES = ["web", "mcp", "csv"] as const;

/** The word for each transaction type. Money direction is always said in words or a sign, not by color alone. */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "درآمد",
  expense: "هزینه",
  transfer: "انتقال",
};
