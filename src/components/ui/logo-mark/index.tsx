import type { ComponentProps } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type LogoTone = "brand" | "inverse" | "mono";
export type LogoSize = "sm" | "md" | "lg" | "xl";

type LogoMarkProps = Omit<ComponentProps<"svg">, "children"> & {
  size?: LogoSize;
  /** brand = royal tile; inverse = white tile for brand-blue grounds; mono = glyph only, in currentColor. */
  tone?: LogoTone;
};

/** The پول mark: Lucide's wallet glyph (ISC) on a royal rounded tile. Decorative; label it in context. */
export function LogoMark({
  size = "md",
  tone = "brand",
  className,
  ...rest
}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cx(styles.root, styles[size], styles[tone], className)}
      {...rest}
    >
      {tone !== "mono" ? (
        <rect className={styles.tile} width="64" height="64" rx="16" />
      ) : null}
      <g
        className={styles.glyph}
        transform={
          tone === "mono"
            ? "translate(3.2 3.2) scale(2.4)"
            : "translate(14 14) scale(1.5)"
        }
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      </g>
    </svg>
  );
}
