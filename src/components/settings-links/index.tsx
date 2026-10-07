import {
  ChevronRightIcon,
  LandmarkIcon,
  TagsIcon,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

import styles from "./styles.module.css";

const LINKS: {
  href: Route;
  icon: LucideIcon;
  key: "accounts" | "categories";
}[] = [
  { href: "/settings/accounts", icon: LandmarkIcon, key: "accounts" },
  { href: "/settings/categories", icon: TagsIcon, key: "categories" },
];

/** The settings section that leads to the book's accounts and categories pages. */
export function SettingsLinks() {
  const t = useTranslations();
  return (
    <Card title={t("settings.data.title")} padding="none">
      <ul className={styles.list}>
        {LINKS.map(({ href, icon: Icon, key }) => (
          <li key={key}>
            <Link href={href} className={styles.link}>
              <span className={styles.icon} aria-hidden="true">
                <Icon className={styles.iconGlyph} />
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{t(`${key}.title`)}</span>
                <span className={styles.description}>
                  {t(`settings.data.${key}`)}
                </span>
              </span>
              <ChevronRightIcon
                className={`${styles.chevron} mirror-rtl`}
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
