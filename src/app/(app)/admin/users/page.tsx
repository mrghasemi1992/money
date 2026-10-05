import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/auth/session";
import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";

export async function generateMetadata(): Promise<Metadata> {
  // Other roles get «not found», so the title doesn't name the page either.
  await requireAdmin();
  const t = await getTranslations("nav");
  return { title: t("users") };
}

export default async function UsersPage() {
  await requireAdmin();
  const t = await getTranslations();

  return (
    <>
      <PageHeader title={t("nav.users")} subtitle={t("users.subtitle")} />
      <PagePlaceholder section="users" />
    </>
  );
}
