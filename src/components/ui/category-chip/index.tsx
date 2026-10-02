import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { categoryColorStyle } from "@/helpers/category";
import type { CategoryColor } from "@/types/category";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type CategoryChipProps = Omit<ComponentProps<"span">, "children"> & {
  name: string;
  /** Subcategory, shown as «خوراک / رستوران». */
  sub?: string;
  color?: CategoryColor;
  /** With an icon, the dot becomes a tinted tile (lists); ignored in the soft variant. */
  icon?: LucideIcon;
  /** plain = dot + text; soft = tinted pill. */
  variant?: "plain" | "soft";
  size?: "sm" | "md";
};

/** A category's identity: its color with its name. The color never appears without the name. */
export function CategoryChip({
  name,
  sub,
  color = "slate",
  icon: Icon,
  variant = "plain",
  size = "md",
  className,
  style,
  ...rest
}: CategoryChipProps) {
  return (
    <span
      className={cx(
        styles.root,
        variant === "soft" && styles.soft,
        size === "sm" && styles.sm,
        className,
      )}
      style={{ ...categoryColorStyle(color), ...style }}
      {...rest}
    >
      {Icon && variant !== "soft" ? (
        <span className={styles.tile}>
          <Icon className={styles.icon} aria-hidden="true" />
        </span>
      ) : (
        <span className={styles.dot} aria-hidden="true" />
      )}
      <span className={styles.name}>
        {name}
        {sub ? (
          <>
            <span className={styles.separator}> / </span>
            <span className={styles.sub}>{sub}</span>
          </>
        ) : null}
      </span>
    </span>
  );
}
