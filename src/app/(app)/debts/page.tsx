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
} from "../accounts/actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("debts");
  return { title: t("title") };
}

/**
 * «طلب و بدهی» (#47): the people and lenders money is owed to or by, which are accounts of type
 * `counterparty`. Money lent, borrowed or repaid moves as transfers between them and the
 * book's accounts, so it is never income or expense. The accounts page's Server Actions save
 * them (each checks the role again).
 */
export default async function DebtsPage() {
  const { user } = await requireUser();
  const counterparties = (await listAccounts()).filter(isCounterparty);

  return (
    <AccountSettings
      kind="counterparty"
      accounts={counterparties}
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
