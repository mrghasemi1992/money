"use client";

import {
  AtSignIcon,
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  UserPlusIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { RadioGroup } from "@/components/ui/radio-group";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { LOCALE_NAMES, LOCALES } from "@/constants/locale";
import {
  DEFAULT_USER_ROLE,
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_ROLES,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/constants/user";
import { useClipboard } from "@/hooks/use-clipboard";
import { type NewUserError, newUserErrors } from "@/helpers/new-user";
import { toUserRole } from "@/helpers/role";
import type { ActionResult } from "@/types/action";
import type { Locale } from "@/types/locale";
import type { NewUserField, NewUserInput } from "@/types/user";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type NewUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A temporary password made on the server (the generatePassword Server Action). */
  onGeneratePassword: () => Promise<string>;
  /** Creates the user (the createUser Server Action). A taken username comes back on its field. */
  onCreate: (input: NewUserInput) => Promise<ActionResult<NewUserField>>;
};

type Errors = Partial<Record<NewUserField, string>>;

const FIELDS = ["name", "username", "password"] as const;

/** The inputs' names, which also find them to move focus to the first error. */
const FIELD_NAMES: Record<NewUserField, string> = {
  name: "display-name",
  username: "new-username",
  password: "temporary-password",
};

/**
 * Creates a user: display name, username, temporary password (made on the server, with a
 * button for a new one and a copy button), role and language. The password is shown only
 * here; give it to the person before creating the account.
 */
export function NewUserDialog({
  open,
  onOpenChange,
  onGeneratePassword,
  onCreate,
}: NewUserDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const { copied, copy } = useClipboard();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [generating, startGenerating] = useTransition();

  const blank = (): NewUserInput => ({
    name: "",
    username: "",
    password: "",
    role: DEFAULT_USER_ROLE,
    locale,
  });
  const [values, setValues] = useState<NewUserInput>(blank);
  const [errors, setErrors] = useState<Errors>({});

  // Each opening starts with an empty form, in the admin's own language.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(blank());
      setErrors({});
    }
  }

  function generate(replace: boolean) {
    startGenerating(async () => {
      let password: string;
      try {
        password = await onGeneratePassword();
      } catch {
        toast.show({ title: t("users.failed"), tone: "danger" });
        return;
      }
      setValues((current) =>
        replace || !current.password ? { ...current, password } : current,
      );
      setErrors((current) => ({ ...current, password: undefined }));
    });
  }

  // A fresh password each time the form opens, unless one was typed in the meantime.
  useEffect(() => {
    if (open) generate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the dialog opens
  }, [open]);

  function message(error: NewUserError, field: NewUserField): string {
    const min =
      field === "username" ? USERNAME_MIN_LENGTH : PASSWORD_MIN_LENGTH;
    const max =
      field === "name"
        ? DISPLAY_NAME_MAX_LENGTH
        : field === "username"
          ? USERNAME_MAX_LENGTH
          : PASSWORD_MAX_LENGTH;
    return t(`users.form.errors.${error}`, {
      min: formatNumber(min, locale),
      max: formatNumber(max, locale),
    });
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
    const found = newUserErrors(values);
    const translated: Errors = {};
    for (const field of FIELDS) {
      const error = found[field];
      if (error) translated[field] = message(error, field);
    }
    if (Object.keys(translated).length > 0) {
      showErrors(translated);
      return;
    }
    startTransition(async () => {
      let result: ActionResult<NewUserField>;
      try {
        result = await onCreate(values);
      } catch {
        result = { ok: false, error: t("users.failed") };
      }
      if (result.ok) {
        onOpenChange(false);
        toast.show({
          title: t("users.toasts.created", { name: values.name.trim() }),
          tone: "success",
        });
      } else if (result.field) {
        showErrors({ [result.field]: result.error });
      } else {
        toast.show({ title: result.error, tone: "danger" });
      }
    });
  }

  async function copyPassword() {
    if (!values.password) return;
    if (await copy(values.password)) {
      toast.show({ title: t("users.toasts.copied"), tone: "success" });
    } else {
      toast.show({ title: t("users.toasts.copyFailed"), tone: "warning" });
    }
  }

  function set<Key extends keyof NewUserInput>(
    key: Key,
    value: NewUserInput[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "name" || key === "username" || key === "password") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("users.form.title")}
      icon={UserPlusIcon}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {t("users.form.submit")}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <Field label={t("users.form.name")} required error={errors.name}>
          <TextField
            name={FIELD_NAMES.name}
            placeholder={t("users.form.namePlaceholder")}
            autoComplete="off"
            required
            value={values.name}
            readOnly={pending}
            onValueChange={(value) => set("name", value)}
          />
        </Field>
        <Field
          label={t("users.form.username")}
          required
          error={errors.username}
          hint={t("users.form.usernameHint")}
        >
          <TextField
            name={FIELD_NAMES.username}
            dir="ltr"
            iconStart={AtSignIcon}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            required
            value={values.username}
            readOnly={pending}
            onValueChange={(value) => set("username", value)}
          />
        </Field>
        <Field
          label={t("users.form.password")}
          required
          error={errors.password}
          hint={t("users.form.passwordHint")}
        >
          <div className={styles.passwordRow}>
            <TextField
              name={FIELD_NAMES.password}
              className={styles.password}
              dir="ltr"
              autoCapitalize="none"
              autoCorrect="off"
              // Not a password the admin should save: it is the other person's, for once.
              autoComplete="off"
              data-1p-ignore
              spellCheck={false}
              required
              value={values.password}
              readOnly={pending}
              onValueChange={(value) => set("password", value)}
            />
            <IconButton
              icon={RefreshCwIcon}
              label={t("users.form.generate")}
              variant="secondary"
              disabled={generating || pending}
              onClick={() => generate(true)}
            />
            <IconButton
              icon={copied ? CheckIcon : CopyIcon}
              label={t("users.form.copy")}
              variant="secondary"
              disabled={!values.password}
              onClick={copyPassword}
            />
          </div>
        </Field>
        <Field label={t("users.form.role")}>
          <RadioGroup
            value={values.role}
            disabled={pending}
            onValueChange={(value) => set("role", toUserRole(value))}
            options={USER_ROLES.map((role) => ({
              value: role,
              label: t(`role.${role}`),
              description: t(`users.roleDescriptions.${role}`),
            }))}
          />
        </Field>
        <Field
          label={t("users.form.language")}
          hint={t("users.form.languageHint")}
        >
          <SegmentedControl
            fullWidth
            value={values.locale}
            disabled={pending}
            onValueChange={(value) =>
              set(
                "locale",
                LOCALES.find((option) => option === value) ?? values.locale,
              )
            }
            options={LOCALES.map((option: Locale) => ({
              value: option,
              label: LOCALE_NAMES[option],
              lang: option,
            }))}
          />
        </Field>
      </form>
    </ResponsiveDialog>
  );
}
