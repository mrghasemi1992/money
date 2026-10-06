"use client";

import {
  EllipsisIcon,
  EyeIcon,
  KeyRoundIcon,
  PencilIcon,
  SearchXIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  UserXIcon,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateText } from "@/components/ui/date-text";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { SearchField } from "@/components/ui/search-field";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LOCALE_NAMES } from "@/constants/locale";
import { USER_ROLES } from "@/constants/user";
import type { ManagedUser, UserRole } from "@/types/user";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type UserListProps = {
  users: ManagedUser[];
  /** The signed-in admin: marked «شما», and the actions on themself are disabled with a reason. */
  currentUserId: string;
  /** Opens the new-user form (from the empty state). */
  onNewUser: () => void;
  onResetPassword: (user: ManagedUser) => void;
  onChangeRole: (user: ManagedUser) => void;
  /** Asks to confirm, then disables. */
  onDisable: (user: ManagedUser) => void;
  onEnable: (user: ManagedUser) => void;
};

type StatusFilter = "all" | "active" | "disabled";

const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  admin: ShieldCheckIcon,
  editor: PencilIcon,
  viewer: EyeIcon,
};

/** Lowercase and without the zero-width non-joiner, so «می‌خواهم» matches «میخواهم». */
function searchable(text: string): string {
  return text.toLowerCase().replaceAll("‌", "");
}

/**
 * Every user with their role, language, status and creation date, with search and role and
 * status filters. A table where there is room for it, cards on narrow screens. Each user has a
 * menu: reset password, change role, disable or enable.
 */
export function UserList({
  users,
  currentUserId,
  onNewUser,
  onResetPassword,
  onChangeRole,
  onDisable,
  onEnable,
}: UserListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const search = searchable(query.trim());
  const filtering =
    search !== "" || roleFilter !== "all" || statusFilter !== "all";
  const shown = users.filter(
    (user) =>
      (!search ||
        searchable(user.name).includes(search) ||
        searchable(user.username).includes(search)) &&
      (roleFilter === "all" || user.role === roleFilter) &&
      (statusFilter === "all" ||
        (statusFilter === "disabled") === user.disabled),
  );
  // Only the admin themself: invite them to create the others.
  const alone = users.every((user) => user.id === currentUserId);

  function clearFilters() {
    setQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
  }

  function menuItems(user: ManagedUser): MenuItem[] {
    const self = user.id === currentUserId;
    const items: MenuItem[] = [
      self
        ? {
            label: t("users.actions.resetPassword"),
            description: t("users.self.password"),
            icon: KeyRoundIcon,
            disabled: true,
          }
        : {
            label: t("users.actions.resetPassword"),
            icon: KeyRoundIcon,
            onClick: () => onResetPassword(user),
          },
      self
        ? {
            label: t("users.actions.changeRole"),
            description: t("users.self.role"),
            icon: ShieldIcon,
            disabled: true,
          }
        : {
            label: t("users.actions.changeRole"),
            icon: ShieldIcon,
            onClick: () => onChangeRole(user),
          },
      { separator: true },
    ];
    if (user.disabled) {
      items.push({
        label: t("users.actions.enable"),
        icon: UserCheckIcon,
        onClick: () => onEnable(user),
      });
    } else if (self) {
      items.push({
        label: t("users.actions.disable"),
        description: t("users.self.disable"),
        icon: UserXIcon,
        disabled: true,
      });
    } else {
      items.push({
        label: t("users.actions.disable"),
        icon: UserXIcon,
        danger: true,
        onClick: () => onDisable(user),
      });
    }
    return items;
  }

  function rowMenu(user: ManagedUser) {
    return (
      <Menu
        align="end"
        items={menuItems(user)}
        trigger={
          <IconButton
            icon={EllipsisIcon}
            label={t("users.menu", { name: user.name })}
            size="sm"
          />
        }
      />
    );
  }

  function nameLine(user: ManagedUser) {
    return (
      <span className={styles.nameLine}>
        <span className={styles.name}>{user.name}</span>
        {user.id === currentUserId ? (
          <Badge tone="brand" size="sm">
            {t("users.you")}
          </Badge>
        ) : null}
      </span>
    );
  }

  function roleBadge(user: ManagedUser) {
    return (
      <Badge
        tone={user.role === "admin" ? "brand" : "neutral"}
        icon={ROLE_ICONS[user.role]}
        size="sm"
      >
        {t(`role.${user.role}`)}
      </Badge>
    );
  }

  function statusBadge(user: ManagedUser) {
    return (
      <Badge tone={user.disabled ? "neutral" : "success"} dot size="sm">
        {t(user.disabled ? "users.status.disabled" : "users.status.active")}
      </Badge>
    );
  }

  function username(user: ManagedUser) {
    return (
      <bdi dir="ltr" className={styles.username}>
        {user.username}
      </bdi>
    );
  }

  function language(user: ManagedUser) {
    return <span lang={user.locale}>{LOCALE_NAMES[user.locale]}</span>;
  }

  const emptyState = alone && !filtering && (
    <EmptyState
      icon={UsersIcon}
      title={t("users.empty.title")}
      description={t("users.empty.description")}
      action={
        <Button iconStart={UserPlusIcon} onClick={onNewUser}>
          {t("users.newUser")}
        </Button>
      }
      className={styles.empty}
    />
  );
  const noResults = filtering && shown.length === 0 && (
    <EmptyState
      size="sm"
      icon={SearchXIcon}
      title={t("users.noResults.title")}
      description={t("users.noResults.description")}
      action={
        <Button variant="secondary" onClick={clearFilters}>
          {t("users.noResults.clear")}
        </Button>
      }
      className={styles.empty}
    />
  );

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <SearchField
          className={styles.search}
          aria-label={t("users.search")}
          placeholder={t("users.search")}
          value={query}
          onValueChange={setQuery}
        />
        <div className={styles.filters}>
          <Select
            className={styles.filter}
            aria-label={t("users.roleFilter")}
            value={roleFilter}
            onValueChange={(value) =>
              setRoleFilter(USER_ROLES.find((role) => role === value) ?? "all")
            }
            options={[
              { value: "all", label: t("users.allRoles") },
              ...USER_ROLES.map((role) => ({
                value: role,
                label: t(`role.${role}`),
              })),
            ]}
          />
          <Select
            className={styles.filter}
            aria-label={t("users.statusFilter")}
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(
                value === "active" || value === "disabled" ? value : "all",
              )
            }
            options={[
              { value: "all", label: t("users.allStatuses") },
              { value: "active", label: t("users.status.active") },
              { value: "disabled", label: t("users.status.disabled") },
            ]}
          />
        </div>
      </div>
      <p className={styles.summary}>
        {t("users.summary", {
          countNumber: users.length,
          count: formatNumber(users.length, locale),
          active: formatNumber(
            users.filter((user) => !user.disabled).length,
            locale,
          ),
        })}
      </p>

      {/* Wide: a table. */}
      <div className={cx(styles.panel, styles.tableView)}>
        <table className={styles.table} aria-label={t("nav.users")}>
          <thead>
            <tr>
              <th scope="col">{t("users.columns.user")}</th>
              <th scope="col">{t("users.columns.username")}</th>
              <th scope="col">{t("users.columns.role")}</th>
              <th scope="col">{t("users.columns.language")}</th>
              <th scope="col">{t("users.columns.status")}</th>
              <th scope="col">{t("users.columns.created")}</th>
              <th scope="col" className={styles.actionsCol}>
                <span className="visually-hidden">
                  {t("users.columns.actions")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((user) => (
              <tr
                key={user.id}
                className={cx(user.disabled && styles.disabled)}
              >
                <td>
                  <span className={styles.person}>
                    <Avatar name={user.name} size="sm" />
                    {nameLine(user)}
                  </span>
                </td>
                <td>{username(user)}</td>
                <td>{roleBadge(user)}</td>
                <td className={styles.secondary}>{language(user)}</td>
                <td>{statusBadge(user)}</td>
                <td className={styles.secondary}>
                  <DateText value={user.createdOn} />
                </td>
                <td className={styles.actionsCol}>{rowMenu(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {emptyState}
        {noResults}
      </div>

      {/* Narrow: cards. */}
      <div className={styles.cardView}>
        <ul className={styles.cards} aria-label={t("nav.users")}>
          {shown.map((user) => (
            <li
              key={user.id}
              className={cx(styles.card, user.disabled && styles.disabled)}
            >
              <Avatar name={user.name} />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>
                  {nameLine(user)}
                  {username(user)}
                </div>
                <div className={styles.badges}>
                  {roleBadge(user)}
                  {statusBadge(user)}
                </div>
                <p className={styles.meta}>
                  {language(user)}
                  {t("users.metaSeparator")}
                  {t.rich("users.createdOn", {
                    date: () => <DateText value={user.createdOn} />,
                  })}
                </p>
              </div>
              {rowMenu(user)}
            </li>
          ))}
        </ul>
        {emptyState || noResults ? (
          <div className={styles.panel}>
            {emptyState}
            {noResults}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** The user list while it loads: the toolbar and five rows. */
export function UserListSkeleton() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.toolbar}>
        <Skeleton className={styles.search} height="var(--control-h-md)" />
        <div className={styles.filters}>
          <Skeleton className={styles.filter} height="var(--control-h-md)" />
          <Skeleton className={styles.filter} height="var(--control-h-md)" />
        </div>
      </div>
      <Skeleton width="96px" height="12px" />
      <div className={cx(styles.panel, styles.skeletonList)}>
        {["32%", "24%", "36%", "28%", "30%"].map((width, index) => (
          <div key={index} className={styles.skeletonRow}>
            <Skeleton variant="circle" width="var(--avatar-md)" />
            <div className={styles.skeletonText}>
              <Skeleton width={width} height="14px" />
              <Skeleton width="20%" height="12px" />
            </div>
            <Skeleton width="64px" height="22px" />
          </div>
        ))}
      </div>
    </div>
  );
}
