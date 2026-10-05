"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/constants/user";
import type { ActionResult } from "@/types/action";
import type { PasswordField } from "@/types/user";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type PasswordSettingsProps = {
  /** The signed-in user's username, for password managers. */
  username: string;
  /**
   * Changes the password and signs out every other session (the changePassword Server
   * Action). A wrong current password comes back as an error on the `current` field.
   */
  onChange: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<ActionResult<PasswordField>>;
};

type Errors = Partial<Record<PasswordField, string>>;

const FIELDS = ["current", "new", "repeat"] as const satisfies PasswordField[];

/** The inputs' names, which also find them to move focus to the first error. */
const FIELD_NAMES: Record<PasswordField, string> = {
  current: "current-password",
  new: "new-password",
  repeat: "repeat-password",
};

/** Settings section: change the password with the current one, the new one and a repeat. */
export function PasswordSettings({
  username,
  onChange,
}: PasswordSettingsProps) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const toast = useToast();
  const [values, setValues] = useState({ current: "", new: "", repeat: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const min = formatNumber(PASSWORD_MIN_LENGTH, locale);

  function validate(): Errors {
    const found: Errors = {};
    if (!values.current) found.current = t("password.currentMissing");
    if (values.new.length < PASSWORD_MIN_LENGTH) {
      found.new = t("password.newTooShort", { min });
    } else if (values.new.length > PASSWORD_MAX_LENGTH) {
      found.new = t("password.newTooLong", {
        max: formatNumber(PASSWORD_MAX_LENGTH, locale),
      });
    } else if (values.new === values.current) {
      found.new = t("password.newSame");
    }
    if (!found.new && values.repeat !== values.new) {
      found.repeat = t("password.repeatMismatch");
    }
    return found;
  }

  function showErrors(found: Errors) {
    setErrors(found);
    const first = FIELDS.find((field) => found[field]);
    if (!first) return;
    formRef.current
      ?.querySelector<HTMLInputElement>(`[name="${FIELD_NAMES[first]}"]`)
      ?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }
    startTransition(async () => {
      let result: ActionResult<PasswordField>;
      try {
        result = await onChange({
          currentPassword: values.current,
          newPassword: values.new,
        });
      } catch {
        result = { ok: false, error: t("failed") };
      }
      if (result.ok) {
        setValues({ current: "", new: "", repeat: "" });
        setErrors({});
        toast.show({ title: t("password.changed"), tone: "success" });
      } else if (result.field) {
        showErrors({ [result.field]: result.error });
      } else {
        toast.show({ title: result.error, tone: "danger" });
      }
    });
  }

  function fieldProps(field: PasswordField) {
    return {
      name: FIELD_NAMES[field],
      type: "password",
      dir: "ltr",
      autoCapitalize: "none",
      autoCorrect: "off",
      spellCheck: false,
      required: true,
      value: values[field],
      readOnly: pending,
      onValueChange: (next: string) => {
        setValues((current) => ({ ...current, [field]: next }));
        setErrors((current) => ({ ...current, [field]: undefined }));
      },
    } as const;
  }

  return (
    <Card title={t("password.title")} subtitle={t("password.subtitle")}>
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Lets password managers save the new password for the right account. */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={username}
          hidden
          readOnly
        />
        <Field
          label={t("password.current")}
          required
          error={errors.current}
          className={styles.current}
        >
          <TextField
            {...fieldProps("current")}
            autoComplete="current-password"
          />
        </Field>
        <div className={styles.fields}>
          <Field
            label={t("password.new")}
            required
            error={errors.new}
            hint={t("password.newHint", { min })}
          >
            <TextField {...fieldProps("new")} autoComplete="new-password" />
          </Field>
          <Field label={t("password.repeat")} required error={errors.repeat}>
            <TextField {...fieldProps("repeat")} autoComplete="new-password" />
          </Field>
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="secondary" loading={pending}>
            {t("password.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
