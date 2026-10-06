"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button, type ButtonVariant } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A question that names the object: «غیرفعال کردن کاربر؟». */
  title: ReactNode;
  /** What happens, and whether it can be undone. */
  description: ReactNode;
  icon: LucideIcon;
  tone?: "brand" | "danger" | "warning";
  /** A verb that names the outcome: «غیرفعال کردن کاربر». */
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  /** Shows a spinner on the confirm button while the action runs. */
  pending?: boolean;
  onConfirm: () => void;
};

/** Asks before a consequential action: «انصراف» and one button that names the outcome. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  tone = "danger",
  confirmLabel,
  confirmVariant = tone === "danger" ? "danger" : "primary",
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("common");
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={icon}
      tone={tone}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant={confirmVariant}
            loading={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
