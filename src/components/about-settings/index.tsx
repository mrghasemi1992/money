"use client";

import { ArrowUpCircleIcon, ExternalLinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, use } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RELEASES_URL, UPDATE_GUIDE_URL } from "@/constants/release";
import type { AppVersion, UpdateCheck } from "@/types/release";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type AboutSettingsProps = {
  version: AppVersion;
  /**
   * Admins only: the comparison with the latest release on GitHub (checkForUpdate), streamed so
   * the page never waits for GitHub. Null when GitHub couldn't tell.
   */
  updateCheck?: Promise<UpdateCheck | null>;
};

/**
 * Settings section with the version this copy runs and its commit, links to the release notes
 * and the update guide, and for admins whether a newer version is out.
 */
export function AboutSettings({ version, updateCheck }: AboutSettingsProps) {
  const t = useTranslations();
  return (
    <Card
      title={t("settings.about.title", { app: t("metadata.appName") })}
      subtitle={t("settings.about.subtitle")}
    >
      <div className={styles.body}>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt className={styles.label}>{t("settings.about.version")}</dt>
            <dd className={styles.value}>
              <bdi dir="ltr">{version.version}</bdi>
            </dd>
          </div>
          {version.commit ? (
            <div className={styles.fact}>
              <dt className={styles.label}>{t("settings.about.commit")}</dt>
              <dd className={styles.value}>
                <code className={styles.commit} dir="ltr">
                  {version.commit}
                </code>
              </dd>
            </div>
          ) : null}
        </dl>

        {updateCheck ? (
          <Suspense fallback={null}>
            <UpdateStatus check={updateCheck} />
          </Suspense>
        ) : null}

        <div className={styles.links}>
          <Button
            href={RELEASES_URL}
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            size="sm"
            iconEnd={ExternalLinkIcon}
          >
            {t("settings.about.releaseNotes")}
          </Button>
          <Button
            href={UPDATE_GUIDE_URL}
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            size="sm"
            iconEnd={ExternalLinkIcon}
          >
            {t("settings.about.updateGuide")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** «نسخهٔ … منتشر شده است» with the release's notes, or «آخرین نسخه را دارید.» */
function UpdateStatus({ check }: { check: Promise<UpdateCheck | null> }) {
  const t = useTranslations("settings.about");
  const result = use(check);
  if (!result) return null;
  if (!result.available) {
    return <p className={styles.current}>{t("upToDate")}</p>;
  }
  return (
    <div className={styles.notice} role="status">
      <span className={styles.icon} aria-hidden="true">
        <ArrowUpCircleIcon className={styles.glyph} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>
          {t("updateTitle", { version: isolate(result.latest) })}
        </p>
        <p className={styles.description}>{t("updateDescription")}</p>
      </div>
      <Button
        href={result.url}
        target="_blank"
        rel="noreferrer"
        variant="secondary"
        size="sm"
        iconEnd={ExternalLinkIcon}
      >
        {t("whatsNew")}
      </Button>
    </div>
  );
}
