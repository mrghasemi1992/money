import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { AddTransactionButton } from "@/components/add-transaction";
import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";
import { canWrite, toUserRole } from "@/helpers/role";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("reports") };
}

export default async function ReportsPage() {
  const { user } = await requireUser();
  const t = await getTranslations("nav");

  return (
    <>
      <PageHeader
        title={t("reports")}
        actions={
          canWrite(toUserRole(user.role)) ? <AddTransactionButton /> : null
        }
      />
      <PagePlaceholder section="reports" />
    </>
  );
}
