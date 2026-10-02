import type { CSSProperties } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type SkeletonProps = {
  /** text = a line of text (height follows the font), rect = a block, circle = an avatar. */
  variant?: "text" | "rect" | "circle";
  /** CSS length, such as "60%" or "var(--avatar-md)". A circle with only a width is round. */
  width?: string;
  height?: string;
  /** For text: number of lines; the last one is shorter. */
  lines?: number;
  className?: string;
};

/** Placeholder while content loads. Pulses opacity; still under reduced motion. Hidden from screen readers. */
export function Skeleton({
  variant = "rect",
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <span
        className={cx(styles.lines, className)}
        style={{ width }}
        aria-hidden="true"
      >
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cx(
              styles.root,
              styles.text,
              index === lines - 1 && styles.last,
            )}
          />
        ))}
      </span>
    );
  }

  const style: CSSProperties = {
    width,
    height: variant === "circle" && height === undefined ? width : height,
  };
  return (
    <span
      className={cx(styles.root, styles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}
