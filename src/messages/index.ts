import type { Locale } from "@/types/locale";

import en from "./en";
import fa, { type Messages } from "./fa";

export type { Messages };

/** Interface copy of every language. Small enough to import together. */
export const MESSAGES: Record<Locale, Messages> = { fa, en };
