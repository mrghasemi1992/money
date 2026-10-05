"use client";

import {
  ArrowLeftIcon,
  CircleAlertIcon,
  RotateCwIcon,
  SearchXIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import styles from "./styles.module.css";

/** A page that failed to load (error.tsx), with one way to recover. */
export function PageError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("page.error");
  return (
    <div className={styles.root} role="alert">
      <EmptyState
        icon={CircleAlertIcon}
        tone="danger"
        title={t("title")}
        description={t("description")}
        action={
          <Button iconStart={RotateCwIcon} onClick={onRetry}>
            {t("retry")}
          </Button>
        }
      />
    </div>
  );
}

/** A page that doesn't exist, or that the viewer's role can't open (not-found.tsx). */
export function PageNotFound() {
  const t = useTranslations("page.notFound");
  return (
    <div className={styles.root}>
      <EmptyState
        icon={SearchXIcon}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Button href="/" iconStart={ArrowLeftIcon} mirrorIcons>
            {t("backHome")}
          </Button>
        }
      />
    </div>
  );
}
