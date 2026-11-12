import { SettingsSkeleton } from "@/components/settings";
import { getAppVersion } from "@/helpers/release";

/**
 * Shown inside the app shell while the settings load. The page sits in its own route group so
 * this skeleton doesn't cover the subpages (/settings/connector, /settings/import-export),
 * which have their own.
 */
export default function Loading() {
  return <SettingsSkeleton version={getAppVersion()} />;
}
