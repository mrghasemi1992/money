"use client";

import { CheckIcon, CopyIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useClipboard } from "@/hooks/use-clipboard";
import type { ActionResult } from "@/types/action";

import styles from "./styles.module.css";

type ResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The user whose password is reset. Kept while the dialog closes. */
  user: { id: string; name: string } | null;
  /**
   * Makes a new temporary password on the server and signs the user out everywhere (the
   * resetPassword Server Action). The password comes back once, to show here.
   */
  onReset: (input: {
    userId: string;
  }) => Promise<ActionResult<never, { password: string }>>;
};

/**
 * Resets a user's password in two steps: confirm, then show the new temporary password once,
 * with a copy button. The password lives only in this dialog's state and is dropped on the
 * next open.
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onReset,
}: ResetPasswordDialogProps) {
  const t = useTranslations();
  const toast = useToast();
  const { copied, copy } = useClipboard();
  const [password, setPassword] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Each opening starts at the confirmation, without the last password.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPassword(null);
  }

  function reset() {
    if (!user) return;
    startTransition(async () => {
      let result: ActionResult<never, { password: string }>;
      try {
        result = await onReset({ userId: user.id });
      } catch {
        result = { ok: false, error: t("users.failed") };
      }
      if (result.ok) setPassword(result.password);
      else toast.show({ title: result.error, tone: "danger" });
    });
  }

  async function copyPassword() {
    if (!password) return;
    if (await copy(password)) {
      toast.show({ title: t("users.toasts.copied"), tone: "success" });
    } else {
      toast.show({ title: t("users.toasts.copyFailed"), tone: "warning" });
    }
  }

  const name = user?.name ?? "";

  if (password === null) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t("users.reset.title")}
        description={t("users.reset.description", { name })}
        icon={KeyRoundIcon}
        tone="warning"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button loading={pending} onClick={reset}>
              {t("users.reset.submit")}
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("users.reset.shownTitle")}
      description={t("users.reset.shownDescription", { name })}
      icon={KeyRoundIcon}
      tone="success"
      size="sm"
      footer={
        <Button onClick={() => onOpenChange(false)}>
          {t("users.reset.done")}
        </Button>
      }
    >
      <TemporaryPassword
        password={password}
        copied={copied}
        copyLabel={t("users.reset.copy")}
        copiedLabel={t("users.reset.copied")}
        onCopy={copyPassword}
      />
      <p className={styles.note}>
        <EyeOffIcon className={styles.noteIcon} aria-hidden="true" />
        {t("users.reset.once")}
      </p>
    </ResponsiveDialog>
  );
}

/** A temporary password in a box, ready to copy. */
function TemporaryPassword({
  password,
  copied,
  copyLabel,
  copiedLabel,
  onCopy,
}: {
  password: string;
  copied: boolean;
  copyLabel: string;
  copiedLabel: string;
  onCopy: () => void;
}) {
  return (
    <div className={styles.password}>
      <bdi dir="ltr" className={styles.value}>
        {password}
      </bdi>
      <Button
        variant="secondary"
        size="sm"
        iconStart={copied ? CheckIcon : CopyIcon}
        onClick={onCopy}
      >
        {copied ? copiedLabel : copyLabel}
      </Button>
    </div>
  );
}
