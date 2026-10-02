import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/auth/session";
import { Login } from "@/components/login";
import { LOGIN_PATH, RETURN_TO_PARAM } from "@/constants/auth";
import { getSafeRedirect } from "@/utils/url";

export const metadata: Metadata = { title: "ورود" };

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
  const returnTo = (await searchParams)[RETURN_TO_PARAM];
  const safeTarget = getSafeRedirect(
    typeof returnTo === "string" ? returnTo : undefined,
  );
  // Never come back to /login itself.
  const target = safeTarget.startsWith(LOGIN_PATH) ? "/" : safeTarget;

  // Already signed in (checked against the database, not just the cookie).
  if (await getSession()) redirect(target);

  return <Login returnTo={target} />;
}
