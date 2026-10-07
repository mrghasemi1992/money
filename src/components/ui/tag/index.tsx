"use client";

import { Toggle } from "@base-ui/react/toggle";
import { XIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { categoryColorStyle } from "@/helpers/category";
import type { CategoryColor } from "@/types/category";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TagProps = {
  children: ReactNode;
  /** Category hue for a dot before the text. */
  color?: CategoryColor;
  icon?: LucideIcon;
  /** With onSelectedChange the tag is a toggle button (filters). */
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Makes the tag a button that does one thing, such as adding a suggested category. */
  onClick?: () => void;
  /** Tooltip text, such as what a click adds. */
  title?: string;
  /** Shows an × button that removes the tag. */
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Filter or keyword chip. Toggles with onSelectedChange; acts as a button with onClick (a
 * suggestion to add); shows × with onRemove.
 */
export function Tag({
  children,
  color,
  icon: Icon,
  selected,
  defaultSelected,
  onSelectedChange,
  onClick,
  title,
  onRemove,
  removeLabel: removeLabelProp,
  disabled = false,
  className,
}: TagProps) {
  const t = useTranslations("common");
  const removeLabel = removeLabelProp ?? t("remove");
  const toggles =
    onSelectedChange !== undefined ||
    selected !== undefined ||
    defaultSelected !== undefined;
  const label = (
    <>
      {color ? (
        <span className={styles.dot} style={categoryColorStyle(color)} />
      ) : null}
      {Icon ? <Icon className={styles.icon} aria-hidden="true" /> : null}
      <span className={styles.label}>{children}</span>
    </>
  );

  return (
    <span
      className={cx(styles.root, className)}
      data-disabled={disabled || undefined}
      title={title}
    >
      {toggles ? (
        <Toggle
          className={styles.toggle}
          pressed={selected}
          defaultPressed={defaultSelected}
          onPressedChange={(pressed) => onSelectedChange?.(pressed)}
          disabled={disabled}
        >
          {label}
        </Toggle>
      ) : onClick ? (
        <button
          type="button"
          className={styles.toggle}
          disabled={disabled}
          onClick={onClick}
        >
          {label}
        </button>
      ) : (
        <span className={styles.static}>{label}</span>
      )}
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={
            typeof children === "string"
              ? `${removeLabel} ${children}`
              : removeLabel
          }
          disabled={disabled}
          onClick={onRemove}
        >
          <XIcon className={styles.removeIcon} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}
