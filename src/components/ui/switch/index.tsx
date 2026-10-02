"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ReactNode } from "react";

import choice from "@/styles/choice.module.css";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
  disabled?: boolean;
  name?: string;
  className?: string;
  "aria-label"?: string;
};

/** A setting that applies at once (archive an account, show archived). */
export function Switch({
  label,
  description,
  size = "md",
  className,
  onCheckedChange,
  ...rest
}: SwitchProps) {
  const track = (
    <BaseSwitch.Root
      className={cx(
        styles.track,
        size === "sm" && styles.sm,
        !label && !description && className,
      )}
      onCheckedChange={(checked) => onCheckedChange?.(checked)}
      {...rest}
    >
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
  );

  if (!label && !description) return track;

  return (
    <label className={cx(choice.label, className)}>
      {track}
      <span className={choice.text}>
        {label ? <span className={choice.title}>{label}</span> : null}
        {description ? (
          <span className={choice.description}>{description}</span>
        ) : null}
      </span>
    </label>
  );
}
