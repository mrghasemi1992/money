import {
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowUpIcon,
  type LucideIcon,
} from "lucide-react";

import type { TransactionType } from "@/types/transaction";

/**
 * The money-direction icon of each type: ↓ income, ↑ expense, ⇄ transfer. Never mirrored.
 * Apart from constants/transaction.ts because the database schema imports that file.
 */
export const TRANSACTION_TYPE_ICONS: Record<TransactionType, LucideIcon> = {
  expense: ArrowUpIcon,
  income: ArrowDownIcon,
  transfer: ArrowLeftRightIcon,
};
