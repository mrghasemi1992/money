"use client";

import {
  BookOpenIcon,
  CheckIcon,
  InfoIcon,
  type LucideIcon,
  PlusIcon,
  ReceiptIcon,
  SparklesIcon,
  TagsIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

import { useAddTransaction } from "@/components/add-transaction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { BookProgress } from "@/types/dashboard";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type FirstRunProps = {
  /** Editors and admins get the setup steps; viewers a short note. */
  canWrite: boolean;
  progress: BookProgress;
  className?: string;
};

type StepKey = "accounts" | "categories" | "transaction" | "claude";

type Step = {
  key: StepKey;
  done: boolean;
  icon: LucideIcon;
  /** A page to go to, or nothing for the add-transaction form. */
  href?: string;
  /** Can't be taken yet (a transaction needs an account). */
  blocked?: boolean;
};

/**
 * The dashboard of a book without accounts or transactions. Editors and admins get four
 * steps (accounts, categories, a first transaction, connecting Claude), each marked done once
 * the book has it; the next open step is the primary button. Viewers can't set anything up,
 * so they get a note that the summary appears once someone records something.
 */
export function FirstRun({ canWrite, progress, className }: FirstRunProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const openAdd = useAddTransaction();
  const titleId = useId();

  if (!canWrite) {
    return (
      <Card className={cx(styles.viewer, className)}>
        <EmptyState
          icon={BookOpenIcon}
          title={t("viewer.title")}
          description={t("viewer.description")}
        />
      </Card>
    );
  }

  const steps: Step[] = [
    {
      key: "accounts",
      done: progress.hasAccounts,
      icon: PlusIcon,
      href: "/settings/accounts",
    },
    {
      key: "categories",
      done: progress.hasCategories,
      icon: TagsIcon,
      href: "/settings/categories",
    },
    {
      key: "transaction",
      done: progress.hasTransactions,
      icon: ReceiptIcon,
      blocked: !progress.hasAccounts,
    },
    {
      key: "claude",
      done: progress.connectedClaude,
      icon: SparklesIcon,
      href: "/settings/connector",
    },
  ];
  const done = steps.filter((step) => step.done).length;
  const next = steps.find((step) => !step.done && !step.blocked)?.key;

  return (
    <section className={cx(styles.root, className)} aria-labelledby={titleId}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <h2 id={titleId} className={styles.title}>
            {t("setup.title")}
          </h2>
          <p className={styles.subtitle}>{t("setup.subtitle")}</p>
        </div>
        <Badge>
          {t("setup.progress", {
            done: formatNumber(done, locale),
            total: formatNumber(steps.length, locale),
          })}
        </Badge>
      </div>
      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const state = step.done ? "done" : step.blocked ? "blocked" : "open";
          const action = t(`setup.steps.${step.key}.action`);
          const variant = step.key === next ? "primary" : "secondary";
          return (
            <li
              key={step.key}
              className={cx(styles.step, styles[state])}
              data-state={state}
            >
              <span className={styles.number} aria-hidden="true">
                {step.done ? (
                  <CheckIcon className={styles.check} />
                ) : (
                  formatNumber(index + 1, locale)
                )}
              </span>
              <div className={styles.text}>
                <span className={styles.stepTitle}>
                  {t(`setup.steps.${step.key}.title`)}
                </span>
                <span className={styles.description}>
                  {t(`setup.steps.${step.key}.description`)}
                </span>
                {step.blocked && !step.done ? (
                  <span className={styles.hint}>
                    <InfoIcon className={styles.hintIcon} aria-hidden="true" />
                    {t("setup.steps.transaction.needsAccount")}
                  </span>
                ) : null}
              </div>
              {step.done ? (
                <Badge tone="success" icon={CheckIcon}>
                  {t("setup.done")}
                </Badge>
              ) : step.href ? (
                <Button
                  href={step.href}
                  variant={variant}
                  size="sm"
                  iconStart={step.icon}
                >
                  {action}
                </Button>
              ) : (
                <Button
                  variant={variant}
                  size="sm"
                  iconStart={step.icon}
                  disabled={step.blocked || !openAdd}
                  onClick={openAdd ?? undefined}
                >
                  {action}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
