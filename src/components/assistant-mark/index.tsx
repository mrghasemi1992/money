import { SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { assistantName } from "@/helpers/transaction-source";
import type { TransactionSource } from "@/types/transaction";

import styles from "./styles.module.css";

type AssistantMarkProps = {
  source: TransactionSource;
};

/**
 * The mark on a transaction row that Claude or ChatGPT recorded: the assistant's name in a
 * badge, and on phones only the sparkle icon, as tall as the title's first line so it stays
 * beside it when the title wraps. Nothing for the app's own rows and CSV imports.
 */
export function AssistantMark({ source }: AssistantMarkProps) {
  const t = useTranslations("transactions.list");
  const name = assistantName(source);
  if (!name) return null;
  const tip = t("assistantTip", { name });
  return (
    <>
      {/* Hidden on phones by its own wrapper: a class on Badge would tie with Badge's own display. */}
      <span className={styles.badge}>
        <Badge tone="brand" size="sm" icon={SparklesIcon} title={tip}>
          {name}
        </Badge>
      </span>
      <span className={styles.icon} title={tip}>
        <SparklesIcon aria-hidden="true" />
        <span className="visually-hidden">{tip}</span>
      </span>
    </>
  );
}
