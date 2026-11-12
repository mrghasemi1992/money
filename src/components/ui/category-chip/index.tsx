import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Skeleton } from "@/components/ui/skeleton";
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

/**
 * A chip with an icon while its category loads: a placeholder tile and name in the chip's own
 * size and font, so the real chip takes exactly its place.
 */
export function CategoryChipSkeleton({
  size = "md",
  icon = true,
  width = "96px",
  className,
}: {
  size?: "sm" | "md";
  /** false for a chip with a dot instead of an icon tile, such as «سایر». */
  icon?: boolean;
  /** The name's placeholder: a CSS length. */
  width?: string;
  className?: string;
}) {
  const tile = size === "sm" ? "var(--cat-icon-sm)" : "var(--cat-icon)";
  const dot = size === "sm" ? "var(--cat-dot-sm)" : "var(--cat-dot)";
  return (
    <span
      className={cx(
        styles.root,
        size === "sm" && styles.sm,
        styles.skeleton,
        className,
      )}
      aria-hidden="true"
    >
      {icon ? (
        <Skeleton
          width={tile}
          height={tile}
          radius={size === "sm" ? "var(--radius-md)" : "var(--radius-lg)"}
          className={styles.skeletonTile}
        />
      ) : (
        <Skeleton variant="circle" width={dot} className={styles.skeletonDot} />
      )}
      <Skeleton variant="text" width={width} />
    </span>
  );
}
