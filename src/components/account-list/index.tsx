"use client";

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  InfoIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type DragEvent, useState } from "react";

import { Amount } from "@/components/ui/amount";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { maskIdentifier } from "@/helpers/account-identifier";
import list from "@/styles/list.module.css";
import type { Account } from "@/types/account";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type AccountListProps = {
  /** Active accounts in their saved order. */
  accounts: Account[];
  /** Editors and admins get the row menus and the drag handles. */
  canWrite: boolean;
  onEdit: (account: Account) => void;
  /** Moves an account to a new position; `ids` is the whole new order. */
  onReorder: (ids: string[]) => void;
  onArchive: (account: Account) => void;
  /** Asks first: delete, or archive when the account has transactions. */
  onDelete: (account: Account) => void;
  /** A change is being saved: the row menus are disabled until it finishes. */
  busy?: boolean;
};

/** A new order with `id` moved to `to` (an index in the old order). */
function moved(ids: string[], id: string, to: number): string[] {
  const rest = ids.filter((item) => item !== id);
  const from = ids.indexOf(id);
  // Dropping on a row below puts it after that row, on a row above before it.
  const index = from < to ? to : Math.max(0, to);
  return [...rest.slice(0, index), id, ...rest.slice(index)];
}

/** The quiet line under an account's name: its type, its masked identifier and how many transactions it has. */
export function useAccountMeta() {
  const t = useTranslations();
  const locale = useLocale();
  return (account: Account) =>
    t(`accounts.types.${account.type}`) +
    (account.identifier
      ? t("common.listSeparator") +
        t(`accounts.identifierKinds.${account.identifier.kind}`) +
        " " +
        isolate(maskIdentifier(account.identifier))
      : "") +
    t("common.listSeparator") +
    t("common.transactionCount", {
      countNumber: account.transactionCount,
      count: formatNumber(account.transactionCount, locale),
    });
}

/**
 * The active accounts: type icon, name, type and transaction count, current balance and a
 * menu (edit, move up or down, archive, delete). From 768px up, rows can be dragged by their
 * handle to reorder; on phones the menu moves them. The transaction form lists accounts in
 * this order.
 */
export function AccountList({
  accounts,
  canWrite,
  onEdit,
  onReorder,
  onArchive,
  onDelete,
  busy = false,
}: AccountListProps) {
  const t = useTranslations();
  const meta = useAccountMeta();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const ids = accounts.map((account) => account.id);
  const draggable = canWrite && accounts.length > 1;

  function move(id: string, to: number) {
    const next = moved(ids, id, to);
    if (next.some((item, index) => item !== ids[index])) onReorder(next);
  }

  function menuItems(account: Account, index: number): MenuItem[] {
    return [
      {
        label: t("accounts.actions.edit"),
        icon: PencilIcon,
        onClick: () => onEdit(account),
      },
      {
        label: t("accounts.actions.moveUp"),
        icon: ChevronUpIcon,
        disabled: index === 0,
        onClick: () => move(account.id, index - 1),
      },
      {
        label: t("accounts.actions.moveDown"),
        icon: ChevronDownIcon,
        disabled: index === accounts.length - 1,
        onClick: () => move(account.id, index + 1),
      },
      { separator: true },
      {
        label: t("accounts.actions.archive"),
        icon: ArchiveIcon,
        onClick: () => onArchive(account),
      },
      {
        label: t("accounts.actions.delete"),
        icon: Trash2Icon,
        danger: true,
        onClick: () => onDelete(account),
      },
    ];
  }

  function endDrag() {
    setDragging(null);
    setOver(null);
  }

  function dragProps(account: Account, index: number) {
    if (!draggable) return {};
    return {
      onDragOver: (event: DragEvent) => {
        if (!dragging) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (over !== account.id) setOver(account.id);
      },
      onDrop: (event: DragEvent) => {
        event.preventDefault();
        if (dragging && dragging !== account.id) move(dragging, index);
        endDrag();
      },
    };
  }

  const dragFrom = dragging ? ids.indexOf(dragging) : -1;

  return (
    <div className={styles.root}>
      <ul
        className={list.list}
        aria-label={t("accounts.list")}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setOver(null);
          }
        }}
      >
        {accounts.map((account, index) => {
          const Icon = ACCOUNT_TYPE_ICONS[account.type];
          const target = over === account.id && dragging !== account.id;
          return (
            <li
              key={account.id}
              className={cx(
                list.item,
                styles.item,
                dragging === account.id && styles.dragging,
                target &&
                  (dragFrom < index ? styles.dropAfter : styles.dropBefore),
              )}
              {...dragProps(account, index)}
            >
              <div className={list.row}>
                {draggable ? (
                  <span
                    className={styles.handle}
                    draggable
                    title={t("accounts.dragHandle", { name: account.name })}
                    aria-hidden="true"
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", account.id);
                      const row = event.currentTarget.closest("li");
                      if (row) event.dataTransfer.setDragImage(row, 24, 24);
                      setDragging(account.id);
                    }}
                    onDragEnd={endDrag}
                  >
                    <GripVerticalIcon className={styles.handleIcon} />
                  </span>
                ) : null}
                <span className={styles.icon} aria-hidden="true">
                  <Icon className={styles.iconGlyph} />
                </span>
                <div className={list.text}>
                  <span className={list.name}>{account.name}</span>
                  <span className={list.meta}>{meta(account)}</span>
                </div>
                <div className={list.end}>
                  <Amount value={account.balance} className={styles.balance} />
                  {canWrite ? (
                    <Menu
                      align="end"
                      items={menuItems(account, index)}
                      trigger={
                        <IconButton
                          icon={EllipsisVerticalIcon}
                          label={t("accounts.menu", { name: account.name })}
                          size="sm"
                          disabled={busy}
                        />
                      }
                    />
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** How to reorder: drag the handle from 768px up, the row menu on phones. */
export function AccountReorderHint() {
  const t = useTranslations("accounts");
  return (
    <p className={styles.hint}>
      <InfoIcon className={styles.hintIcon} aria-hidden="true" />
      <span className={styles.dragHint}>{t("dragHint")}</span>
      <span className={styles.moveHint}>{t("moveHint")}</span>
    </p>
  );
}

/** Widths of a placeholder row's name and line under it. */
const SKELETON_ROWS = [
  ["120px", "160px"],
  ["96px", "136px"],
  ["140px", "172px"],
  ["104px", "148px"],
] as const;

/**
 * The accounts while they load, laid out like AccountList: for writers the drag handle and
 * the row menu, then a placeholder tile, name, line and balance in the real sizes and fonts.
 */
export function AccountListSkeleton({
  canWrite = true,
}: {
  canWrite?: boolean;
}) {
  const t = useTranslations("accounts");
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={list.list}>
        {SKELETON_ROWS.map(([name, meta]) => (
          <div key={name} className={list.item}>
            <div className={list.row}>
              {canWrite ? (
                <span className={styles.handle}>
                  <GripVerticalIcon className={styles.handleIcon} />
                </span>
              ) : null}
              <Skeleton
                width="var(--account-icon)"
                height="var(--account-icon)"
                radius="var(--account-icon-radius)"
                className={styles.skeletonIcon}
              />
              <div className={list.text}>
                <span className={list.name}>
                  <Skeleton variant="text" width={name} />
                </span>
                <span className={list.meta}>
                  <Skeleton variant="text" width={meta} />
                </span>
              </div>
              <div className={list.end}>
                <span className={styles.skeletonBalance}>
                  <Skeleton variant="text" width="104px" />
                </span>
                {canWrite ? (
                  <IconButton
                    icon={EllipsisVerticalIcon}
                    label={t("list")}
                    size="sm"
                    disabled
                  />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ArchivedAccountListProps = {
  accounts: Account[];
  canWrite: boolean;
  onRestore: (account: Account) => void;
  onDelete: (account: Account) => void;
  /** A change is being saved: the row menus are disabled until it finishes. */
  busy?: boolean;
};

/** Archived accounts, quieter, with a menu to restore or delete them. */
export function ArchivedAccountList({
  accounts,
  canWrite,
  onRestore,
  onDelete,
  busy = false,
}: ArchivedAccountListProps) {
  const t = useTranslations();
  const meta = useAccountMeta();
  return (
    <ul className={list.list}>
      {accounts.map((account) => (
        <li key={account.id} className={cx(list.item, list.muted)}>
          <div className={list.row}>
            <div className={list.text}>
              <span className={list.name}>{account.name}</span>
              <span className={list.meta}>{meta(account)}</span>
            </div>
            <div className={list.end}>
              <Amount value={account.balance} className={list.amount} />
              {canWrite ? (
                <Menu
                  align="end"
                  items={[
                    {
                      label: t("accounts.actions.restore"),
                      icon: ArchiveRestoreIcon,
                      onClick: () => onRestore(account),
                    },
                    {
                      label: t("accounts.actions.delete"),
                      icon: Trash2Icon,
                      danger: true,
                      onClick: () => onDelete(account),
                    },
                  ]}
                  trigger={
                    <IconButton
                      icon={EllipsisVerticalIcon}
                      label={t("accounts.menu", { name: account.name })}
                      size="sm"
                      disabled={busy}
                    />
                  }
                />
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
