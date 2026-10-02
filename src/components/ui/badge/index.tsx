import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type BadgeProps = ComponentProps<"span"> & {
  tone?: "neutral" | "brand" | "info" | "success" | "warning" | "danger";
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  icon?: LucideIcon;
  /** A small dot before the text, for live status. */
  dot?: boolean;
};

/** Small read-only status label, such as «Claude» on entries it saved. For filters use Tag. */
export function Badge({
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon: Icon,
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        styles.root,
        styles[tone],
        styles[variant],
        size === "sm" && styles.sm,
        className,
      )}
      {...rest}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {Icon ? <Icon className={styles.icon} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
