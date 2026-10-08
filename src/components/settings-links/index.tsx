import {
  ChevronRightIcon,
  LandmarkIcon,
  type LucideIcon,
  SparklesIcon,
  TagsIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

import styles from "./styles.module.css";

type SettingsLink = {
  href: Route;
  icon: LucideIcon;
  /** Message keys of the link's title and description. */
  title: "accounts.title" | "categories.title" | "connector.title";
  description:
    | "settings.data.accounts"
    | "settings.data.categories"
    | "settings.claude.connector";
};

const SECTIONS: {
  title: "settings.data.title" | "settings.claude.title";
  links: SettingsLink[];
}[] = [
  {
    title: "settings.data.title",
    links: [
      {
        href: "/settings/accounts",
        icon: LandmarkIcon,
        title: "accounts.title",
        description: "settings.data.accounts",
      },
      {
        href: "/settings/categories",
        icon: TagsIcon,
        title: "categories.title",
        description: "settings.data.categories",
      },
    ],
  },
  {
    title: "settings.claude.title",
    links: [
      {
        href: "/settings/connector",
        icon: SparklesIcon,
        title: "connector.title",
        description: "settings.claude.connector",
      },
    ],
  },
];

/**
 * The /settings sections that lead to subpages: the book's accounts and categories, and the
 * Claude connector.
 */
export function SettingsLinks() {
  const t = useTranslations();
  return SECTIONS.map((section) => (
    <Card key={section.title} title={t(section.title)} padding="none">
      <ul className={styles.list}>
        {section.links.map(({ href, icon: Icon, title, description }) => (
          <li key={href}>
            <Link href={href} className={styles.link}>
              <span className={styles.icon} aria-hidden="true">
                <Icon className={styles.iconGlyph} />
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{t(title)}</span>
                <span className={styles.description}>{t(description)}</span>
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
  ));
}
