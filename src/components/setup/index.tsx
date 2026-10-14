"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useRef, useState } from "react";

import { LanguageSwitch } from "@/components/login";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { LogoMark } from "@/components/ui/logo-mark";
import { TextField } from "@/components/ui/text-field";
import { LOGIN_PATH } from "@/constants/auth";
import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/constants/user";
import {
  FIRST_ADMIN_FIELDS,
  type FirstAdminError,
  firstAdminErrors,
  type FirstAdminInput,
} from "@/helpers/first-admin";
import { signInWithUsername } from "@/helpers/sign-in";
import type { ActionResult } from "@/types/action";
import type { Locale } from "@/types/locale";
import type { FirstAdminField } from "@/types/user";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

/** A message above the form: a failure that belongs to no field, or the account being made. */
export type SetupAlert =
  { tone: "danger"; text: string } | { tone: "success"; text: string };

export type SetupState = FirstAdminInput & {
  /** Errors shown under the fields (already translated). */
  errors: Partial<Record<FirstAdminField, string>>;
  alert: SetupAlert | null;
  busy: boolean;
};

type SetupProps = {
  /** Creates the first admin (the createFirstAdmin Server Action). */
  onCreate: (input: FirstAdminInput) => Promise<ActionResult<FirstAdminField>>;
  /** Switches the interface language (the changeLocale Server Action). */
  onChangeLocale?: (locale: Locale) => Promise<void>;
  /** Starting state, for stories. */
  initialState?: Partial<SetupState>;
};

/**
 * The first-run screen of a new copy (/setup): the setup code, then the first admin's name,
 * username and password. After creating the account it signs in and opens the dashboard. Laid
 * out like the sign-in screen.
 */
export function Setup({ onCreate, onChangeLocale, initialState }: SetupProps) {
  const t = useTranslations("setup");
  const locale = useLocale();
  const router = useRouter();
  const [values, setValues] = useState<FirstAdminInput>({
    code: initialState?.code ?? "",
    name: initialState?.name ?? "",
    username: initialState?.username ?? "",
    password: initialState?.password ?? "",
  });
  const [errors, setErrors] = useState(initialState?.errors ?? {});
  const [alert, setAlert] = useState(initialState?.alert ?? null);
  const [busy, setBusy] = useState(initialState?.busy ?? false);
  const [showPassword, setShowPassword] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function focus(field: FirstAdminField) {
    const refs = {
      code: codeRef,
      name: nameRef,
      username: usernameRef,
      password: passwordRef,
    };
    refs[field].current?.focus();
  }

  function message(field: FirstAdminField, error: FirstAdminError): string {
    return t(`errors.${error}`, {
      min: formatNumber(
        field === "username" ? USERNAME_MIN_LENGTH : PASSWORD_MIN_LENGTH,
        locale,
      ),
      max: formatNumber(
        field === "name"
          ? DISPLAY_NAME_MAX_LENGTH
          : field === "username"
            ? USERNAME_MAX_LENGTH
            : PASSWORD_MAX_LENGTH,
        locale,
      ),
    });
  }

  function change(field: FirstAdminField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const found = firstAdminErrors(values);
    const first = FIRST_ADMIN_FIELDS.find((field) => found[field]);
    if (first) {
      const next: Partial<Record<FirstAdminField, string>> = {};
      for (const field of FIRST_ADMIN_FIELDS) {
        const error = found[field];
        if (error) next[field] = message(field, error);
      }
      setErrors(next);
      focus(first);
      return;
    }

    setErrors({});
    setAlert(null);
    setBusy(true);
    let result: ActionResult<FirstAdminField>;
    try {
      result = await onCreate(values);
    } catch {
      result = { ok: false, error: t("errors.failed") };
    }

    // The action sends the browser to the sign-in page when the book already has users.
    if (!result) return;
    if (!result.ok) {
      setBusy(false);
      if (result.field) {
        setErrors({ [result.field]: result.error });
        focus(result.field);
      } else {
        setAlert({ tone: "danger", text: result.error });
      }
      return;
    }

    // Stay busy until the dashboard replaces this page.
    setAlert({ tone: "success", text: t("created") });
    const signIn = await signInWithUsername(
      values.username.trim(),
      values.password,
    );
    router.replace(signIn.status === "success" ? "/" : LOGIN_PATH);
  }

  return (
    <main className={styles.root}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <LogoMark size="lg" />
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {alert ? (
            <div className={cx(styles.alert, styles[alert.tone])}>
              {alert.tone === "success" ? (
                <CircleCheckIcon className={styles.alertIcon} aria-hidden />
              ) : (
                <CircleAlertIcon className={styles.alertIcon} aria-hidden />
              )}
              <p role={alert.tone === "success" ? "status" : "alert"}>
                {alert.text}
              </p>
            </div>
          ) : null}

          <Field label={t("code")} hint={t("codeHint")} error={errors.code}>
            <TextField
              ref={codeRef}
              name="code"
              size="lg"
              dir="ltr"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              value={values.code}
              onValueChange={(value) => change("code", value)}
              readOnly={busy}
            />
          </Field>

          <Field label={t("name")} error={errors.name}>
            <TextField
              ref={nameRef}
              name="name"
              size="lg"
              autoComplete="name"
              enterKeyHint="next"
              placeholder={t("namePlaceholder")}
              value={values.name}
              onValueChange={(value) => change("name", value)}
              readOnly={busy}
            />
          </Field>

          <Field
            label={t("username")}
            hint={t("usernameHint")}
            error={errors.username}
          >
            <TextField
              ref={usernameRef}
              name="username"
              size="lg"
              dir="ltr"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              value={values.username}
              onValueChange={(value) => change("username", value)}
              readOnly={busy}
            />
          </Field>

          <Field
            label={t("password")}
            hint={t("passwordHint", {
              min: formatNumber(PASSWORD_MIN_LENGTH, locale),
            })}
            error={errors.password}
          >
            <div className={styles.password}>
              <TextField
                ref={passwordRef}
                name="password"
                type={showPassword ? "text" : "password"}
                size="lg"
                dir="ltr"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                value={values.password}
                onValueChange={(value) => change("password", value)}
                readOnly={busy}
                className={styles.passwordInput}
              />
              <span className={styles.toggle}>
                <IconButton
                  icon={showPassword ? EyeOffIcon : EyeIcon}
                  label={t("showPassword")}
                  aria-pressed={showPassword}
                  tooltip={false}
                  onClick={() => setShowPassword((shown) => !shown)}
                />
              </span>
            </div>
          </Field>

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={busy}
            className={styles.submit}
          >
            {t("submit")}
          </Button>
        </form>
      </div>
      {onChangeLocale ? (
        <footer className={styles.footer}>
          <LanguageSwitch onChange={onChangeLocale} />
        </footer>
      ) : null}
    </main>
  );
}
