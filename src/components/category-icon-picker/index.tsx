"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { SearchField } from "@/components/ui/search-field";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_ICONS } from "@/constants/category-icons";
import { categoryColorStyle } from "@/helpers/category";
import type {
  CategoryColor,
  CategoryIcon,
  CategoryIconGroup,
  CategoryIconWords,
} from "@/types/category";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

/** The picker's lazily loaded part: the icons' themes and words, the search and the guess. */
export type IconCatalog = {
  groups: readonly CategoryIconGroup[];
  words: Record<CategoryIcon, CategoryIconWords>;
  matches: (icon: CategoryIcon, search: string) => boolean;
  /** An icon for a category's name, or null (`guessCategoryIcon`). */
  guess: (name: string) => CategoryIcon | null;
};

let catalog: Promise<IconCatalog> | null = null;

/** Loads the icons' words once, the first time a picker or the category form needs them. */
export function loadIconCatalog(): Promise<IconCatalog> {
  catalog ??= Promise.all([
    import("@/constants/category-icon-words"),
    import("@/helpers/category-icon"),
  ]).then(([words, helpers]) => ({
    groups: words.CATEGORY_ICON_GROUPS,
    words: words.CATEGORY_ICON_WORDS,
    matches: helpers.iconMatches,
    guess: helpers.guessCategoryIcon,
  }));
  return catalog;
}

type CategoryIconPickerProps = {
  value: CategoryIcon;
  onValueChange: (icon: CategoryIcon) => void;
  /** The category's hue, which marks the chosen icon. */
  color: CategoryColor;
  disabled?: boolean;
  /** The id of the visible label («آیکون»). */
  "aria-labelledby"?: string;
  /** A name for the group when there is no visible label. */
  "aria-label"?: string;
  className?: string;
};

/**
 * The category icons as a searchable grid grouped by theme (a radio group: arrow keys move,
 * each icon is named in the viewer's language). The chosen one sits on the category's hue.
 * Its words load when it first opens; until then it shows a placeholder of the same size.
 */
export function CategoryIconPicker({
  value,
  onValueChange,
  color,
  disabled,
  className,
  "aria-labelledby": labelledBy,
  "aria-label": ariaLabel,
}: CategoryIconPickerProps) {
  const t = useTranslations("categoryIcons");
  const locale = useLocale();
  const [icons, setIcons] = useState<IconCatalog | null>(null);
  const [search, setSearch] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void loadIconCatalog().then((loaded) => {
      if (active) setIcons(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  // The chosen icon stays in view, also when the name picks it: only the grid scrolls, never
  // the dialog around it.
  useEffect(() => {
    const grid = gridRef.current;
    const cell = grid?.querySelector<HTMLElement>("[data-checked]");
    if (!grid || !cell) return;
    const top = cell.offsetTop;
    const bottom = top + cell.offsetHeight;
    if (top < grid.scrollTop || bottom > grid.scrollTop + grid.clientHeight) {
      grid.scrollTop = top - (grid.clientHeight - cell.offsetHeight) / 2;
    }
  }, [icons, value]);

  const groups = icons
    ? icons.groups
        .map((group) => ({
          group,
          items: (Object.keys(icons.words) as CategoryIcon[]).filter(
            (icon) =>
              icons.words[icon].group === group && icons.matches(icon, search),
          ),
        }))
        .filter(({ items }) => items.length > 0)
    : [];

  return (
    <div
      className={cx(styles.root, className)}
      style={categoryColorStyle(color)}
    >
      <SearchField
        size="sm"
        aria-label={t("search")}
        placeholder={t("search")}
        value={search}
        onValueChange={setSearch}
        disabled={disabled || !icons}
      />
      <div ref={gridRef} className={styles.scroller}>
        {!icons ? (
          <div role="status" aria-busy="true" className={styles.loading}>
            <span className="visually-hidden">{t("loading")}</span>
            <Skeleton width="100%" height="100%" />
          </div>
        ) : groups.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <RadioGroup<CategoryIcon>
            className={styles.groups}
            value={value}
            onValueChange={(next) => onValueChange(next)}
            disabled={disabled}
            aria-labelledby={labelledBy}
            aria-label={ariaLabel}
          >
            {groups.map(({ group, items }) => (
              <div
                key={group}
                role="group"
                aria-label={t(`groups.${group}`)}
                className={styles.group}
              >
                <span className={styles.groupLabel} aria-hidden="true">
                  {t(`groups.${group}`)}
                </span>
                <div className={styles.grid}>
                  {items.map((icon) => {
                    const Icon = CATEGORY_ICONS[icon];
                    const label = icons.words[icon][locale][0];
                    return (
                      <Radio.Root
                        key={icon}
                        value={icon}
                        className={styles.cell}
                        aria-label={label}
                        title={label}
                      >
                        <Icon className={styles.icon} aria-hidden="true" />
                      </Radio.Root>
                    );
                  })}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    </div>
  );
}
