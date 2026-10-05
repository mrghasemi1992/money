"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import type { LucideIcon } from "lucide-react";
import NextLink from "next/link";
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
  /** Logical side of the tooltip: inline-end is on the left in RTL. */
  tooltipSide?: ComponentProps<typeof Tooltip>["side"];
  /** Renders a link to this path instead of a button. */
  href?: string;
};

/** Icon-only action. Grows to the 44px tap target on phones. Renders a link when `href` is set. */
export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  shape = "square",
  mirrorIcon = false,
  tooltip = true,
  tooltipSide,
  href,
  disabled = false,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const classes = cx(
    styles.root,
    styles[variant],
    styles[size],
    shape === "round" && styles.round,
    className,
  );
  const icon = (
    <Icon
      className={cx(styles.icon, mirrorIcon && "mirror-rtl")}
      aria-hidden="true"
    />
  );

  const button =
    href !== undefined && !disabled ? (
      <NextLink
        href={href}
        aria-label={label}
        className={classes}
        {...(rest as Omit<ComponentProps<"a">, "href">)}
      >
        {icon}
      </NextLink>
    ) : (
      <BaseButton
        type={type}
        aria-label={label}
        disabled={disabled}
        className={classes}
        {...rest}
      >
        {icon}
      </BaseButton>
    );

  if (!tooltip || disabled) return button;
  return (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
