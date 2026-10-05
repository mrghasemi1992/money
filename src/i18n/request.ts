import { getRequestConfig } from "next-intl/server";

import { MESSAGES } from "@/messages";

import { getPreferences } from "./preferences";

/** next-intl's per-request config (no locale in the URL): language and copy for this request. */
export default getRequestConfig(async () => {
  const { locale, timeZone } = await getPreferences();
  return { locale, messages: MESSAGES[locale], timeZone };
});
