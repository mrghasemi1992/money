"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import type { LucideIcon } from "lucide-react";
import NextLink from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label (on the right in RTL). */
  iconStart?: LucideIcon;
  /** Icon after the label (on the left in RTL). */
  iconEnd?: LucideIcon;
  /** Add when an icon means a direction (back, forward), so it mirrors in RTL. */
  mirrorIcons?: boolean;
  /** Shows a spinner, sets aria-busy and blocks clicks while keeping focus. */
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ComponentProps<"button">, keyof ButtonBaseProps> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentProps<"a">, keyof ButtonBaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Labelled action. Labels are verbs that name the outcome («ثبت هزینه», never «تأیید»).
 * One primary per view; danger only for destructive actions. Renders a link when `href` is set.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  iconStart: IconStart,
  iconEnd: IconEnd,
  mirrorIcons = false,
  loading = false,
  fullWidth = false,
  disabled = false,
  className,
  ...rest
}: ButtonProps) {
  const classes = cx(
    styles.root,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className,
  );
  const iconClass = cx(styles.icon, mirrorIcons && "mirror-rtl");

  const content = (
    <>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : IconStart ? (
        <IconStart className={iconClass} aria-hidden="true" />
      ) : null}
      {children != null ? (
        <span className={styles.label}>{children}</span>
      ) : null}
      {IconEnd ? <IconEnd className={iconClass} aria-hidden="true" /> : null}
    </>
  );

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as Omit<
      ComponentProps<"a">,
      "href"
    > & {
      href: string;
    };
    // A disabled link has no href, so it can't be followed.
    if (disabled) {
      return (
        <a
          className={classes}
          aria-disabled="true"
          data-disabled=""
          {...anchorProps}
        >
          {content}
        </a>
      );
    }
    return (
      <NextLink className={classes} href={href} {...anchorProps}>
        {content}
      </NextLink>
    );
  }

  const { type = "button", ...buttonProps } = rest as ComponentProps<"button">;
  return (
    <BaseButton
      className={classes}
      type={type}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...buttonProps}
    >
      {content}
    </BaseButton>
  );
}
