import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { hexToBadgeHue } from './hue';
import styles from './styles.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Hex color for this category. Only its hue is used — background/text
   * lightness and saturation are fixed per theme (see styles.module.css),
   * so every badge reads as part of one system regardless of the shade
   * a user picks when creating a category. */
  color: string;
  children: ReactNode;
}

export function Badge({
  color,
  className,
  style,
  children,
  ...props
}: BadgeProps) {
  const classes = [styles.badge, className].filter(Boolean).join(' ');
  const badgeStyle = {
    ...style,
    '--badge-hue': hexToBadgeHue(color),
  } as CSSProperties;

  return (
    <span className={classes} style={badgeStyle} {...props}>
      {children}
    </span>
  );
}
