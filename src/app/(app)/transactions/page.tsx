import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { AddTransactionButton } from "@/components/add-transaction";
import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";
import { DateText } from "@/components/ui/date-text";
import { canWrite, toUserRole } from "@/helpers/role";
import { getPreferences } from "@/i18n/preferences";
import { todayIso } from "@/utils/iso-date";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("transactions") };
}

export default async function TransactionsPage() {
  const { user } = await requireUser();
  const t = await getTranslations("nav");
  const { timeZone } = await getPreferences();

  return (
    <>
      <PageHeader
        title={t("transactions")}
        subtitle={<DateText value={todayIso(timeZone)} format="month" />}
        actions={
          canWrite(toUserRole(user.role)) ? <AddTransactionButton /> : null
        }
      />
      <PagePlaceholder section="transactions" />
    </>
  );
}
