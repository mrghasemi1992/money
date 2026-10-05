import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";

import {
  LogoMark,
  type LogoSize,
  type LogoTone,
} from "@/components/ui/logo-mark";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type LogoProps = Omit<ComponentProps<"span">, "children"> & {
  /** lockup = mark + wordmark, wordmark = «پول» / «Money» only. Use LogoMark for the mark alone. */
  variant?: "lockup" | "wordmark";
  size?: LogoSize;
  tone?: LogoTone;
};

/**
 * The brand: the mark and the wordmark at weight 800, «پول» in Dana in the Persian interface,
 * «Money» in Plus Jakarta Sans in the English one. Works in Server and Client Components.
 */
export function Logo({
  variant = "lockup",
  size = "md",
  tone = "brand",
  className,
  ...rest
}: LogoProps) {
  const t = useTranslations("metadata");
  return (
    <span
      role="img"
      aria-label={t("appName")}
      className={cx(styles.root, styles[size], styles[tone], className)}
      {...rest}
    >
      {variant === "lockup" ? <LogoMark size={size} tone={tone} /> : null}
      <span className={styles.word} aria-hidden="true">
        {t("appName")}
      </span>
    </span>
  );
}
