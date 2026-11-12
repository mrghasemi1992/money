"use client";

import { ChevronRightIcon, TargetIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CategoryChip,
  CategoryChipSkeleton,
} from "@/components/ui/category-chip";
import { ProgressBar, ProgressBarSkeleton } from "@/components/ui/progress-bar";
import { DASHBOARD_BUDGET_COUNT } from "@/constants/dashboard";
import { categoryIcon } from "@/helpers/category";
import type { BudgetCategory } from "@/types/budget";
import type { MoneyUnit } from "@/types/currency";

import styles from "./styles.module.css";

type BudgetProgressProps = {
  /** The budgets to show, most used first (closestBudgets). */
  budgets: (BudgetCategory & { budget: number })[];
  /** Editors and admins get «تعیین بودجه» when there are no budgets. */
  canWrite: boolean;
  /** Overrides the viewer's unit, for stories. */
  unit?: MoneyUnit;
  className?: string;
};

/**
 * The budgets closest to or over their limit this month, each a bar with the share spent,
 * the status in words and spent of the limit (ProgressBar), linking to the budgets page.
 */
export function BudgetProgress({
  budgets,
  canWrite,
  unit,
  className,
}: BudgetProgressProps) {
  const t = useTranslations("dashboard");
  return (
    <Card
      as="section"
      padding="none"
      title={t("budgets.title")}
      subtitle={budgets.length > 0 ? t("budgets.subtitle") : undefined}
      actions={
        <Button
          href="/budgets"
          variant="ghost"
          size="sm"
          iconEnd={ChevronRightIcon}
          mirrorIcons
          aria-label={t("budgets.all")}
        >
          {t("all")}
        </Button>
      }
      className={className}
    >
      {budgets.length > 0 ? (
        <ul className={styles.list}>
          {budgets.map((category) => (
            <li key={category.id}>
              <ProgressBar
                value={category.spent}
                max={category.budget}
                size="sm"
                showValues
                unit={unit}
                aria-label={category.name}
                label={
                  <CategoryChip
                    size="sm"
                    name={category.name}
                    color={category.color}
                    icon={categoryIcon(category.icon)}
                  />
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <TargetIcon className={styles.emptyIcon} aria-hidden="true" />
          <p className={styles.emptyText}>{t("budgets.empty")}</p>
          {canWrite ? (
            <Button href="/budgets" variant="secondary" size="sm">
              {t("budgets.set")}
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}

/** Widths of the category names, so the rows don't look identical. */
const SKELETON_NAMES = ["72px", "96px", "64px", "84px"];

/**
 * The budgets card while it loads: the real card and one placeholder bar per budget it shows
 * (DASHBOARD_BUDGET_COUNT), each as tall as a real one.
 */
export function BudgetProgressSkeleton() {
  const t = useTranslations("dashboard");
  return (
    <Card
      padding="none"
      title={t("budgets.title")}
      subtitle={t("budgets.subtitle")}
      actions={
        <Button
          variant="ghost"
          size="sm"
          iconEnd={ChevronRightIcon}
          mirrorIcons
        >
          {t("all")}
        </Button>
      }
      inert
    >
      <div className={styles.list}>
        {SKELETON_NAMES.slice(0, DASHBOARD_BUDGET_COUNT).map((width) => (
          <ProgressBarSkeleton
            key={width}
            size="sm"
            showValues
            label={<CategoryChipSkeleton size="sm" width={width} />}
          />
        ))}
      </div>
    </Card>
  );
}
