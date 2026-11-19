import {
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowUpIcon,
  HandCoinsIcon,
  type LucideIcon,
} from "lucide-react";

import type { TRANSACTION_FORM_KINDS } from "@/constants/transaction";
import type { TransactionType } from "@/types/transaction";

/**
 * The money-direction icon of each type: ↓ income, ↑ expense, ⇄ transfer, and a hand with coins
 * for a debt recorded without money moving (receivable, payable). Never mirrored.
 * Apart from constants/transaction.ts because the database schema imports that file.
 */
export const TRANSACTION_TYPE_ICONS: Record<TransactionType, LucideIcon> = {
  expense: ArrowUpIcon,
  income: ArrowDownIcon,
  transfer: ArrowLeftRightIcon,
  receivable: HandCoinsIcon,
  payable: HandCoinsIcon,
};

/** The icon of each of the transaction form's kinds. */
export const TRANSACTION_FORM_KIND_ICONS: Record<
  (typeof TRANSACTION_FORM_KINDS)[number],
  LucideIcon
> = {
  expense: ArrowUpIcon,
  income: ArrowDownIcon,
  transfer: ArrowLeftRightIcon,
  debt: HandCoinsIcon,
};
