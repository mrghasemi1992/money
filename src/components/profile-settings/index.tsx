"use client";

import { LockIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { DISPLAY_NAME_MAX_LENGTH } from "@/constants/user";
import type { ActionResult } from "@/types/action";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type ProfileSettingsProps = {
  name: string;
  /** Shown read-only: usernames can't change. */
  username: string;
  /** Saves the display name (the updateProfile Server Action). */
  onSave: (input: { name: string }) => Promise<ActionResult>;
};

/** Settings section: the display name, and the username for reference. */
export function ProfileSettings({
  name,
  username,
  onSave,
}: ProfileSettingsProps) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const toast = useToast();
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError(t("profile.displayNameMissing"));
      return;
    }
    if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
      setError(
        t("profile.displayNameTooLong", {
          max: formatNumber(DISPLAY_NAME_MAX_LENGTH, locale),
        }),
      );
      return;
    }
    startTransition(async () => {
      let result: ActionResult;
      try {
        result = await onSave({ name: trimmed });
      } catch {
        result = { ok: false, error: t("failed") };
      }
      if (result.ok) {
        setValue(trimmed);
        toast.show({ title: t("profile.saved"), tone: "success" });
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card title={t("profile.title")} subtitle={t("profile.subtitle")}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <Field label={t("profile.displayName")} required error={error}>
            <TextField
              name="name"
              autoComplete="name"
              dir="auto"
              required
              value={value}
              onValueChange={(next) => {
                setValue(next);
                setError(null);
              }}
              readOnly={pending}
            />
          </Field>
          <Field label={t("profile.username")} hint={t("profile.usernameHint")}>
            <TextField value={username} readOnly dir="ltr" iconEnd={LockIcon} />
          </Field>
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="secondary" loading={pending}>
            {t("profile.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
