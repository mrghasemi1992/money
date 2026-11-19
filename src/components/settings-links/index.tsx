import {
  ArrowDownUpIcon,
  ChevronRightIcon,
  type LucideIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import type { Route } from "next";
import { Link } from "@/components/ui/link";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

import styles from "./styles.module.css";

type SettingsLink = {
  href: Route;
  icon: LucideIcon;
  /** Message keys of the link's title and description. */
  title: "importExport.title" | "nav.users" | "connector.title";
  description:
    | "settings.data.importExport"
    | "settings.members.users"
    | "settings.assistants.connector";
};

type SettingsSection = {
  title:
    | "settings.data.title"
    | "settings.members.title"
    | "settings.assistants.title";
  links: SettingsLink[];
  /** Only admins see it. The page checks the role again with requireAdmin(). */
  adminOnly?: boolean;
};

const SECTIONS: SettingsSection[] = [
  {
    title: "settings.data.title",
    links: [
      {
        href: "/settings/import-export",
        icon: ArrowDownUpIcon,
        title: "importExport.title",
        description: "settings.data.importExport",
      },
    ],
  },
  {
    title: "settings.members.title",
    adminOnly: true,
    links: [
      {
        href: "/settings/users",
        icon: UsersIcon,
        title: "nav.users",
        description: "settings.members.users",
      },
    ],
  },
  {
    title: "settings.assistants.title",
    links: [
      {
        href: "/settings/connector",
        icon: SparklesIcon,
        title: "connector.title",
        description: "settings.assistants.connector",
      },
    ],
  },
];

type SettingsLinksProps = {
  /** Shows user management. The page decides this on the server. */
  isAdmin?: boolean;
};

/**
 * The /settings sections that lead to subpages: CSV import and export, user management (admins)
 * and the Claude and ChatGPT connector.
 */
export function SettingsLinks({ isAdmin = false }: SettingsLinksProps) {
  const t = useTranslations();
  return SECTIONS.filter((section) => !section.adminOnly || isAdmin).map(
    (section) => (
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
    ),
  );
}
