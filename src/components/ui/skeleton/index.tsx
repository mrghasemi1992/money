import type { CSSProperties, ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type SkeletonProps = {
  /**
   * text = a line of text, exactly one line of the surrounding font tall (put it inside an
   * element with the real text's font so the two match); rect = a block; circle = an avatar.
   */
  variant?: "text" | "rect" | "circle";
  /** CSS length, such as "60%" or "var(--avatar-md)". A circle with only a width is round. */
  width?: string;
  height?: string;
  /** Corner radius, a CSS length such as "var(--radius-lg)", to match the shape it stands in for. */
  radius?: string;
  /** For text: number of lines; the last one is shorter. */
  lines?: number;
  className?: string;
};

/** Placeholder while content loads. Pulses opacity; still under reduced motion. Hidden from screen readers. */
export function Skeleton({
  variant = "rect",
  width,
  height,
  radius,
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
    borderRadius: radius,
  };
  return (
    <span
      className={cx(styles.root, styles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Placeholder bars shaped like a sentence: the words are laid out but not shown, so the bars
 * wrap onto as many lines as the real text will. For text whose length is known but whose exact
 * wording isn't yet (such as a note that depends on the role). Hidden from screen readers.
 */
export function SkeletonWords({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(styles.root, styles.words, className)}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
