import type { HTMLAttributes } from 'react';
import styles from './styles.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover/focus elevation and keyboard focusability for clickable cards (e.g. an account row). */
  interactive?: boolean;
}

export function Card({
  interactive = false,
  className,
  tabIndex,
  ...props
}: CardProps) {
  const classes = [styles.card, interactive && styles.interactive, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={classes}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      {...props}
    />
  );
}
