import type { Messages } from "@/messages";
import type { Locale } from "@/types/locale";

// Typed next-intl: message keys and locales are checked by TypeScript.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
