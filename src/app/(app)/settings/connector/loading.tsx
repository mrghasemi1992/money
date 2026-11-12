import { getMcpResourceUrl } from "@/auth/urls";
import { ConnectorSettingsSkeleton } from "@/components/connector-settings";

/** Shown inside the app shell while the connected apps load. The address needs no query. */
export default function Loading() {
  return <ConnectorSettingsSkeleton url={getMcpResourceUrl()} />;
}
