"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  TimerIcon,
  UserRoundXIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { LogoMark } from "@/components/ui/logo-mark";
import { TextField } from "@/components/ui/text-field";
import { signInWithUsername } from "@/helpers/sign-in";
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
  /** Starting state, for stories. */
  initialState?: Partial<LoginState>;
};

/** The sign-in screen: a centered card on larger screens, the whole screen on phones. */
export function Login({ returnTo = "/", initialState }: LoginProps) {
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
          <h1 className={styles.title}>ورود به پول</h1>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {visibleAlert ? (
            <Alert alert={visibleAlert} lockSeconds={lockSeconds} />
          ) : null}

          <Field
            label="نام کاربری"
            error={missing.username ? "نام کاربری را وارد کنید." : undefined}
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
            label="رمز عبور"
            error={missing.password ? "رمز عبور را وارد کنید." : undefined}
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
                  label="نمایش رمز عبور"
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
            ورود
          </Button>
        </form>
      </div>
      <div className={cx(styles.spacer, styles.spacerEnd)} aria-hidden="true" />
      <p className={styles.note}>
        ایجاد حساب کاربری فقط توسط مدیر امکان‌پذیر است؛ برای دسترسی با مدیر
        هماهنگ کنید.
      </p>
    </main>
  );
}

const ALERTS = {
  wrong: {
    tone: "danger",
    icon: CircleAlertIcon,
    text: "نام کاربری یا رمز عبور درست نیست.",
  },
  disabled: {
    tone: "warning",
    icon: UserRoundXIcon,
    text: "این حساب غیرفعال شده است. برای فعال‌سازی با مدیر تماس بگیرید.",
  },
  locked: {
    tone: "warning",
    icon: TimerIcon,
    text: "چند بار پشت سر هم ورود ناموفق بود. برای امنیت حساب، ورود موقتاً بسته شده است.",
  },
  failed: {
    tone: "danger",
    icon: CircleAlertIcon,
    text: "ورود انجام نشد. اتصال اینترنت را بررسی کنید و دوباره امتحان کنید.",
  },
  success: { tone: "success", icon: CircleCheckIcon, text: "وارد شدید." },
} as const;

function Alert({
  alert,
  lockSeconds,
}: {
  alert: LoginAlert;
  lockSeconds: number;
}) {
  const { tone, icon: Icon, text } = ALERTS[alert];
  return (
    <div className={cx(styles.alert, styles[tone])}>
      <Icon className={styles.alertIcon} aria-hidden="true" />
      <div className={styles.alertBody}>
        <p role={alert === "success" ? "status" : "alert"}>{text}</p>
        {alert === "locked" ? (
          // Outside the live region, so screen readers don't read every tick.
          <p className={styles.alertDetail}>
            دوباره امتحان کنید پس از{" "}
            <bdi dir="ltr" className={cx(styles.countdown, "tabular")}>
              {formatCountdown(lockSeconds)}
            </bdi>
          </p>
        ) : null}
      </div>
    </div>
  );
}
