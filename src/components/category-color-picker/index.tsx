"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { CATEGORY_COLORS } from "@/constants/category";
import { categoryColorStyle } from "@/helpers/category";
import type { CategoryColor } from "@/types/category";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type CategoryColorPickerProps = {
  value: CategoryColor;
  onValueChange: (color: CategoryColor) => void;
  disabled?: boolean;
  /** The id of the visible label («رنگ»). */
  "aria-labelledby"?: string;
  /** A name for the group when there is no visible label. */
  "aria-label"?: string;
  className?: string;
};

/**
 * The category palette as a row of swatches (a radio group: arrow keys move, each swatch is
 * named by its color). The chosen one carries a check mark, so the choice never depends on
 * color alone.
 */
export function CategoryColorPicker({
  value,
  onValueChange,
  disabled,
  className,
  ...rest
}: CategoryColorPickerProps) {
  const t = useTranslations("categoryColor");
  return (
    <RadioGroup<CategoryColor>
      className={cx(styles.root, className)}
      value={value}
      onValueChange={(next) => onValueChange(next)}
      disabled={disabled}
      {...rest}
    >
      {CATEGORY_COLORS.map((color) => (
        <Radio.Root
          key={color}
          value={color}
          className={styles.swatch}
          aria-label={t(color)}
          title={t(color)}
          style={categoryColorStyle(color)}
        >
          <span className={styles.color}>
            <Radio.Indicator className={styles.indicator}>
              <CheckIcon className={styles.check} aria-hidden="true" />
            </Radio.Indicator>
          </span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
