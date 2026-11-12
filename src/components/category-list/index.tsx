"use client";

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_ICONS } from "@/constants/category-icons";
import {
  categoryColorStyle,
  categoryIcon,
  knownCategoryIcon,
} from "@/helpers/category";
import list from "@/styles/list.module.css";
import type { Category, Subcategory } from "@/types/category";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

/** Transactions in a category and all its subcategories (archived ones too). */
export function categoryUsage(category: Category): number {
  return category.subcategories.reduce(
    (sum, subcategory) => sum + subcategory.transactionCount,
    category.transactionCount,
  );
}

function useCounts() {
  const t = useTranslations();
  const locale = useLocale();
  return {
    transactions: (count: number) =>
      t("common.transactionCount", {
        countNumber: count,
        count: formatNumber(count, locale),
      }),
    subcategories: (count: number) =>
      t("categories.subcategoryCount", {
        countNumber: count,
        count: formatNumber(count, locale),
      }),
  };
}

type CategoryListProps = {
  /** Active top-level categories of one type, oldest first. */
  categories: Category[];
  /** Editors and admins get the menus and the add-subcategory buttons. */
  canWrite: boolean;
  /** Labels the list: «دسته‌های هزینه». */
  "aria-label": string;
  onEdit: (category: Category) => void;
  onAddSubcategory: (category: Category) => void;
  onArchive: (category: Category) => void;
  /** Asks first: delete, or archive when it is in use. */
  onDelete: (category: Category) => void;
  onRenameSubcategory: (parent: Category, subcategory: Subcategory) => void;
  onArchiveSubcategory: (parent: Category, subcategory: Subcategory) => void;
  onDeleteSubcategory: (parent: Category, subcategory: Subcategory) => void;
  /** A change is being saved: the row menus are disabled until it finishes. */
  busy?: boolean;
};

/**
 * Categories of one type, each with its icon on its color, how many subcategories and
 * transactions it has, and its active subcategories underneath with their icons in the
 * parent's color. Editors and admins get
 * a menu on each row and, from 768px up, a quick «+ زیردسته» button.
 */
export function CategoryList({
  categories,
  canWrite,
  "aria-label": ariaLabel,
  onEdit,
  onAddSubcategory,
  onArchive,
  onDelete,
  onRenameSubcategory,
  onArchiveSubcategory,
  onDeleteSubcategory,
  busy = false,
}: CategoryListProps) {
  const t = useTranslations();
  const counts = useCounts();

  function rowMenu(name: string, items: MenuItem[]) {
    return (
      <Menu
        align="end"
        items={items}
        trigger={
          <IconButton
            icon={EllipsisVerticalIcon}
            label={t("categories.menu", { name })}
            size="sm"
            disabled={busy}
          />
        }
      />
    );
  }

  return (
    <ul className={list.list} aria-label={ariaLabel}>
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[knownCategoryIcon(category.icon)];
        const subcategories = category.subcategories.filter(
          (subcategory) => !subcategory.archived,
        );
        const meta = [
          subcategories.length > 0
            ? counts.subcategories(subcategories.length)
            : null,
          counts.transactions(categoryUsage(category)),
        ]
          .filter(Boolean)
          .join(t("common.listSeparator"));
        return (
          <li
            key={category.id}
            className={cx(list.item, styles.item)}
            style={categoryColorStyle(category.color)}
          >
            <div className={list.row}>
              <span className={styles.tile} aria-hidden="true">
                <Icon className={styles.icon} />
              </span>
              <div className={list.text}>
                <span className={list.name}>{category.name}</span>
                <span className={list.meta}>{meta}</span>
              </div>
              {canWrite ? (
                <div className={list.end}>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconStart={PlusIcon}
                    className={styles.addSub}
                    aria-label={t("categories.addSubcategoryLabel", {
                      name: category.name,
                    })}
                    onClick={() => onAddSubcategory(category)}
                  >
                    {t("categories.addSubcategory")}
                  </Button>
                  {rowMenu(category.name, [
                    {
                      label: t("categories.actions.edit"),
                      icon: PencilIcon,
                      onClick: () => onEdit(category),
                    },
                    {
                      label: t("categories.actions.addSubcategory"),
                      icon: PlusIcon,
                      onClick: () => onAddSubcategory(category),
                    },
                    { separator: true },
                    {
                      label: t("categories.actions.archive"),
                      icon: ArchiveIcon,
                      onClick: () => onArchive(category),
                    },
                    {
                      label: t("categories.actions.delete"),
                      icon: Trash2Icon,
                      danger: true,
                      onClick: () => onDelete(category),
                    },
                  ])}
                </div>
              ) : null}
            </div>
            {subcategories.length > 0 ? (
              <ul className={styles.subcategories}>
                {subcategories.map((subcategory) => {
                  const SubIcon =
                    CATEGORY_ICONS[knownCategoryIcon(subcategory.icon)];
                  return (
                    <li key={subcategory.id} className={styles.subcategory}>
                      <SubIcon className={styles.subIcon} aria-hidden="true" />
                      <span className={styles.subName}>{subcategory.name}</span>
                      <span className={styles.subMeta}>
                        {counts.transactions(subcategory.transactionCount)}
                      </span>
                      {canWrite
                        ? rowMenu(subcategory.name, [
                            {
                              label: t("categories.actions.rename"),
                              icon: PencilIcon,
                              onClick: () =>
                                onRenameSubcategory(category, subcategory),
                            },
                            { separator: true },
                            {
                              label: t("categories.actions.archive"),
                              icon: ArchiveIcon,
                              onClick: () =>
                                onArchiveSubcategory(category, subcategory),
                            },
                            {
                              label: t("categories.actions.delete"),
                              icon: Trash2Icon,
                              danger: true,
                              onClick: () =>
                                onDeleteSubcategory(category, subcategory),
                            },
                          ])
                        : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** A placeholder category's name and line widths, and its subcategories' name widths. */
const SKELETON_CATEGORIES: [string, string, string[]][] = [
  ["96px", "144px", ["72px", "88px"]],
  ["120px", "160px", ["96px", "64px"]],
  ["80px", "128px", ["80px"]],
  ["108px", "96px", []],
  ["88px", "104px", []],
];

/**
 * The categories while they load, laid out like CategoryList: each category's placeholder
 * tile, name and line (with the add-subcategory button and menu for writers) and a few
 * subcategory rows, in the real sizes and fonts.
 */
export function CategoryListSkeleton({
  canWrite = true,
}: {
  canWrite?: boolean;
}) {
  const t = useTranslations("categories");
  const menu = canWrite ? (
    <IconButton
      icon={EllipsisVerticalIcon}
      label={t("menu", { name: "" })}
      size="sm"
      disabled
    />
  ) : null;
  return (
    <div className={list.list} aria-hidden="true">
      {SKELETON_CATEGORIES.map(([name, meta, subcategories]) => (
        <div key={name + meta} className={cx(list.item, styles.item)}>
          <div className={list.row}>
            <Skeleton
              width="var(--cat-icon)"
              height="var(--cat-icon)"
              radius="var(--category-icon-radius)"
              className={styles.skeletonTile}
            />
            <div className={list.text}>
              <span className={list.name}>
                <Skeleton variant="text" width={name} />
              </span>
              <span className={list.meta}>
                <Skeleton variant="text" width={meta} />
              </span>
            </div>
            {canWrite ? (
              <div className={list.end}>
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={PlusIcon}
                  className={styles.addSub}
                  disabled
                >
                  {t("addSubcategory")}
                </Button>
                {menu}
              </div>
            ) : null}
          </div>
          {subcategories.length > 0 ? (
            <div className={styles.subcategories}>
              {subcategories.map((width) => (
                <div key={width} className={styles.subcategory}>
                  <Skeleton
                    variant="circle"
                    width="var(--icon-size-sm)"
                    className={styles.skeletonTile}
                  />
                  <span className={styles.subName}>
                    <Skeleton variant="text" width={width} />
                  </span>
                  <span className={styles.subMeta}>
                    <Skeleton variant="text" width="64px" />
                  </span>
                  {menu}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** An archived category, or an archived subcategory of an active one. */
export type ArchivedCategory =
  | { category: Category; subcategory?: undefined }
  | { category: Category; subcategory: Subcategory };

type ArchivedCategoryListProps = {
  items: ArchivedCategory[];
  canWrite: boolean;
  onRestore: (item: ArchivedCategory) => void;
  onDelete: (item: ArchivedCategory) => void;
  /** A change is being saved: the row menus are disabled until it finishes. */
  busy?: boolean;
};

/**
 * Archived categories and subcategories (shown as «خوراک / رستوران»), with how many
 * transactions use them and a menu to restore or delete them.
 */
export function ArchivedCategoryList({
  items,
  canWrite,
  onRestore,
  onDelete,
  busy = false,
}: ArchivedCategoryListProps) {
  const t = useTranslations();
  const counts = useCounts();
  return (
    <ul className={list.list}>
      {items.map((item) => {
        const { category, subcategory } = item;
        const name = subcategory?.name ?? category.name;
        const usage = subcategory
          ? subcategory.transactionCount
          : categoryUsage(category);
        return (
          <li
            key={subcategory?.id ?? category.id}
            className={cx(list.item, list.muted)}
          >
            <div className={list.row}>
              <div className={cx(list.text, styles.archivedText)}>
                <CategoryChip
                  name={category.name}
                  sub={subcategory?.name}
                  color={category.color}
                  icon={categoryIcon(subcategory?.icon ?? category.icon)}
                />
                <span className={list.meta}>{counts.transactions(usage)}</span>
              </div>
              {canWrite ? (
                <Menu
                  align="end"
                  items={[
                    {
                      label: t("categories.actions.restore"),
                      icon: ArchiveRestoreIcon,
                      onClick: () => onRestore(item),
                    },
                    {
                      label: t("categories.actions.delete"),
                      icon: Trash2Icon,
                      danger: true,
                      onClick: () => onDelete(item),
                    },
                  ]}
                  trigger={
                    <IconButton
                      icon={EllipsisVerticalIcon}
                      label={t("categories.menu", { name })}
                      size="sm"
                      disabled={busy}
                    />
                  }
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
