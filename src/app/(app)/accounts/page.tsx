import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { AccountSettings } from "@/components/account-settings";
import { listAccounts } from "@/db/accounts";
import { isCounterparty } from "@/helpers/account";
import { canWrite, toUserRole } from "@/helpers/role";

import {
  archiveAccount,
  createAccount,
  deleteAccount,
  reorderAccounts,
  updateAccount,
} from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts");
  return { title: t("title") };
}

export default async function AccountsPage() {
  const { user } = await requireUser();
  // People and lenders (counterparties) are on /debts.
  const accounts = (await listAccounts()).filter(
    (account) => !isCounterparty(account),
  );

  return (
    <AccountSettings
      accounts={accounts}
      // Viewers get the page without write controls; every action checks again.
      canWrite={canWrite(toUserRole(user.role))}
      onCreate={createAccount}
      onUpdate={updateAccount}
      onArchive={archiveAccount}
      onDelete={deleteAccount}
      onReorder={reorderAccounts}
    />
  );
}
