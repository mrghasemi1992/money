import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { readOAuthRequest } from "@/auth/oauth";
import { getSession } from "@/auth/session";
import { Login } from "@/components/login";
import { LOGIN_PATH, RETURN_TO_PARAM } from "@/constants/auth";
import { changeLocale } from "@/i18n/actions";
import { getSafeRedirect } from "@/utils/url";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return { title: t("submit") };
}

export const viewport: Viewport = {
  // The on-screen keyboard shrinks the page instead of covering it, so the button stays visible.
  interactiveWidget: "resizes-content",
  // On phones the sign-in screen is the card surface (slate-0 / slate-900).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1e25" },
  ],
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  // Claude's connector sends the browser here with its signed authorization request.
  const oauth = await readOAuthRequest(params);
  const returnTo = params[RETURN_TO_PARAM];
  const safeTarget = getSafeRedirect(
    typeof returnTo === "string" ? returnTo : undefined,
  );
  // Never come back to /login itself.
  const target = safeTarget.startsWith(LOGIN_PATH) ? "/" : safeTarget;

  // Already signed in (checked against the database, not just the cookie). Claude may ask the
  // user to sign in again (prompt=login), so its sign-in always shows the form.
  if (!oauth && (await getSession())) redirect(target);

  return (
    <Login
      returnTo={target}
      oauth={
        oauth ? { query: oauth.query, clientName: oauth.clientName } : null
      }
      onChangeLocale={changeLocale}
    />
  );
}
