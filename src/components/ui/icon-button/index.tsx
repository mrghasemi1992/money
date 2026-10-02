"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Tooltip } from "@/components/ui/tooltip";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: LucideIcon;
  /** Required: becomes the aria-label and the tooltip. */
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  shape?: "square" | "round";
  /** Add when the icon means a direction (back, forward), so it mirrors in RTL. */
  mirrorIcon?: boolean;
  /** Show the label as a tooltip on hover and focus. */
  tooltip?: boolean;
};

/** Icon-only action. Grows to the 44px tap target on phones. */
export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  shape = "square",
  mirrorIcon = false,
  tooltip = true,
  disabled = false,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const button = (
    <BaseButton
      type={type}
      aria-label={label}
      disabled={disabled}
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        shape === "round" && styles.round,
        className,
      )}
      {...rest}
    >
      <Icon
        className={cx(styles.icon, mirrorIcon && "mirror-rtl")}
        aria-hidden="true"
      />
    </BaseButton>
  );

  if (!tooltip || disabled) return button;
  return <Tooltip content={label}>{button}</Tooltip>;
}
