import NextLink from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type CardOwnProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Small actions at the end of the header (IconButton, ghost Button). */
  actions?: ReactNode;
  footer?: ReactNode;
  /** brand = royal fill with white text; at most one per screen (the balance). */
  variant?: "default" | "sunken" | "brand";
  padding?: "none" | "sm" | "md" | "lg";
  /** Element to render; use section or article when the card is a landmark of the page. */
  as?: "div" | "section" | "article";
  children?: ReactNode;
  className?: string;
};

type CardProps = CardOwnProps &
  Omit<ComponentProps<"div">, keyof CardOwnProps> & {
    /** Makes the whole card a link that lifts on hover and settles on press. */
    href?: string;
  };

/**
 * Surface for a group of content: card fill, subtle border, 12px radius, faint shadow.
 * With `href` the whole card is a link that lifts on hover and settles on press.
 */
export function Card({
  title,
  subtitle,
  actions,
  footer,
  variant = "default",
  padding = "md",
  as: Tag = "div",
  children,
  className,
  href,
  ...rest
}: CardProps) {
  const classes = cx(
    styles.root,
    variant !== "default" && styles[variant],
    styles[`pad-${padding}`],
    href !== undefined && styles.interactive,
    className,
  );
  const content = (
    <>
      {title != null || actions != null ? (
        <div className={styles.head}>
          <div className={styles.titles}>
            {title != null ? <div className={styles.title}>{title}</div> : null}
            {subtitle != null ? (
              <div className={styles.subtitle}>{subtitle}</div>
            ) : null}
          </div>
          {actions != null ? (
            <div className={styles.actions}>{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children != null ? <div className={styles.body}>{children}</div> : null}
      {footer != null ? <div className={styles.foot}>{footer}</div> : null}
    </>
  );

  if (href !== undefined) {
    return (
      <NextLink
        href={href}
        className={classes}
        {...(rest as ComponentProps<"a">)}
      >
        {content}
      </NextLink>
    );
  }

  return (
    <Tag className={classes} {...rest}>
      {content}
    </Tag>
  );
}
