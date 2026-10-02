import type { ComponentProps } from "react";

import {
  LogoMark,
  type LogoSize,
  type LogoTone,
} from "@/components/ui/logo-mark";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type LogoProps = Omit<ComponentProps<"span">, "children"> & {
  /** lockup = mark + wordmark, wordmark = «پول» only. Use LogoMark for the mark alone. */
  variant?: "lockup" | "wordmark";
  size?: LogoSize;
  tone?: LogoTone;
};

/** The brand: the پول mark and the wordmark «پول» set in Dana at weight 800. */
export function Logo({
  variant = "lockup",
  size = "md",
  tone = "brand",
  className,
  ...rest
}: LogoProps) {
  return (
    <span
      role="img"
      aria-label="پول"
      className={cx(styles.root, styles[size], styles[tone], className)}
      {...rest}
    >
      {variant === "lockup" ? <LogoMark size={size} tone={tone} /> : null}
      <span className={styles.word} aria-hidden="true">
        پول
      </span>
    </span>
  );
}
