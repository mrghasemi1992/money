"use client";

import {
  ArrowLeftRightIcon,
  CircleCheckIcon,
  CircleXIcon,
  ExternalLinkIcon,
  EyeIcon,
  LockIcon,
  type LucideIcon,
  PencilLineIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { LOGIN_PATH } from "@/constants/auth";
import { canWrite } from "@/helpers/role";
import { answerOAuthConsent, signOutForOAuth } from "@/helpers/oauth-consent";
import type { UserRole } from "@/types/user";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type ConsentStep = "consent" | "done" | "denied";

type ConnectorConsentProps = {
  /** The signed authorization request; null when it is missing, expired or not genuine. */
  request: {
    query: string;
    clientName: string;
    /** Where the answer goes: «claude.ai». */
    redirectHost: string;
  } | null;
  /** The signed-in user Claude would act as. */
  user: { name: string; username: string; role: UserRole };
  /** Starting step, for stories. */
  initialStep?: ConsentStep;
};

const PERMISSIONS: {
  key: "read" | "write" | "delete";
  icon: LucideIcon;
  writer: boolean;
}[] = [
  { key: "read", icon: EyeIcon, writer: false },
  { key: "write", icon: PencilLineIcon, writer: true },
  { key: "delete", icon: Trash2Icon, writer: true },
];

/**
 * The OAuth consent screen Claude's connector opens after sign-in: Money and Claude, who is
 * signed in, what Claude may do (it follows the user's role), and allow or deny. Allowing
 * returns to Claude; both answers end on a short result.
 */
export function ConnectorConsent({
  request,
  user,
  initialStep = "consent",
}: ConnectorConsentProps) {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<ConsentStep>(initialStep);
  const [busy, setBusy] = useState<"allow" | "deny" | "switch" | null>(null);
  const [failed, setFailed] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  if (!request) {
    return (
      <Shell>
        <Result
          tone="neutral"
          icon={CircleXIcon}
          title={t("connector.consent.invalidTitle")}
          description={t("connector.consent.invalidDescription")}
        />
      </Shell>
    );
  }

  const client = request.clientName;
  const writer = canWrite(user.role);

  async function answer(accept: boolean) {
    if (!request || busy) return;
    setBusy(accept ? "allow" : "deny");
    setFailed(false);
    const url = await answerOAuthConsent(accept, request.query);
    setBusy(null);
    if (!url) {
      setFailed(true);
      return;
    }
    setReturnUrl(url);
    setStep(accept ? "done" : "denied");
    // Back to Claude, which finishes connecting (or learns it was denied).
    if (accept) window.location.assign(url);
  }

  async function switchAccount() {
    if (!request || busy) return;
    setBusy("switch");
    await signOutForOAuth();
    router.replace(`${LOGIN_PATH}?${request.query}`);
  }

  if (step !== "consent") {
    const done = step === "done";
    return (
      <Shell>
        <Result
          tone={done ? "success" : "neutral"}
          icon={done ? CircleCheckIcon : CircleXIcon}
          title={t(
            done
              ? "connector.consent.doneTitle"
              : "connector.consent.deniedTitle",
          )}
          description={t(
            done
              ? "connector.consent.doneDescription"
              : "connector.consent.deniedDescription",
            { client },
          )}
          action={
            returnUrl ? (
              <Button
                variant="secondary"
                iconEnd={ExternalLinkIcon}
                href={returnUrl}
              >
                {t("connector.consent.back", { client })}
              </Button>
            ) : null
          }
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className={styles.marks} aria-hidden="true">
        <span className={styles.mark}>
          <LogoMark size="xl" className={styles.logo} />
          <span className={styles.markName}>{t("metadata.appName")}</span>
        </span>
        <span className={styles.link}>
          <span className={styles.linkLine} />
          <span className={styles.linkIcon}>
            <ArrowLeftRightIcon className={styles.linkGlyph} />
          </span>
          <span className={styles.linkLine} />
        </span>
        <span className={styles.mark}>
          <span className={styles.clientMark}>
            <SparklesIcon className={styles.clientGlyph} />
          </span>
          <span className={styles.markName}>{client}</span>
        </span>
      </div>

      <h1 className={styles.title}>
        {t("connector.consent.title", { client })}
      </h1>

      <div className={styles.account}>
        <Avatar name={user.name} size="md" />
        <span className={styles.accountText}>
          <span className={styles.accountName}>{user.name}</span>
          <bdi dir="ltr" className={styles.accountUsername}>
            {user.username}
          </bdi>
        </span>
        <button
          type="button"
          className={styles.switch}
          onClick={switchAccount}
          disabled={busy !== null}
        >
          {t("connector.consent.switchAccount")}
        </button>
      </div>

      <section className={styles.permissions}>
        <div className={styles.permissionsHead}>
          <h2 className={styles.canDo}>
            {t("connector.consent.canDo", { client })}
          </h2>
          <Badge size="sm" icon={UserRoundIcon}>
            {t("connector.consent.yourRole", { role: t(`role.${user.role}`) })}
          </Badge>
        </div>
        <ul className={styles.list}>
          {PERMISSIONS.filter((permission) => writer || !permission.writer).map(
            ({ key, icon: Icon }) => (
              <li key={key} className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">
                  <Icon className={styles.itemGlyph} />
                </span>
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>
                    {t(`connector.consent.${key}`)}
                  </span>
                  <span className={styles.itemDescription}>
                    {t(`connector.consent.${key}Description`)}
                  </span>
                </span>
              </li>
            ),
          )}
        </ul>
        {writer ? null : (
          <p className={styles.viewerNote}>
            <LockIcon className={styles.noteGlyph} aria-hidden="true" />
            <span>{t("connector.consent.viewerNote", { client })}</span>
          </p>
        )}
      </section>

      <div className={styles.answer}>
        <div className={styles.buttons}>
          <Button
            variant="secondary"
            size="lg"
            loading={busy === "deny"}
            disabled={busy !== null && busy !== "deny"}
            onClick={() => answer(false)}
            className={styles.button}
          >
            {t("connector.consent.deny")}
          </Button>
          <Button
            size="lg"
            loading={busy === "allow"}
            disabled={busy !== null && busy !== "allow"}
            onClick={() => answer(true)}
            className={styles.button}
          >
            {t("connector.consent.allow")}
          </Button>
        </div>
        {failed ? (
          <p role="alert" className={styles.failed}>
            {t("connector.consent.failed")}
          </p>
        ) : null}
        <p className={styles.redirect}>
          {t("connector.consent.redirect", { host: request.redirectHost })}
        </p>
      </div>

      <p className={styles.footNote}>
        <ShieldCheckIcon className={styles.noteGlyph} aria-hidden="true" />
        <span>{t("connector.consent.footNote")}</span>
      </p>
    </Shell>
  );
}

/** The page and its centered card. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.root}>
      <div className={styles.card}>{children}</div>
    </main>
  );
}

function Result({
  tone,
  icon: Icon,
  title,
  description,
  action,
}: {
  tone: "success" | "neutral";
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.result}>
      <span className={cx(styles.resultIcon, styles[tone])} aria-hidden="true">
        <Icon className={styles.resultGlyph} />
      </span>
      <div className={styles.resultText}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.resultDescription}>{description}</p>
      </div>
      {action}
    </div>
  );
}
