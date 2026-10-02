import type { TransactionType } from "@/types/transaction";

/** The word for each transaction type. Money direction is always said in words or a sign, not by color alone. */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "درآمد",
  expense: "هزینه",
  transfer: "انتقال",
};
