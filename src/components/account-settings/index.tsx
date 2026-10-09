"use client";

import {
  ArchiveIcon,
  EyeIcon,
  LandmarkIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useOptimistic, useState, useTransition } from "react";

import {
  AccountList,
  AccountReorderHint,
  ArchivedAccountList,
} from "@/components/account-list";
import { AccountDialog } from "@/components/account-dialog";
import { ArchivedSection } from "@/components/archived-section";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { ListError } from "@/components/page-status";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Amount } from "@/components/ui/amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import type { Account, AccountField, AccountInput } from "@/types/account";
import type { ActionResult } from "@/types/action";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type AccountSettingsProps = {
  /** Every account in its saved order, archived ones included. */
  accounts: Account[];
  /** Editors and admins; viewers see the page without write controls. */
  canWrite: boolean;
  onCreate: (
    input: AccountInput,
  ) => Promise<ActionResult<AccountField, { id: string }>>;
  onUpdate: (
    input: AccountInput & { id: string },
  ) => Promise<ActionResult<AccountField>>;
  onArchive: (input: {
    id: string;
    archived: boolean;
  }) => Promise<ActionResult>;
  onDelete: (input: { id: string }) => Promise<ActionResult>;
  onReorder: (input: { ids: string[] }) => Promise<ActionResult>;
};

type DialogKind = "form" | "delete" | "blocked";

/**
 * The /settings/accounts page: the total balance of the active accounts, the accounts in
 * their order (drag or the row menu to reorder), archived ones below, and the add, edit,
 * archive and delete dialogs. Every change goes through a Server Action passed in as a prop,
 * which checks the role again; adds, deletes and archiving offer «واگرد» in their toast.
 */
export function AccountSettings({
  accounts,
  canWrite,
  onCreate,
  onUpdate,
  onArchive,
  onDelete,
  onReorder,
}: AccountSettingsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  // Kept after a dialog closes, so its text stays while it animates out.
  const [target, setTarget] = useState<Account | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [, startReorder] = useTransition();

  const active = accounts.filter((account) => !account.archived);
  const archived = accounts.filter((account) => account.archived);
  // A move shows at once; the page's refresh brings the saved order.
  const [order, setOrder] = useOptimistic(active.map((account) => account.id));
  const byId = new Map(active.map((account) => [account.id, account]));
  const ordered = order.flatMap((id) => byId.get(id) ?? []);
  const total = active.reduce((sum, account) => sum + account.balance, 0);

  function open(kind: DialogKind, account: Account | null) {
    setTarget(account);
    setDialog(kind);
  }

  function onOpenChange(isOpen: boolean) {
    if (!isOpen) setDialog(null);
  }

  /** Runs an action; on success calls `done`, otherwise shows the error. */
  function run(action: () => Promise<ActionResult<string>>, done: () => void) {
    startTransition(async () => {
      let result: ActionResult<string>;
      try {
        result = await action();
      } catch {
        result = { ok: false, error: t("accounts.failed") };
      }
      if (result.ok) {
        setDialog(null);
        done();
      } else {
        toast.show({ title: result.error, tone: "danger" });
      }
    });
  }

  function undoable(title: string, undo: () => void) {
    const id = toast.show({
      title,
      tone: "success",
      action: {
        label: t("common.undo"),
        onClick: () => {
          toast.close(id);
          undo();
        },
      },
    });
  }

  function setArchived(account: Account, value: boolean, offerUndo = true) {
    run(
      () => onArchive({ id: account.id, archived: value }),
      () => {
        const title = t(
          value ? "accounts.toasts.archived" : "accounts.toasts.restored",
          { name: account.name },
        );
        if (offerUndo) {
          undoable(title, () => setArchived(account, !value, false));
        } else {
          toast.show({ title, tone: "success" });
        }
      },
    );
  }

  function askDelete(account: Account) {
    open(account.transactionCount > 0 ? "blocked" : "delete", account);
  }

  function remove(account: Account) {
    run(
      () => onDelete({ id: account.id }),
      () =>
        undoable(t("accounts.toasts.deleted", { name: account.name }), () =>
          run(
            () =>
              onCreate({
                name: account.name,
                type: account.type,
                identifier: account.identifier,
                openingBalance: account.openingBalance,
              }),
            () =>
              toast.show({
                title: t("accounts.toasts.restored", { name: account.name }),
                tone: "success",
              }),
          ),
        ),
    );
  }

  function reorder(ids: string[]) {
    startReorder(async () => {
      setOrder(ids);
      let result: ActionResult;
      try {
        result = await onReorder({ ids });
      } catch {
        result = { ok: false, error: t("accounts.failed") };
      }
      if (!result.ok) toast.show({ title: result.error, tone: "danger" });
    });
  }

  async function submit(input: AccountInput) {
    if (target) return onUpdate({ ...input, id: target.id });
    const result = await onCreate(input);
    if (result.ok) {
      const id = result.id;
      undoable(t("accounts.toasts.added"), () =>
        run(
          () => onDelete({ id }),
          () =>
            toast.show({
              title: t("accounts.toasts.deleted", { name: input.name }),
              tone: "success",
            }),
        ),
      );
    }
    return result;
  }

  const name = target?.name ?? "";
  const count = formatNumber(target?.transactionCount ?? 0, locale);
  const empty = active.length === 0;

  return (
    <div className={styles.root}>
      <PageHeader
        title={t("accounts.title")}
        subtitle={t("accounts.subtitle")}
        actions={
          canWrite ? (
            empty ? null : (
              <Button iconStart={PlusIcon} onClick={() => open("form", null)}>
                {t("accounts.add")}
              </Button>
            )
          ) : (
            <Badge icon={EyeIcon}>{t("common.viewOnly")}</Badge>
          )
        }
      />

      {empty ? (
        <Card padding="md">
          <EmptyState
            icon={LandmarkIcon}
            title={t(
              canWrite ? "accounts.empty.title" : "accounts.empty.viewerTitle",
            )}
            description={t(
              canWrite
                ? "accounts.empty.description"
                : "accounts.empty.viewerDescription",
            )}
            action={
              canWrite ? (
                <Button iconStart={PlusIcon} onClick={() => open("form", null)}>
                  {t("accounts.add")}
                </Button>
              ) : null
            }
            className={styles.empty}
          />
        </Card>
      ) : (
        <>
          <Card variant="brand" padding="lg">
            <div className={styles.total}>
              <span className={styles.totalLabel}>{t("accounts.total")}</span>
              <Amount
                value={total}
                size="hero"
                className={styles.totalAmount}
              />
              <span className={styles.totalNote}>
                {t("accounts.totalNote", {
                  countNumber: active.length,
                  count: formatNumber(active.length, locale),
                  archived: archived.length > 0 ? "true" : "false",
                })}
              </span>
            </div>
          </Card>
          <div className={styles.list}>
            <Card padding="none">
              <AccountList
                accounts={ordered}
                canWrite={canWrite}
                onEdit={(account) => open("form", account)}
                onReorder={reorder}
                onArchive={(account) => setArchived(account, true)}
                onDelete={askDelete}
              />
            </Card>
            {canWrite && active.length > 1 ? <AccountReorderHint /> : null}
          </div>
        </>
      )}

      {archived.length > 0 ? (
        <ArchivedSection
          label={t("accounts.archived", {
            count: formatNumber(archived.length, locale),
          })}
          note={t("accounts.archivedNote")}
          open={archivedOpen}
          onOpenChange={setArchivedOpen}
        >
          <ArchivedAccountList
            accounts={archived}
            canWrite={canWrite}
            onRestore={(account) => setArchived(account, false)}
            onDelete={askDelete}
          />
        </ArchivedSection>
      ) : null}

      {canWrite ? (
        <>
          <AccountDialog
            open={dialog === "form"}
            onOpenChange={onOpenChange}
            account={target}
            onSubmit={submit}
            onSaved={() => {
              if (target) {
                toast.show({
                  title: t("accounts.toasts.saved"),
                  tone: "success",
                });
              }
            }}
          />
          <ConfirmDialog
            open={dialog === "delete"}
            onOpenChange={onOpenChange}
            title={t("accounts.delete.title")}
            description={t("accounts.delete.description", { name })}
            icon={Trash2Icon}
            confirmLabel={t("accounts.delete.submit")}
            pending={pending}
            onConfirm={() => target && remove(target)}
          />
          {target?.archived ? (
            <ResponsiveDialog
              open={dialog === "blocked"}
              onOpenChange={onOpenChange}
              title={t("accounts.blocked.title")}
              description={t("accounts.blocked.archivedDescription", {
                name,
                count,
              })}
              icon={ArchiveIcon}
              tone="warning"
              size="sm"
              footer={
                <Button variant="secondary" onClick={() => setDialog(null)}>
                  {t("common.close")}
                </Button>
              }
            />
          ) : (
            <ConfirmDialog
              open={dialog === "blocked"}
              onOpenChange={onOpenChange}
              title={t("accounts.blocked.title")}
              description={t("accounts.blocked.description", { name, count })}
              icon={ArchiveIcon}
              tone="warning"
              confirmLabel={t("accounts.blocked.submit")}
              pending={pending}
              onConfirm={() => target && setArchived(target, true)}
            />
          )}
        </>
      ) : null}
    </div>
  );
}

/** The accounts page while it loads (loading.tsx): the header, the total and a few rows. */
export function AccountSettingsSkeleton() {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("accounts.title")}
        subtitle={t("accounts.subtitle")}
      />
      <div role="status" aria-busy="true" className={styles.root}>
        <span className="visually-hidden">{t("page.loading")}</span>
        <Card padding="lg">
          <div className={styles.total}>
            <Skeleton width="90px" height="14px" />
            <Skeleton width="240px" height="32px" />
            <Skeleton width="120px" height="12px" />
          </div>
        </Card>
        <Card padding="none">
          {["140px", "110px", "160px", "120px"].map((width, index) => (
            <div key={index} className={styles.skeletonRow}>
              <Skeleton variant="circle" width="var(--account-icon)" />
              <div className={styles.skeletonText}>
                <Skeleton width={width} height="14px" />
                <Skeleton width="80px" height="12px" />
              </div>
              <Skeleton width="104px" height="16px" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/** The accounts didn't load (error.tsx): the page's header and a retry. */
export function AccountSettingsError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("accounts");
  return (
    <div className={styles.root}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ListError title={t("error")} onRetry={onRetry} />
    </div>
  );
}
