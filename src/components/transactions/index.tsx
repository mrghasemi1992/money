"use client";

import {
  CalendarRangeIcon,
  CalendarXIcon,
  EyeIcon,
  ReceiptIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";

import {
  AddTransactionButton,
  useAddTransaction,
} from "@/components/add-transaction";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MonthSwitcher } from "@/components/month-switcher";
import { PageHeader } from "@/components/page-header";
import { ListError } from "@/components/page-status";
import { TransactionDetail } from "@/components/transaction-detail";
import { TransactionDialog } from "@/components/transaction-dialog";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionList } from "@/components/transaction-list";
import { TransactionSummary } from "@/components/transaction-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/helpers/money";
import {
  isUnknownDescription,
  type TransactionField,
} from "@/helpers/transaction";
import {
  countFilters,
  formatMonthParam,
  type TransactionPeriod,
  transactionParamsToSearch,
} from "@/helpers/transaction-filters";
import { usePreferences } from "@/hooks/use-preferences";
import type { ActionResult } from "@/types/action";
import type {
  Transaction,
  TransactionDayTotal,
  TransactionFilterParams,
  TransactionFormValues,
  TransactionInput,
  TransactionOptions,
  TransactionPage,
  TransactionTotals,
} from "@/types/transaction";
import { formatDate, shiftMonth, toCalendarDate } from "@/utils/calendar";
import { todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type TransactionsProps = {
  /** The filters from the URL. */
  params: TransactionFilterParams;
  /** The month or date range shown, with its Gregorian dates. */
  period: TransactionPeriod;
  /** The first page of matching transactions. */
  page: TransactionPage;
  totals: TransactionTotals;
  dayTotals: TransactionDayTotal[];
  /** Nothing recorded in the whole book yet: the first-run empty state. */
  bookIsEmpty: boolean;
  options: TransactionOptions;
  /** Editors and admins; viewers get the page without write controls. */
  canWrite: boolean;
  onUpdate: (
    input: TransactionFormValues & { id: string },
  ) => Promise<ActionResult<TransactionField>>;
  onDelete: (input: {
    id: string;
  }) => Promise<ActionResult<never, { deleted: TransactionInput }>>;
  onRestore: (
    input: TransactionInput,
  ) => Promise<ActionResult<TransactionField, { id: string }>>;
  /** The next page for the same filters (loadTransactions). */
  onLoadMore: (input: {
    query: string;
    cursor: string;
    limit?: number;
  }) => Promise<TransactionPage>;
};

/** Pages loaded after the first one, for one set of filters and one version of the first page. */
type MorePages = {
  query: string;
  base: TransactionPage;
  rows: Transaction[];
  cursor: string | null;
};

/** The rows of all loaded pages; a row that moved between pages shows once. */
function mergeRows(first: Transaction[], more: Transaction[]): Transaction[] {
  const seen = new Set(first.map((row) => row.id));
  return [...first, ...more.filter((row) => !seen.has(row.id))];
}

/**
 * The /transactions page: a month of the viewer's calendar (or a date range) with its income,
 * expense and net, the filters, and the transactions grouped by day, 50 at a time. Filters
 * and the month live in the URL. Rows open their detail; editors and admins can edit and
 * delete (with «واگرد»). Every change goes through a Server Action passed in as a prop, which
 * checks the role again.
 */
export function Transactions({
  params,
  period,
  page,
  totals,
  dayTotals,
  bookIsEmpty,
  options,
  canWrite,
  onUpdate,
  onDelete,
  onRestore,
  onLoadMore,
}: TransactionsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar, moneyUnit, timeZone } = usePreferences();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const openAdd = useAddTransaction();
  const [navigating, startNavigation] = useTransition();
  const [loadingMore, startLoadingMore] = useTransition();
  const [deleting, startDeleting] = useTransition();

  const [target, setTarget] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const query = transactionParamsToSearch(params).slice(1);
  const [more, setMore] = useState<MorePages | null>(null);
  const loaded = more?.query === query ? more : null;
  const rows = loaded ? mergeRows(page.rows, loaded.rows) : page.rows;
  const hasMore = loaded ? loaded.cursor !== null : page.nextCursor !== null;

  // After a change the server sends a fresh first page; reload the later pages to match.
  useEffect(() => {
    if (!loaded || loaded.base === page) return;
    let cancelled = false;
    const reload = page.nextCursor
      ? onLoadMore({
          query,
          cursor: page.nextCursor,
          limit: loaded.rows.length,
        })
      : Promise.resolve({ rows: [], nextCursor: null });
    reload
      .then((result) => {
        if (cancelled) return;
        setMore({
          query,
          base: page,
          rows: result.rows,
          cursor: result.nextCursor,
        });
      })
      .catch(() => {
        if (!cancelled) setMore(null);
      });
    return () => {
      cancelled = true;
    };
  }, [loaded, page, query, onLoadMore]);

  function loadMore() {
    const cursor = loaded ? loaded.cursor : page.nextCursor;
    if (!cursor) return;
    startLoadingMore(async () => {
      try {
        const result = await onLoadMore({ query, cursor });
        setMore({
          query,
          base: page,
          rows: [...(loaded?.rows ?? []), ...result.rows],
          cursor: result.nextCursor,
        });
      } catch {
        toast.show({ title: t("transactions.error"), tone: "danger" });
      }
    });
  }

  function navigate(next: TransactionFilterParams) {
    startNavigation(() => {
      router.push(`${pathname}${transactionParamsToSearch(next)}`, {
        scroll: false,
      });
    });
  }

  function goToMonth(delta: number) {
    if (period.kind !== "month") return;
    const next = shiftMonth(period.year, period.month, delta);
    const current = toCalendarDate(todayIso(timeZone), calendar);
    const isCurrent =
      next.year === current.year && next.month === current.month;
    navigate({
      ...params,
      from: null,
      to: null,
      month: isCurrent ? null : { calendar, ...next },
    });
  }

  function clearFilters() {
    navigate({
      ...params,
      types: [],
      accountId: null,
      categoryId: null,
      tag: null,
      search: "",
      unknownOnly: false,
    });
  }

  function openDetail(transaction: Transaction) {
    setTarget(transaction);
    setDetailOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setTarget(transaction);
    setDetailOpen(false);
    setFormOpen(true);
  }

  function askDelete(transaction: Transaction) {
    setTarget(transaction);
    setConfirmOpen(true);
  }

  async function submitEdit(values: TransactionFormValues) {
    if (!target) return { ok: false as const, error: t("transactions.failed") };
    const result = await onUpdate({ ...values, id: target.id });
    if (result.ok) {
      toast.show({ title: t("transactions.toasts.saved"), tone: "success" });
    }
    return result;
  }

  function restore(input: TransactionInput) {
    startDeleting(async () => {
      let result: ActionResult<TransactionField, { id: string }>;
      try {
        result = await onRestore(input);
      } catch {
        result = { ok: false, error: t("transactions.failed") };
      }
      toast.show(
        result.ok
          ? { title: t("transactions.toasts.restored"), tone: "success" }
          : { title: result.error, tone: "danger" },
      );
    });
  }

  function remove(transaction: Transaction) {
    startDeleting(async () => {
      let result: ActionResult<never, { deleted: TransactionInput }>;
      try {
        result = await onDelete({ id: transaction.id });
      } catch {
        result = { ok: false, error: t("transactions.failed") };
      }
      if (!result.ok) {
        toast.show({ title: result.error, tone: "danger" });
        return;
      }
      setConfirmOpen(false);
      setFormOpen(false);
      setDetailOpen(false);
      const { deleted } = result;
      const id = toast.show({
        title: t("transactions.toasts.deleted"),
        tone: "success",
        action: {
          label: t("common.undo"),
          onClick: () => {
            toast.close(id);
            restore(deleted);
          },
        },
      });
    });
  }

  const short = (date: string) =>
    formatDate(date, { locale, calendar, format: "short" });
  const rangeLabel =
    period.kind === "range"
      ? period.from && period.to
        ? t("transactions.filters.chips.range", {
            from: short(period.from),
            to: short(period.to),
          })
        : period.from
          ? t("transactions.filters.chips.from", { date: short(period.from) })
          : period.to
            ? t("transactions.filters.chips.to", { date: short(period.to) })
            : ""
      : "";

  const addButton =
    canWrite && openAdd ? (
      <Button size="sm" onClick={openAdd}>
        {t("addTransaction.title")}
      </Button>
    ) : null;

  function emptyState() {
    if (bookIsEmpty) {
      return (
        <EmptyState
          icon={ReceiptIcon}
          title={t("transactions.empty.firstTitle")}
          description={t(
            canWrite
              ? "transactions.empty.firstDescription"
              : "transactions.empty.firstViewerDescription",
          )}
          action={addButton}
          className={styles.empty}
        />
      );
    }
    if (countFilters(params) > 0) {
      return (
        <EmptyState
          icon={SearchXIcon}
          title={t("transactions.empty.noResultsTitle")}
          description={t("transactions.empty.noResultsDescription")}
          action={
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              {t("transactions.empty.clearFilters")}
            </Button>
          }
          className={styles.empty}
        />
      );
    }
    return (
      <EmptyState
        icon={CalendarXIcon}
        title={
          period.kind === "month"
            ? t("transactions.empty.monthTitle", {
                month: formatDate(period.from, {
                  locale,
                  calendar,
                  format: "month",
                }),
              })
            : t("transactions.empty.rangeTitle")
        }
        description={t(
          period.kind === "month"
            ? "transactions.empty.monthDescription"
            : "transactions.empty.rangeDescription",
        )}
        action={addButton}
        className={styles.empty}
      />
    );
  }

  const deleteDescription = target
    ? t("transactions.delete.description", {
        description: isUnknownDescription(target.description)
          ? t("transactions.list.unknownDescription")
          : target.description,
        amount: formatMoney(target.amount, moneyUnit, locale),
      })
    : "";

  return (
    <div className={styles.root}>
      <PageHeader
        title={t("nav.transactions")}
        actions={
          <>
            {canWrite ? null : (
              <Badge icon={EyeIcon}>{t("common.viewOnly")}</Badge>
            )}
            {period.kind === "month" ? (
              <MonthSwitcher
                key={formatMonthParam(period.year, period.month)}
                year={period.year}
                month={period.month}
                nextDisabled={period.isCurrent}
                onPrevious={() => goToMonth(-1)}
                onNext={() => goToMonth(1)}
              />
            ) : (
              <span className={styles.range}>
                <CalendarRangeIcon
                  className={styles.rangeIcon}
                  aria-hidden="true"
                />
                {rangeLabel}
              </span>
            )}
            <AddTransactionButton />
          </>
        }
      />

      <TransactionSummary totals={navigating ? null : totals} />

      <TransactionFilters
        params={params}
        onChange={navigate}
        options={options}
        countLabel={
          navigating
            ? ""
            : t("transactions.count", {
                countNumber: totals.count,
                count: formatNumber(totals.count, locale),
              })
        }
      />

      <Card padding="none" className={styles.list}>
        {navigating ? (
          <TransactionListSkeleton />
        ) : rows.length === 0 ? (
          emptyState()
        ) : (
          <TransactionList
            transactions={rows}
            dayTotals={dayTotals}
            canWrite={canWrite}
            onOpen={openDetail}
            onEdit={openEdit}
            onDelete={askDelete}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
          />
        )}
      </Card>

      <TransactionDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transaction={target}
        canWrite={canWrite}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      {canWrite ? (
        <>
          <TransactionDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            transaction={target}
            options={options}
            onSubmit={submitEdit}
            onDelete={askDelete}
          />
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={t("transactions.delete.title")}
            description={deleteDescription}
            icon={Trash2Icon}
            confirmLabel={t("transactions.delete.submit")}
            pending={deleting}
            onConfirm={() => target && remove(target)}
          />
        </>
      ) : null}
    </div>
  );
}

/** Rows of a loading list: a day header and a few rows. */
function TransactionListSkeleton() {
  const t = useTranslations("page");
  return (
    <div role="status" aria-busy="true" className={styles.skeleton}>
      <span className="visually-hidden">{t("loading")}</span>
      <div className={styles.skeletonDay}>
        <Skeleton width="180px" height="14px" />
      </div>
      {["42%", "30%", "50%", "36%", "44%", "28%"].map((width, index) => (
        <div key={index} className={styles.skeletonRow}>
          <Skeleton variant="rect" width="40px" height="40px" />
          <div className={styles.skeletonText}>
            <Skeleton width={width} height="14px" />
            <Skeleton width="24%" height="12px" />
          </div>
          <Skeleton width="96px" height="16px" />
        </div>
      ))}
    </div>
  );
}

/** The transactions page while it loads (loading.tsx): the header, the summary and rows. */
export function TransactionsSkeleton() {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader title={t("nav.transactions")} />
      <TransactionSummary totals={null} />
      <div className={styles.skeletonBar}>
        <Skeleton width="110px" height="32px" />
      </div>
      <Card padding="none" className={styles.list}>
        <TransactionListSkeleton />
      </Card>
    </div>
  );
}

/** The transactions didn't load (error.tsx): the page's header and a retry. */
export function TransactionsError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader title={t("nav.transactions")} />
      <ListError title={t("transactions.error")} onRetry={onRetry} />
    </div>
  );
}
