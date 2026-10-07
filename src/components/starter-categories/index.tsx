"use client";

import { ListPlusIcon, PlusIcon, TagsIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tag } from "@/components/ui/tag";
import type { CategoryType, StarterCategory } from "@/types/category";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type StarterCategoriesProps = {
  type: CategoryType;
  /** Suggestions the type doesn't have yet. */
  starters: StarterCategory[];
  /** Editors and admins get the suggestions and buttons; viewers only the empty state. */
  canWrite: boolean;
  /** Disables the buttons while suggestions are being added. */
  pending?: boolean;
  /** Adds the suggestions with these keys, or all of them. */
  onAdd: (keys?: string[]) => void;
  /** Opens the new-category form. */
  onCreate: () => void;
};

/**
 * A category type with no categories: what to do next. Editors and admins can add suggested
 * categories (with their subcategories) one tap at a time or all at once, or make their own.
 */
export function StarterCategories({
  type,
  starters,
  canWrite,
  pending = false,
  onAdd,
  onCreate,
}: StarterCategoriesProps) {
  const t = useTranslations("categories");
  const locale = useLocale();
  const offer = canWrite && starters.length > 0;
  return (
    <Card padding="md">
      <EmptyState
        icon={TagsIcon}
        title={canWrite ? t("empty.title", { type }) : t("empty.viewerTitle")}
        description={
          !canWrite
            ? t("empty.viewerDescription")
            : offer
              ? t("empty.description")
              : t("empty.noStartersDescription")
        }
        action={
          canWrite && !offer ? (
            <Button iconStart={PlusIcon} onClick={onCreate}>
              {t("add")}
            </Button>
          ) : null
        }
        className={styles.empty}
      />
      {offer ? (
        <div className={styles.starters}>
          <span className={styles.title}>{t("starters.title")}</span>
          <div className={styles.tags}>
            {starters.map((starter) => (
              <Tag
                key={starter.key}
                color={starter.color}
                icon={PlusIcon}
                disabled={pending}
                title={t("starters.includes", {
                  countNumber: starter.subcategories.length,
                  count: formatNumber(starter.subcategories.length, locale),
                })}
                onClick={() => onAdd([starter.key])}
              >
                {starter.name[locale]}
              </Tag>
            ))}
          </div>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              iconStart={ListPlusIcon}
              loading={pending}
              onClick={() => onAdd()}
            >
              {t("starters.addAll")}
            </Button>
            <Button iconStart={PlusIcon} onClick={onCreate}>
              {t("starters.addOwn")}
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
