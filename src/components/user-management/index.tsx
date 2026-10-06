"use client";

import { ShieldOffIcon, UserPlusIcon, UserXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { NewUserDialog } from "@/components/new-user-dialog";
import { PageHeader } from "@/components/page-header";
import { ResetPasswordDialog } from "@/components/reset-password-dialog";
import { RoleDialog } from "@/components/role-dialog";
import { UserList, UserListSkeleton } from "@/components/user-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/types/action";
import type { ManagedUser, UserRole } from "@/types/user";

import styles from "./styles.module.css";

type UserManagementProps = {
  users: ManagedUser[];
  /** The signed-in admin. */
  currentUserId: string;
  onGeneratePassword: () => Promise<string>;
  onCreate: ComponentProps<typeof NewUserDialog>["onCreate"];
  onResetPassword: ComponentProps<typeof ResetPasswordDialog>["onReset"];
  onChangeRole: (input: {
    userId: string;
    role: UserRole;
  }) => Promise<ActionResult>;
  onDisable: (input: { userId: string }) => Promise<ActionResult>;
  onEnable: (input: { userId: string }) => Promise<ActionResult>;
};

type DialogKind = "new" | "role" | "demote" | "disable" | "reset";

/**
 * The /admin/users page: the user list and its dialogs (new user, change role, remove admin
 * rights, disable, reset password). Every change goes through a Server Action passed in as a
 * prop, which checks the admin again; the page refreshes with the new list afterwards.
 */
export function UserManagement({
  users,
  currentUserId,
  onGeneratePassword,
  onCreate,
  onResetPassword,
  onChangeRole,
  onDisable,
  onEnable,
}: UserManagementProps) {
  const t = useTranslations();
  const toast = useToast();
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  // Kept after a dialog closes, so its text stays while it animates out.
  const [target, setTarget] = useState<ManagedUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("viewer");
  const [pending, startTransition] = useTransition();

  function open(kind: DialogKind, user: ManagedUser | null = null) {
    if (user) setTarget(user);
    setDialog(kind);
  }

  function onOpenChange(isOpen: boolean) {
    if (!isOpen) setDialog(null);
  }

  /** Runs an action; on success closes the dialog and calls `done`, otherwise shows the error. */
  function run(action: () => Promise<ActionResult>, done: () => void) {
    startTransition(async () => {
      let result: ActionResult;
      try {
        result = await action();
      } catch {
        result = { ok: false, error: t("users.failed") };
      }
      if (result.ok) {
        setDialog(null);
        done();
      } else {
        toast.show({ title: result.error, tone: "danger" });
      }
    });
  }

  function applyRole(user: ManagedUser, role: UserRole) {
    run(
      () => onChangeRole({ userId: user.id, role }),
      () =>
        toast.show({
          title: t("users.toasts.roleChanged"),
          description: t("users.toasts.roleChangedDescription", {
            name: user.name,
            role: t(`role.${role}`),
          }),
          tone: "success",
        }),
    );
  }

  function saveRole(role: UserRole) {
    if (!target) return;
    if (role === target.role) {
      setDialog(null);
    } else if (target.role === "admin") {
      // Removing admin rights asks once more.
      setNewRole(role);
      setDialog("demote");
    } else {
      applyRole(target, role);
    }
  }

  function enable(user: ManagedUser) {
    run(
      () => onEnable({ userId: user.id }),
      () =>
        toast.show({
          title: t("users.toasts.enabled"),
          description: user.name,
          tone: "success",
        }),
    );
  }

  function disable(user: ManagedUser) {
    run(
      () => onDisable({ userId: user.id }),
      () => {
        const id = toast.show({
          title: t("users.toasts.disabled"),
          description: user.name,
          action: {
            label: t("common.undo"),
            onClick: () => {
              toast.close(id);
              enable(user);
            },
          },
        });
      },
    );
  }

  const name = target?.name ?? "";

  return (
    <>
      <PageHeader
        title={t("nav.users")}
        subtitle={t("users.subtitle")}
        actions={
          <Button iconStart={UserPlusIcon} onClick={() => open("new")}>
            {t("users.newUser")}
          </Button>
        }
      />
      <UserList
        users={users}
        currentUserId={currentUserId}
        onNewUser={() => open("new")}
        onResetPassword={(user) => open("reset", user)}
        onChangeRole={(user) => open("role", user)}
        onDisable={(user) => open("disable", user)}
        onEnable={enable}
      />

      <NewUserDialog
        open={dialog === "new"}
        onOpenChange={onOpenChange}
        onGeneratePassword={onGeneratePassword}
        onCreate={onCreate}
      />
      <RoleDialog
        open={dialog === "role"}
        onOpenChange={onOpenChange}
        user={target}
        pending={pending}
        onSave={saveRole}
      />
      <ConfirmDialog
        open={dialog === "demote"}
        onOpenChange={onOpenChange}
        title={t("users.demote.title")}
        description={t("users.demote.description", {
          name,
          role: t(`role.${newRole}`),
        })}
        icon={ShieldOffIcon}
        confirmLabel={t("users.demote.submit")}
        pending={pending}
        onConfirm={() => target && applyRole(target, newRole)}
      />
      <ConfirmDialog
        open={dialog === "disable"}
        onOpenChange={onOpenChange}
        title={t("users.disable.title")}
        description={t.rich("users.disable.description", {
          name,
          username: () => <bdi dir="ltr">{target?.username}</bdi>,
        })}
        icon={UserXIcon}
        confirmLabel={t("users.disable.submit")}
        pending={pending}
        onConfirm={() => target && disable(target)}
      />
      <ResetPasswordDialog
        open={dialog === "reset"}
        onOpenChange={onOpenChange}
        user={target}
        onReset={onResetPassword}
      />
    </>
  );
}

/**
 * The page while the list loads. It names nothing (no title), because users who aren't admins
 * see it for a moment before «not found».
 */
export function UserManagementSkeleton() {
  const t = useTranslations("page");
  return (
    <div className={styles.skeleton} role="status" aria-busy="true">
      <span className="visually-hidden">{t("loading")}</span>
      <div className={styles.skeletonHeader}>
        <Skeleton width="168px" height="26px" />
        <Skeleton width="240px" height="14px" />
      </div>
      <UserListSkeleton />
    </div>
  );
}
