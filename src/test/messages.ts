import { createTranslator } from "next-intl";

import { MESSAGES } from "@/messages";

/**
 * The interface copy as the app shows it, to find elements by their text in component tests:
 * `t("budgets.form.editTitle", { name: "خوراک" })`. Persian unless a test asks for English.
 */
export const t = createTranslator({ locale: "fa", messages: MESSAGES.fa });

export const tEn = createTranslator({ locale: "en", messages: MESSAGES.en });
