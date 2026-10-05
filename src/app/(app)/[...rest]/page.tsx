import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("page.notFound");
  return { title: t("title") };
}

/**
 * Any other path: «page not found» inside the app shell (the root not-found page would render
 * without it). Specific routes always win over this catch-all.
 */
export default async function UnknownPage() {
  await requireUser();
  notFound();
}
