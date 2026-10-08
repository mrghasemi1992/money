import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { getMcpResourceUrl } from "@/auth/urls";
import { ConnectorSettings } from "@/components/connector-settings";
import { listConnections } from "@/db/connector";
import { toUserRole } from "@/helpers/role";
import { getPreferences } from "@/i18n/preferences";
import { todayIso } from "@/utils/iso-date";

import { revokeConnection } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("connector");
  return { title: t("title") };
}

export default async function ConnectorPage() {
  const { user } = await requireUser();
  const [connections, { timeZone }] = await Promise.all([
    listConnections(user.id),
    getPreferences(),
  ]);

  return (
    <ConnectorSettings
      url={getMcpResourceUrl()}
      role={toUserRole(user.role)}
      apps={connections.map((connection) => ({
        clientId: connection.clientId,
        name: connection.name,
        // Days in the viewer's time zone.
        connectedOn: todayIso(timeZone, new Date(connection.connectedAt)),
        lastUsedOn: connection.lastUsedAt
          ? todayIso(timeZone, new Date(connection.lastUsedAt))
          : null,
      }))}
      onRevoke={revokeConnection}
    />
  );
}
