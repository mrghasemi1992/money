import { Separator } from "@base-ui/react/separator";
import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  /** Text in the middle of a horizontal line, such as «یا». */
  label?: ReactNode;
  /** One step stronger, between major sections. */
  strong?: boolean;
  className?: string;
};

/** Hairline between groups of content. */
export function Divider({
  orientation = "horizontal",
  label,
  strong = false,
  className,
}: DividerProps) {
  if (label != null) {
    return (
      <div role="separator" className={cx(styles.labelled, className)}>
        {label}
      </div>
    );
  }
  return (
    <Separator
      orientation={orientation}
      className={cx(styles.root, strong && styles.strong, className)}
    />
  );
}
