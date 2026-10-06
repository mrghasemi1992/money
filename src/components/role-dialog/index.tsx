"use client";

import { ShieldIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { USER_ROLES } from "@/constants/user";
import { toUserRole } from "@/helpers/role";
import type { UserRole } from "@/types/user";

type RoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The user whose role changes. Kept while the dialog closes, so its text doesn't vanish. */
  user: { name: string; role: UserRole } | null;
  /** Shows a spinner on «ذخیره نقش» while the change is saved. */
  pending?: boolean;
  /** Called with the chosen role, also when it is the current one. */
  onSave: (role: UserRole) => void;
};

/** Picks a new role for a user, with one line on what each role may do. */
export function RoleDialog({
  open,
  onOpenChange,
  user,
  pending = false,
  onSave,
}: RoleDialogProps) {
  const t = useTranslations();
  const [role, setRole] = useState<UserRole>(user?.role ?? "viewer");

  // Start from the user's current role each time the dialog opens.
  const [openedFor, setOpenedFor] = useState<RoleDialogProps["user"]>(null);
  if (open && user !== openedFor) {
    setOpenedFor(user);
    if (user) setRole(user.role);
  } else if (!open && openedFor) {
    setOpenedFor(null);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("users.role.title")}
      description={
        user ? t("users.role.description", { name: user.name }) : undefined
      }
      icon={ShieldIcon}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button loading={pending} onClick={() => onSave(role)}>
            {t("users.role.submit")}
          </Button>
        </>
      }
    >
      <RadioGroup
        aria-label={t("users.columns.role")}
        value={role}
        onValueChange={(value) => setRole(toUserRole(value))}
        options={USER_ROLES.map((value) => ({
          value,
          label: t(`role.${value}`),
          description: t(`users.roleDescriptions.${value}`),
        }))}
      />
    </ResponsiveDialog>
  );
}
