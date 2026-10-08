"use client";

import {
  ArrowRightIcon,
  CircleCheckIcon,
  PlusIcon,
  TagIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Select, type SelectOption } from "@/components/ui/select";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import type { ImportMatch, ImportMatches, UnknownName } from "@/types/csv";
import type { TransactionOptions } from "@/types/transaction";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type ImportMatchingProps = {
  /** Account and category names of the file the book doesn't have. */
  names: UnknownName[];
  /** The choice for each name, by its key. */
  matches: ImportMatches;
  onMatch: (key: string, match: ImportMatch) => void;
  /** The book's accounts and categories to choose from (archived ones aren't offered). */
  book: TransactionOptions;
  /** Tags of the file the book doesn't use yet. */
  newTags: string[];
};

/**
 * The import's names step: each account and category name the book doesn't have, with how many
 * rows use it, becomes a new one or is linked to an existing one (a category may also be left
 * out, a subcategory folded into its category). New tags are noted below.
 */
export function ImportMatching({
  names,
  matches,
  onMatch,
  book,
  newTags,
}: ImportMatchingProps) {
  const t = useTranslations();
  const locale = useLocale();

  function options(name: UnknownName): SelectOption[] {
    if (name.kind === "account") {
      return [
        {
          value: "new",
          label: t("importExport.import.match.createAccount", {
            name: name.name,
          }),
          icon: PlusIcon,
        },
        ...book.accounts
          .filter((account) => !account.archived)
          .map((account, index) => ({
            value: account.id,
            label: account.name,
            icon: ACCOUNT_TYPE_ICONS[account.type],
            separatorBefore: index === 0,
          })),
      ];
    }
    if (name.kind === "category") {
      return [
        {
          value: "new",
          label: t("importExport.import.match.createCategory", {
            name: name.name,
          }),
          icon: PlusIcon,
        },
        { value: "none", label: t("importExport.import.match.noCategory") },
        ...book.categories[name.type]
          .filter((category) => !category.archived)
          .map((category, index) => ({
            value: category.id,
            label: category.name,
            color: category.color,
            separatorBefore: index === 0,
          })),
      ];
    }
    const parentId = name.parent.kind === "existing" ? name.parent.id : null;
    const siblings =
      book.categories[name.type]
        .find((category) => category.id === parentId)
        ?.subcategories.filter((sub) => !sub.archived) ?? [];
    return [
      {
        value: "new",
        label: t("importExport.import.match.createSubcategory", {
          name: name.name,
          parent: name.parentName,
        }),
        icon: PlusIcon,
      },
      { value: "none", label: t("importExport.import.match.noSubcategory") },
      ...siblings.map((sub, index) => ({
        value: sub.id,
        label: sub.name,
        separatorBefore: index === 0,
      })),
    ];
  }

  const groups = [
    {
      key: "accounts",
      title: t("importExport.import.match.accounts"),
      subtitle: t("importExport.import.match.accountsSubtitle"),
      names: names.filter((name) => name.kind === "account"),
    },
    {
      key: "categories",
      title: t("importExport.import.match.categories"),
      subtitle: t("importExport.import.match.categoriesSubtitle"),
      // Categories first: a subcategory's choices follow its category's.
      names: [
        ...names.filter((name) => name.kind === "category"),
        ...names.filter((name) => name.kind === "subcategory"),
      ],
    },
  ].filter((group) => group.names.length > 0);

  const quoted = (name: string) =>
    t("importExport.import.match.quoted", { name });

  return (
    <div className={styles.root}>
      {groups.length === 0 ? (
        <p className={styles.allKnown}>
          <CircleCheckIcon className={styles.allKnownIcon} aria-hidden="true" />
          {t("importExport.import.match.allKnown")}
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group.key} className={styles.group}>
          <div className={styles.groupHead}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            <span className={styles.groupSubtitle}>{group.subtitle}</span>
          </div>
          <ul className={styles.list}>
            {group.names.map((name) => (
              <li key={name.key} className={styles.row}>
                <div className={styles.name}>
                  <span className={styles.nameText}>
                    {quoted(
                      name.kind === "subcategory"
                        ? `${name.parentName} / ${name.name}`
                        : name.name,
                    )}
                  </span>
                  <span className={styles.nameMeta}>
                    {name.kind !== "account" ? (
                      <Badge size="sm">
                        {t(`transactionType.${name.type}`)}
                      </Badge>
                    ) : null}
                    {t("importExport.import.match.inRows", {
                      countNumber: name.rows,
                      count: formatNumber(name.rows, locale),
                    })}
                  </span>
                </div>
                <ArrowRightIcon
                  className={`${styles.arrow} mirror-rtl`}
                  aria-hidden="true"
                />
                <Select
                  aria-label={quoted(name.name)}
                  options={options(name)}
                  value={matches[name.key] ?? "new"}
                  onValueChange={(value) => {
                    if (value) onMatch(name.key, value);
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {newTags.length > 0 ? (
        <p className={styles.tags}>
          <TagIcon className={styles.tagsIcon} aria-hidden="true" />
          <span>
            {t("importExport.import.match.newTags", {
              tags: newTags.map(quoted).join(t("common.listSeparator")),
            })}
          </span>
        </p>
      ) : null}
    </div>
  );
}
