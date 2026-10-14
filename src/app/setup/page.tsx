import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Setup } from "@/components/setup";
import { LOGIN_PATH } from "@/constants/auth";
import { hasUsers } from "@/db/users";
import { changeLocale } from "@/i18n/actions";

import { createFirstAdmin } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("setup");
  return { title: t("title") };
}

export const viewport: Viewport = {
  // On phones the setup screen is the card surface, like the sign-in screen.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1e25" },
  ],
};

/**
 * Creates the first admin of a new copy, without a terminal. Only while the book has no users:
 * after that it sends everyone to the sign-in page. /login sends visitors here until then.
 */
export default async function SetupPage() {
  if (await hasUsers()) redirect(LOGIN_PATH);
  return <Setup onCreate={createFirstAdmin} onChangeLocale={changeLocale} />;
}
