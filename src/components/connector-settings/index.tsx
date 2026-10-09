"use client";

import {
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  InfoIcon,
  LinkIcon,
  type LucideIcon,
  MessagesSquareIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UnplugIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState, useTransition } from "react";

import { PageHeader } from "@/components/page-header";
import { ListError } from "@/components/page-status";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateText } from "@/components/ui/date-text";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { canWrite } from "@/helpers/role";
import { useClipboard } from "@/hooks/use-clipboard";
import type { ActionResult } from "@/types/action";
import type { UserRole } from "@/types/user";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

/** A connected app as the page shows it, with days in the viewer's time zone. */
export type ConnectedApp = {
  clientId: string;
  name: string;
  /** ISO dates. */
  connectedOn: string;
  lastUsedOn: string | null;
};

type ConnectorSettingsProps = {
  /** The MCP endpoint's URL, what users paste into Claude. */
  url: string;
  /** The viewer's role: what Claude may do with the connection follows it. */
  role: UserRole;
  apps: ConnectedApp[];
  onRevoke: (input: { clientId: string }) => Promise<ActionResult>;
};

const STEPS = ["one", "two", "three", "four"] as const;

type ExampleKey =
  "sms" | "groceries" | "transfer" | "restaurants" | "unknown" | "compare";

const EXAMPLES: {
  key: "record" | "ask";
  icon: LucideIcon;
  items: { text: ExampleKey; hint?: "smsHint" }[];
}[] = [
  {
    key: "record",
    icon: PlusIcon,
    items: [
      { text: "sms", hint: "smsHint" },
      { text: "groceries" },
      { text: "transfer" },
    ],
  },
  {
    key: "ask",
    icon: MessagesSquareIcon,
    items: [{ text: "restaurants" }, { text: "unknown" }, { text: "compare" }],
  },
];

/**
 * The /settings/connector page: the connector URL to add in Claude with the steps, the apps
 * connected to the viewer's account (revoke, with a confirmation), and things to say to
 * Claude. Every role may connect; what Claude may do follows the role.
 */
export function ConnectorSettings({
  url,
  role,
  apps,
  onRevoke,
}: ConnectorSettingsProps) {
  const t = useTranslations("connector");
  const toast = useToast();
  const [target, setTarget] = useState<ConnectedApp | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmRevoke() {
    if (!target) return;
    const app = target;
    startTransition(async () => {
      const result = await onRevoke({ clientId: app.clientId });
      if (!result.ok) {
        toast.show({ title: result.error, tone: "danger" });
        return;
      }
      setOpen(false);
      toast.show({
        title: t("revoke.done", { name: app.name }),
        tone: "success",
      });
    });
  }

  return (
    <div className={styles.root}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className={styles.columns}>
        <div className={styles.main}>
          <UrlCard url={url} />

          <Card
            title={t("apps.title")}
            subtitle={t("apps.subtitle")}
            padding="none"
            as="section"
          >
            {apps.length === 0 ? (
              <EmptyState
                size="sm"
                icon={UnplugIcon}
                title={t("apps.emptyTitle")}
                description={t("apps.emptyDescription")}
                className={styles.empty}
              />
            ) : (
              <ul className={styles.apps}>
                {apps.map((app) => (
                  <AppRow
                    key={app.clientId}
                    app={app}
                    role={role}
                    onRevoke={() => {
                      setTarget(app);
                      setOpen(true);
                    }}
                  />
                ))}
              </ul>
            )}
            <p className={styles.roleNote}>
              <InfoIcon className={styles.noteGlyph} aria-hidden="true" />
              <span>{t(`apps.role.${role}`)}</span>
            </p>
          </Card>
        </div>

        <div className={styles.side}>
          <ExamplesCard />
        </div>
      </div>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        title={t("revoke.title", { name: target?.name ?? "" })}
        description={t("revoke.description")}
        icon={UnplugIcon}
        confirmLabel={t("apps.revoke")}
        pending={pending}
        onConfirm={confirmRevoke}
      />
    </div>
  );
}

function UrlCard({ url }: { url: string }) {
  const t = useTranslations("connector");
  const { copied, copy } = useClipboard();
  return (
    <Card title={t("url.title")} subtitle={t("url.subtitle")} as="section">
      <div className={styles.urlSection}>
        <div className={styles.urlRow}>
          <div className={styles.url} dir="ltr">
            <LinkIcon className={styles.urlIcon} aria-hidden="true" />
            <span className={styles.urlText}>{url}</span>
          </div>
          <Button
            variant="secondary"
            iconStart={copied ? CheckIcon : CopyIcon}
            aria-label={t("url.copyLabel")}
            onClick={() => copy(url)}
          >
            <span aria-live="polite">
              {copied ? t("url.copied") : t("url.copy")}
            </span>
          </Button>
        </div>
        <p className={styles.hint}>
          <ShieldCheckIcon className={styles.noteGlyph} aria-hidden="true" />
          <span>{t("url.hint")}</span>
        </p>
      </div>

      <StepList group="steps" />
      <StepList group="chatgptSteps" />
    </Card>
  );
}

function StepList({ group }: { group: "steps" | "chatgptSteps" }) {
  const t = useTranslations("connector");
  const locale = useLocale();
  return (
    <div className={styles.steps}>
      <h3 className={styles.stepsTitle}>{t(`${group}.title`)}</h3>
      <ol className={styles.stepList}>
        {STEPS.map((step, index) => (
          <li key={step} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {formatNumber(index + 1, locale)}
            </span>
            <p className={styles.stepText}>
              {t.rich(`${group}.${step}`, {
                path: (chunks: ReactNode) => (
                  <span className={styles.path}>{chunks}</span>
                ),
                chip: (chunks: ReactNode) => (
                  <bdi dir="ltr" lang="en" className={styles.chip}>
                    {chunks}
                  </bdi>
                ),
                sep: () => (
                  <ChevronRightIcon
                    className={`${styles.separator} mirror-rtl`}
                    aria-label="›"
                  />
                ),
              })}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AppRow({
  app,
  role,
  onRevoke,
}: {
  app: ConnectedApp;
  role: UserRole;
  onRevoke: () => void;
}) {
  const t = useTranslations("connector.apps");
  const writer = canWrite(role);
  return (
    <li className={styles.app}>
      <span className={styles.appIcon} aria-hidden="true">
        <SparklesIcon className={styles.appGlyph} />
      </span>
      <div className={styles.appText}>
        <div className={styles.appTitle}>
          <span className={styles.appName}>{app.name}</span>
          <Badge size="sm" tone={writer ? "brand" : "neutral"}>
            {writer ? t("write") : t("read")}
          </Badge>
        </div>
        <span className={styles.appMeta}>
          {t.rich("connected", {
            date: () => <DateText value={app.connectedOn} />,
          })}
        </span>
        <span className={styles.appMeta}>
          {app.lastUsedOn
            ? t.rich("lastUsed", {
                date: () => <DateText value={app.lastUsedOn ?? ""} relative />,
              })
            : t("neverUsed")}
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        iconStart={UnplugIcon}
        onClick={onRevoke}
        className={styles.revoke}
      >
        {t("revoke")}
      </Button>
    </li>
  );
}

function ExamplesCard() {
  const t = useTranslations("connector.examples");
  return (
    <Card title={t("title")} subtitle={t("subtitle")} as="section">
      <div className={styles.examples}>
        {EXAMPLES.map(({ key, icon: Icon, items }) => (
          <div key={key} className={styles.exampleGroup}>
            <h3 className={styles.exampleLabel}>
              <Icon className={styles.exampleIcon} aria-hidden="true" />
              {t(key)}
            </h3>
            <ul className={styles.bubbles}>
              {items.map((item) => (
                <li key={item.text} className={styles.bubbleItem}>
                  <span className={styles.bubble}>{t(item.text)}</span>
                  {item.hint ? (
                    <span className={styles.bubbleHint}>{t(item.hint)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className={styles.badgeNote}>
          <span>{t("badgeBefore")}</span>
          <Badge tone="brand" size="sm" icon={SparklesIcon}>
            Claude
          </Badge>
          <span>{t("badgeAfter")}</span>
        </p>
      </div>
    </Card>
  );
}

/** The page while it loads (loading.tsx). */
export function ConnectorSettingsSkeleton() {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("connector.title")}
        subtitle={t("connector.subtitle")}
      />
      <div role="status" aria-busy="true" className={styles.columns}>
        <span className="visually-hidden">{t("page.loading")}</span>
        <div className={styles.main}>
          <Card padding="lg">
            <div className={styles.skeletonStack}>
              <Skeleton width="120px" height="16px" />
              <Skeleton width="100%" height="var(--control-h-md)" />
              <Skeleton width="70%" height="12px" />
            </div>
          </Card>
          <Card padding="none">
            {["120px", "100px"].map((width, index) => (
              <div key={index} className={styles.skeletonRow}>
                <Skeleton variant="circle" width="var(--connector-app-icon)" />
                <div className={styles.skeletonStack}>
                  <Skeleton width={width} height="14px" />
                  <Skeleton width="140px" height="12px" />
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div className={styles.side}>
          <Card padding="lg">
            <div className={styles.skeletonStack}>
              <Skeleton width="140px" height="16px" />
              <Skeleton width="90%" height="36px" />
              <Skeleton width="80%" height="36px" />
              <Skeleton width="85%" height="36px" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** The connected apps didn't load (error.tsx): the page's header and a retry. */
export function ConnectorSettingsError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("connector");
  return (
    <div className={styles.root}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ListError title={t("error")} onRetry={onRetry} />
    </div>
  );
}
