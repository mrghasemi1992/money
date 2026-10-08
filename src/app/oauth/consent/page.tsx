import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { readOAuthRequest } from "@/auth/oauth";
import { getSession } from "@/auth/session";
import { ConnectorConsent } from "@/components/connector-consent";
import { LOGIN_PATH } from "@/constants/auth";
import { toUserRole } from "@/helpers/role";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("connector");
  return { title: t("title") };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#11141a" },
  ],
};

/**
 * The OAuth consent page: Better Auth sends the browser here, signed in, with Claude's signed
 * authorization request. Signed-out visitors sign in first and come back through Better Auth.
 */
export default async function ConsentPage({
  searchParams,
}: PageProps<"/oauth/consent">) {
  const request = await readOAuthRequest(await searchParams);
  const session = await getSession();
  if (!session) {
    redirect(request ? `${LOGIN_PATH}?${request.query}` : LOGIN_PATH);
  }
  const { user } = session;
  return (
    <ConnectorConsent
      request={
        request
          ? {
              query: request.query,
              clientName: request.clientName,
              redirectHost: request.redirectHost,
            }
          : null
      }
      user={{
        name: user.name,
        username: user.displayUsername ?? user.username ?? "",
        role: toUserRole(user.role),
      }}
    />
  );
}
