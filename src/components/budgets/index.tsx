"use client";

import { EyeIcon, PlusIcon, TargetIcon, Trash2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { useShellCanWrite } from "@/components/add-transaction";
import { useReportNavigation } from "@/components/navigation-progress";
import { BudgetDialog } from "@/components/budget-dialog";
import {
  BudgetList,
  BudgetListSkeleton,
  UnbudgetedList,
  UnbudgetedListSkeleton,
} from "@/components/budget-list";
import {
  BudgetSummary,
  BudgetSummarySkeleton,
} from "@/components/budget-summary";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  MonthSwitcher,
  MonthSwitcherSkeleton,
} from "@/components/month-switcher";
import { PageHeader } from "@/components/page-header";
import { PageLoadingStatus } from "@/components/page-skeleton";
import { ListError } from "@/components/page-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import type { BudgetField } from "@/helpers/budget";
import { formatMoney } from "@/helpers/money";
import {
  formatMonthParam,
  TRANSACTION_PARAMS,
} from "@/helpers/transaction-filters";
import { usePreferences } from "@/hooks/use-preferences";
import type { ActionResult } from "@/types/action";
import type { BudgetCategory, BudgetInput, BudgetMonth } from "@/types/budget";
import { formatMonth, shiftMonth, toCalendarDate } from "@/utils/calendar";
import { todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type BudgetsProps = {
  /** Every top-level expense category with its budget and its spending in the month. */
  categories: BudgetCategory[];
  /** The month shown, in the viewer's calendar. */
  month: BudgetMonth;
  /** Editors and admins; viewers see the page without write controls. */
  canWrite: boolean;
  onSave: (
    input: BudgetInput,
  ) => Promise<ActionResult<BudgetField, { created: boolean }>>;
  onDelete: (input: {
    categoryId: string;
  }) => Promise<ActionResult<never, { deleted: BudgetInput }>>;
};

/**
 * The /budgets page: a month of the viewer's calendar (in the URL), what the budgeted
 * categories spent against their limits, one row per budget (most used first, each opening
 * its transactions for the month), and the expense categories without a budget. Editors and
 * admins set, change and remove budgets; adding and removing offer «واگرد». Every change goes
 * through a Server Action passed in as a prop, which checks the role again.
 */
export function Budgets({
  categories,
  month,
  canWrite,
  onSave,
  onDelete,
}: BudgetsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar, moneyUnit, timeZone } = usePreferences();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [navigating, startNavigation] = useTransition();
  useReportNavigation(navigating);
  const [removing, startRemoving] = useTransition();

  // Kept after a dialog closes, so its text stays while it animates out.
  const [target, setTarget] = useState<BudgetCategory | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const budgeted = categories.filter((category) => category.budget !== null);
  const unbudgeted = categories.filter(
    (category) => category.budget === null && !category.archived,
  );
  const spent = budgeted.reduce((sum, category) => sum + category.spent, 0);
  const total = budgeted.reduce(
    (sum, category) => sum + (category.budget ?? 0),
    0,
  );
  const monthLabel = formatMonth(calendar, locale, month.year, month.month);

  function goToMonth(next: { year: number; month: number } | null) {
    const current = toCalendarDate(todayIso(timeZone), calendar);
    const isCurrent =
      !next || (next.year === current.year && next.month === current.month);
    const query = isCurrent
      ? ""
      : `?${TRANSACTION_PARAMS.month}=${formatMonthParam(next.year, next.month)}`;
    startNavigation(() => {
      router.push(`${pathname}${query}`, { scroll: false });
    });
  }

  function openForm(category: BudgetCategory | null) {
    setTarget(category);
    setFormOpen(true);
  }

  function nameOf(categoryId: string): string {
    return categories.find((item) => item.id === categoryId)?.name ?? "";
  }

  /** Saves a budget again from a toast's «واگرد». */
  function restore(input: BudgetInput) {
    startRemoving(async () => {
      let result: ActionResult<BudgetField, { created: boolean }>;
      try {
        result = await onSave(input);
      } catch {
        result = { ok: false, error: t("budgets.failed") };
      }
      toast.show(
        result.ok
          ? {
              title: t("budgets.toasts.restored", {
                name: nameOf(input.categoryId),
              }),
              tone: "success",
            }
          : { title: result.error, tone: "danger" },
      );
    });
  }

  /** Removes a budget; returns whether it worked. */
  async function removeBudget(categoryId: string): Promise<boolean> {
    let result: ActionResult<never, { deleted: BudgetInput }>;
    try {
      result = await onDelete({ categoryId });
    } catch {
      result = { ok: false, error: t("budgets.failed") };
    }
    if (!result.ok) {
      toast.show({ title: result.error, tone: "danger" });
      return false;
    }
    const { deleted } = result;
    const id = toast.show({
      title: t("budgets.toasts.removed", { name: nameOf(categoryId) }),
      tone: "success",
      action: {
        label: t("common.undo"),
        onClick: () => {
          toast.close(id);
          restore(deleted);
        },
      },
    });
    return true;
  }

  function remove(category: BudgetCategory) {
    startRemoving(async () => {
      if (await removeBudget(category.id)) {
        setConfirmOpen(false);
        setFormOpen(false);
      }
    });
  }

  function saved(input: BudgetInput, created: boolean) {
    const name = nameOf(input.categoryId);
    if (!created) {
      toast.show({
        title: t("budgets.toasts.saved", { name }),
        tone: "success",
      });
      return;
    }
    const id = toast.show({
      title: t("budgets.toasts.added", { name }),
      tone: "success",
      action: {
        label: t("common.undo"),
        onClick: () => {
          toast.close(id);
          startRemoving(async () => {
            await removeBudget(input.categoryId);
          });
        },
      },
    });
  }

  const subtitle =
    month.phase === "current"
      ? t("budgets.period.current", {
          passedNumber: month.day,
          passed: formatNumber(month.day, locale),
          left: formatNumber(month.days - month.day, locale),
        })
      : t(
          month.phase === "past"
            ? "budgets.period.past"
            : "budgets.period.future",
        );

  const addButton = (
    <Button iconStart={PlusIcon} onClick={() => openForm(null)}>
      {t("budgets.add")}
    </Button>
  );

  function emptyAction() {
    if (!canWrite) return null;
    if (unbudgeted.length > 0) return addButton;
    return (
      <Button variant="secondary" iconStart={PlusIcon} href="/categories">
        {t("budgets.empty.addCategories")}
      </Button>
    );
  }

  return (
    <div className={styles.root}>
      <PageHeader
        title={t("nav.budgets")}
        subtitle={subtitle}
        actions={
          <>
            {canWrite ? null : (
              <Badge icon={EyeIcon}>{t("common.viewOnly")}</Badge>
            )}
            <MonthSwitcher
              key={formatMonthParam(month.year, month.month)}
              year={month.year}
              month={month.month}
              onPrevious={() =>
                goToMonth(shiftMonth(month.year, month.month, -1))
              }
              onNext={() => goToMonth(shiftMonth(month.year, month.month, 1))}
            />
            {month.phase === "current" ? null : (
              <Button variant="ghost" onClick={() => goToMonth(null)}>
                {t("budgets.thisMonth")}
              </Button>
            )}
            {canWrite && budgeted.length > 0 && unbudgeted.length > 0
              ? addButton
              : null}
          </>
        }
      />

      {navigating ? (
        <BudgetsContentSkeleton />
      ) : budgeted.length > 0 ? (
        <>
          <BudgetSummary spent={spent} budget={total} month={month} />
          <Card padding="none" className={styles.list}>
            <BudgetList
              categories={budgeted}
              year={month.year}
              month={month.month}
              canWrite={canWrite}
              onEdit={openForm}
            />
          </Card>
        </>
      ) : (
        <Card padding="lg">
          <EmptyState
            icon={TargetIcon}
            title={t(
              canWrite ? "budgets.empty.title" : "budgets.empty.viewerTitle",
            )}
            description={t(
              !canWrite
                ? "budgets.empty.viewerDescription"
                : unbudgeted.length > 0
                  ? "budgets.empty.description"
                  : "budgets.empty.noCategories",
            )}
            action={emptyAction()}
            className={styles.empty}
          />
        </Card>
      )}

      {!navigating && unbudgeted.length > 0 ? (
        <Card
          as="section"
          padding="none"
          title={t("budgets.unbudgeted.title")}
          subtitle={t("budgets.unbudgeted.subtitle", { month: monthLabel })}
          className={styles.list}
        >
          <UnbudgetedList
            categories={unbudgeted}
            canWrite={canWrite}
            onAdd={openForm}
          />
        </Card>
      ) : null}

      {canWrite ? (
        <>
          <BudgetDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            category={target}
            options={unbudgeted}
            onSubmit={onSave}
            onSaved={saved}
            onRemove={() => setConfirmOpen(true)}
          />
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={t("budgets.remove.title", { name: target?.name ?? "" })}
            description={t("budgets.remove.description", {
              amount: formatMoney(target?.budget ?? 0, moneyUnit, locale),
            })}
            icon={Trash2Icon}
            confirmLabel={t("budgets.remove.submit")}
            pending={removing}
            onConfirm={() => target && remove(target)}
          />
        </>
      ) : null}
    </div>
  );
}

/** The summary, rows and categories without a budget while a month loads. */
function BudgetsContentSkeleton() {
  const t = useTranslations("budgets");
  const canWrite = useShellCanWrite();
  return (
    <>
      <PageLoadingStatus />
      <BudgetSummarySkeleton />
      <Card padding="none" className={styles.list}>
        <BudgetListSkeleton canWrite={canWrite} />
      </Card>
      <Card
        padding="none"
        title={t("unbudgeted.title")}
        subtitle={<Skeleton variant="text" width="160px" />}
        className={styles.list}
        aria-hidden="true"
      >
        <UnbudgetedListSkeleton canWrite={canWrite} />
      </Card>
    </>
  );
}

/**
 * The budgets page while it loads (loading.tsx): the header with its month switcher (and the add
 * button for writers, the view-only badge for viewers), the summary and the lists.
 */
export function BudgetsSkeleton() {
  const t = useTranslations();
  const canWrite = useShellCanWrite();
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("nav.budgets")}
        subtitle={<Skeleton variant="text" width="220px" />}
        actions={
          <>
            {canWrite ? null : (
              <Badge icon={EyeIcon}>{t("common.viewOnly")}</Badge>
            )}
            <MonthSwitcherSkeleton />
            {canWrite ? (
              <Button iconStart={PlusIcon} disabled>
                {t("budgets.add")}
              </Button>
            ) : null}
          </>
        }
      />
      <BudgetsContentSkeleton />
    </div>
  );
}

/** The budgets didn't load (error.tsx): the page's header and a retry. */
export function BudgetsError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader title={t("nav.budgets")} />
      <ListError title={t("budgets.error")} onRetry={onRetry} />
    </div>
  );
}
