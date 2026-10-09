import {
  BanknoteIcon,
  CreditCardIcon,
  PiggyBankIcon,
  type LucideIcon,
} from "lucide-react";

import type { AccountType } from "@/types/account";

/**
 * The icon of each kind of account. Apart from constants/account.ts because the database
 * schema imports that file, and scripts that load the schema (`pnpm user:create`) can't load
 * React components.
 */
export const ACCOUNT_TYPE_ICONS: Record<AccountType, LucideIcon> = {
  bank: CreditCardIcon,
  cash: BanknoteIcon,
  other: PiggyBankIcon,
};
