import type {
  TRANSACTION_SOURCES,
  TRANSACTION_TYPES,
} from "@/constants/transaction";

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];
