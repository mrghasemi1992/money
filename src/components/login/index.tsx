"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LanguagesIcon,
  TimerIcon,
  UserRoundXIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { LogoMark } from "@/components/ui/logo-mark";
import { TextField } from "@/components/ui/text-field";
import { LOCALE_NAMES, LOCALES } from "@/constants/locale";
import { signInWithUsername } from "@/helpers/sign-in";
import type { Locale } from "@/types/locale";
import { cx } from "@/utils/cx";
import { formatCountdown } from "@/utils/duration";

import styles from "./styles.module.css";

export type LoginAlert = "wrong" | "disabled" | "locked" | "failed" | "success";

export type LoginState = {
  username: string;
  password: string;
  alert: LoginAlert | null;
  /** Seconds until sign-in opens again after too many attempts. */
  lockSeconds: number;
  busy: boolean;
};

type LoginProps = {
  /** A path on this site to go to after signing in. Already checked by the page. */
  returnTo?: string;
  /** Switches the interface language (the changeLocale Server Action). Without it, no switch is shown. */
  onChangeLocale?: (locale: Locale) => Promise<void>;
  /** Starting state, for stories. */
  initialState?: Partial<LoginState>;
};

/** The sign-in screen: a centered card on larger screens, the whole screen on phones. */
export function Login({
  returnTo = "/",
  onChangeLocale,
  initialState,
}: LoginProps) {
  const t = useTranslations("login");
  const router = useRouter();
  const [username, setUsername] = useState(initialState?.username ?? "");
  const [password, setPassword] = useState(initialState?.password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(initialState?.busy ?? false);
  const [alert, setAlert] = useState(initialState?.alert ?? null);
  const [lockSeconds, setLockSeconds] = useState(
    initialState?.lockSeconds ?? 0,
  );
  const [missing, setMissing] = useState({ username: false, password: false });
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const locked = lockSeconds > 0;
  // The lock message goes away by itself when the countdown ends.
  const visibleAlert = alert === "locked" && !locked ? null : alert;

  useEffect(() => {
    if (!locked) return;
    const timer = setTimeout(() => setLockSeconds((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [locked, lockSeconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || locked) return;

    const name = username.trim();
    const nextMissing = { username: !name, password: !password };
    if (nextMissing.username || nextMissing.password) {
      setMissing(nextMissing);
      (nextMissing.username ? usernameRef : passwordRef).current?.focus();
      return;
    }

    setMissing({ username: false, password: false });
    setAlert(null);
    setBusy(true);
    const result = await signInWithUsername(name, password);

    if (result.status === "success") {
      // Stay busy until the next page replaces this one.
      setAlert("success");
      router.replace(returnTo);
      return;
    }

    setBusy(false);
    setAlert(result.status);
    if (result.status === "failed") return;
    setPassword("");
    if (result.status === "locked") setLockSeconds(result.retryAfter);
    else passwordRef.current?.focus();
  }

  return (
    <main className={styles.root}>
      <div className={styles.spacer} aria-hidden="true" />
      <div className={styles.panel}>
        <header className={styles.header}>
          <LogoMark size="lg" className={styles.logo} />
          <h1 className={styles.title}>{t("title")}</h1>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {visibleAlert ? (
            <Alert alert={visibleAlert} lockSeconds={lockSeconds} />
          ) : null}

          <Field
            label={t("username")}
            error={missing.username ? t("usernameMissing") : undefined}
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
              value={username}
              onValueChange={(value) => {
                setUsername(value);
                setMissing((current) => ({ ...current, username: false }));
              }}
              readOnly={busy}
            />
          </Field>

          <Field
            label={t("password")}
            error={missing.password ? t("passwordMissing") : undefined}
          >
            <div className={styles.password}>
              <TextField
                ref={passwordRef}
                name="password"
                type={showPassword ? "text" : "password"}
                size="lg"
                dir="ltr"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                value={password}
                onValueChange={(value) => {
                  setPassword(value);
                  setMissing((current) => ({ ...current, password: false }));
                }}
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
            disabled={locked}
            className={styles.submit}
          >
            {t("submit")}
          </Button>
        </form>
      </div>
      <div className={cx(styles.spacer, styles.spacerEnd)} aria-hidden="true" />
      <footer className={styles.footer}>
        <p className={styles.note}>{t("note")}</p>
        {onChangeLocale ? <LanguageSwitch onChange={onChangeLocale} /> : null}
      </footer>
    </main>
  );
}

/** Offers the other language, written in that language. */
function LanguageSwitch({
  onChange,
}: {
  onChange: (locale: Locale) => Promise<void>;
}) {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const other = LOCALES.find((candidate) => candidate !== locale) ?? locale;
  return (
    <Button
      variant="ghost"
      size="sm"
      iconStart={LanguagesIcon}
      lang={other}
      loading={pending}
      onClick={() => startTransition(() => onChange(other))}
    >
      {LOCALE_NAMES[other]}
    </Button>
  );
}

const ALERTS = {
  wrong: { tone: "danger", icon: CircleAlertIcon },
  disabled: { tone: "warning", icon: UserRoundXIcon },
  locked: { tone: "warning", icon: TimerIcon },
  failed: { tone: "danger", icon: CircleAlertIcon },
  success: { tone: "success", icon: CircleCheckIcon },
} as const;

function Alert({
  alert,
  lockSeconds,
}: {
  alert: LoginAlert;
  lockSeconds: number;
}) {
  const t = useTranslations("login");
  const locale = useLocale();
  const { tone, icon: Icon } = ALERTS[alert];
  return (
    <div className={cx(styles.alert, styles[tone])}>
      <Icon className={styles.alertIcon} aria-hidden="true" />
      <div className={styles.alertBody}>
        <p role={alert === "success" ? "status" : "alert"}>
          {t(`alerts.${alert}`)}
        </p>
        {alert === "locked" ? (
          // Outside the live region, so screen readers don't read every tick.
          <p className={styles.alertDetail}>
            {t("retryIn")}{" "}
            <bdi dir="ltr" className={cx(styles.countdown, "tabular")}>
              {formatCountdown(lockSeconds, locale)}
            </bdi>
          </p>
        ) : null}
      </div>
    </div>
  );
}
