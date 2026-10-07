"use client";

import {
  CalendarRangeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleHelpIcon,
  LayersIcon,
  RotateCcwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TagIcon,
  TagsIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox, type ComboboxGroup } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { SearchField } from "@/components/ui/search-field";
import { Select, type SelectOption } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/ui/tag";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import {
  TRANSACTION_SEARCH_MAX_LENGTH,
  TRANSACTION_TYPES,
} from "@/constants/transaction";
import { TRANSACTION_TYPE_ICONS } from "@/constants/transaction-icons";
import { countFilters, toggleType } from "@/helpers/transaction-filters";
import { usePreferences } from "@/hooks/use-preferences";
import type { CategoryColor } from "@/types/category";
import type {
  TransactionFilterParams,
  TransactionOptions,
} from "@/types/transaction";
import { formatDate } from "@/utils/calendar";
import { todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

/** Select value for «همه» (no account or tag filter). */
const ALL = "*";

/** How long typing pauses before the search runs. */
const SEARCH_DELAY_MS = 350;

type TransactionFiltersProps = {
  params: TransactionFilterParams;
  /** Applies new filters (the page puts them in the URL). */
  onChange: (params: TransactionFilterParams) => void;
  options: TransactionOptions;
  /** «۳۵ تراکنش» at the end of the bar; empty while loading. */
  countLabel?: string;
  /** Starts with the panel open, for stories. */
  defaultOpen?: boolean;
  /** Overrides today (the latest date to pick), for stories. */
  today?: string;
};

/**
 * The «فیلترها» button, the active filters as removable chips and a «پاک کردن همه», then the
 * panel (closed by default): search, date range, type, account, category, tag and «فقط
 * تراکنش‌های ناشناس». Every change goes straight to `onChange`; the search waits for a pause
 * in typing.
 */
export function TransactionFilters({
  params,
  onChange,
  options,
  countLabel,
  defaultOpen = false,
  today: todayProp,
}: TransactionFiltersProps) {
  const t = useTranslations("transactions.filters");
  const tType = useTranslations("transactionType");
  const locale = useLocale();
  const { calendar, timeZone } = usePreferences();
  const today = todayProp ?? todayIso(timeZone);
  const panelId = useId();
  const fromId = useId();
  const toId = useId();
  const [open, setOpen] = useState(defaultOpen);

  // The search box keeps what's typed; the URL gets it after a pause.
  const [search, setSearch] = useState(params.search);
  const [syncedSearch, setSyncedSearch] = useState(params.search);
  if (params.search !== syncedSearch) {
    setSyncedSearch(params.search);
    setSearch(params.search);
  }
  const latest = useRef({ params, onChange });
  useEffect(() => {
    latest.current = { params, onChange };
  });
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === latest.current.params.search) return;
    const timer = setTimeout(() => {
      latest.current.onChange({ ...latest.current.params, search: trimmed });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  function set(patch: Partial<TransactionFilterParams>) {
    onChange({ ...params, ...patch });
  }

  const categories = useMemo(
    () =>
      new Map(
        [...options.categories.expense, ...options.categories.income].flatMap(
          (category) => [
            [category.id, { name: category.name, color: category.color }],
            ...category.subcategories.map(
              (sub) =>
                [
                  sub.id,
                  {
                    name: `${category.name} / ${sub.name}`,
                    color: category.color,
                  },
                ] as const,
            ),
          ],
        ),
      ) as Map<string, { name: string; color: CategoryColor }>,
    [options.categories],
  );

  const categoryGroups = useMemo<ComboboxGroup[]>(
    () =>
      [...options.categories.expense, ...options.categories.income].map(
        (category) => ({
          label: category.name,
          color: category.color,
          options: [
            {
              value: category.id,
              label:
                category.subcategories.length > 0
                  ? t("allOfCategory")
                  : category.name,
              selectedLabel: category.name,
            },
            ...category.subcategories.map((sub) => ({
              value: sub.id,
              label: sub.name,
            })),
          ],
        }),
      ),
    [options.categories, t],
  );

  const accountOptions: SelectOption[] = [
    { value: ALL, label: t("allAccounts"), icon: LayersIcon },
    ...options.accounts.map((account) => ({
      value: account.id,
      label: account.name,
      icon: ACCOUNT_TYPE_ICONS[account.type],
    })),
  ];
  const tags =
    params.tag && !options.tags.includes(params.tag)
      ? [params.tag, ...options.tags]
      : options.tags;
  const tagOptions: SelectOption[] = [
    { value: ALL, label: t("allTags"), icon: TagsIcon },
    ...tags.map((tag) => ({ value: tag, label: tag, icon: TagIcon })),
  ];

  const short = (date: string) =>
    formatDate(date, { locale, calendar, format: "short" });
  const account = options.accounts.find((item) => item.id === params.accountId);
  const category = params.categoryId
    ? categories.get(params.categoryId)
    : undefined;

  const chips: {
    key: string;
    label: string;
    icon?: typeof TagIcon;
    color?: CategoryColor;
    remove: () => void;
  }[] = [];
  if (params.from || params.to) {
    chips.push({
      key: "range",
      icon: CalendarRangeIcon,
      label:
        params.from && params.to
          ? t("chips.range", { from: short(params.from), to: short(params.to) })
          : params.from
            ? t("chips.from", { date: short(params.from) })
            : t("chips.to", { date: short(params.to ?? today) }),
      remove: () => set({ from: null, to: null }),
    });
  }
  for (const type of params.types) {
    chips.push({
      key: `type-${type}`,
      icon: TRANSACTION_TYPE_ICONS[type],
      label: tType(type),
      remove: () =>
        set({ types: params.types.filter((item) => item !== type) }),
    });
  }
  if (params.accountId) {
    chips.push({
      key: "account",
      icon: account ? ACCOUNT_TYPE_ICONS[account.type] : undefined,
      label: t("chips.account", { name: account?.name ?? "…" }),
      remove: () => set({ accountId: null }),
    });
  }
  if (params.categoryId) {
    chips.push({
      key: "category",
      color: category?.color,
      label: t("chips.category", { name: category?.name ?? "…" }),
      remove: () => set({ categoryId: null }),
    });
  }
  if (params.tag) {
    chips.push({
      key: "tag",
      icon: TagIcon,
      label: t("chips.tag", { name: params.tag }),
      remove: () => set({ tag: null }),
    });
  }
  if (params.search) {
    chips.push({
      key: "search",
      icon: SearchIcon,
      label: t("chips.search", { text: params.search }),
      remove: () => set({ search: "" }),
    });
  }
  if (params.unknownOnly) {
    chips.push({
      key: "unknown",
      icon: CircleHelpIcon,
      label: t("chips.unknown"),
      remove: () => set({ unknownOnly: false }),
    });
  }

  const count = countFilters(params) + (params.from || params.to ? 1 : 0);
  function clearAll() {
    setSearch("");
    onChange({
      ...params,
      from: null,
      to: null,
      types: [],
      accountId: null,
      categoryId: null,
      tag: null,
      search: "",
      unknownOnly: false,
    });
  }

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <Button
          variant="secondary"
          size="sm"
          iconStart={SlidersHorizontalIcon}
          iconEnd={open ? ChevronUpIcon : ChevronDownIcon}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
        >
          {count > 0
            ? t("buttonCount", { count: formatNumber(count, locale) })
            : t("button")}
        </Button>
        {chips.map((chip) => (
          <Tag
            key={chip.key}
            icon={chip.icon}
            color={chip.color}
            removeLabel={t("remove")}
            onRemove={chip.remove}
          >
            {chip.label}
          </Tag>
        ))}
        {chips.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            {t("clearAll")}
          </Button>
        ) : null}
        <span className={styles.count} aria-live="polite">
          {countLabel}
        </span>
      </div>

      {open ? (
        <Card padding="md" className={styles.panel}>
          <div
            id={panelId}
            role="group"
            aria-label={t("panel")}
            className={styles.panelBody}
          >
            <SearchField
              value={search}
              onValueChange={setSearch}
              placeholder={t("search")}
              aria-label={t("search")}
              maxLength={TRANSACTION_SEARCH_MAX_LENGTH}
            />
            <div className={styles.grid}>
              <Field label={t("from")} htmlFor={fromId}>
                <DatePicker
                  id={fromId}
                  value={params.from}
                  placeholder={t("anyDate")}
                  format="long"
                  today={today}
                  max={params.to ?? today}
                  onValueChange={(from) => set({ from })}
                />
              </Field>
              <Field label={t("to")} htmlFor={toId}>
                <DatePicker
                  id={toId}
                  value={params.to}
                  placeholder={t("anyDate")}
                  format="long"
                  today={today}
                  min={params.from ?? undefined}
                  max={today}
                  onValueChange={(to) => set({ to })}
                />
              </Field>
              <div className={styles.group} role="group" aria-label={t("type")}>
                <span className={styles.groupLabel} aria-hidden="true">
                  {t("type")}
                </span>
                <div className={styles.types}>
                  {TRANSACTION_TYPES.map((type) => (
                    <Tag
                      key={type}
                      icon={TRANSACTION_TYPE_ICONS[type]}
                      selected={params.types.includes(type)}
                      onSelectedChange={() =>
                        set({ types: toggleType(params.types, type) })
                      }
                    >
                      {tType(type)}
                    </Tag>
                  ))}
                </div>
              </div>
              <Field label={t("account")}>
                <Select
                  options={accountOptions}
                  value={params.accountId ?? ALL}
                  onValueChange={(value) =>
                    set({ accountId: value && value !== ALL ? value : null })
                  }
                />
              </Field>
              <Field label={t("category")}>
                <Combobox
                  groups={categoryGroups}
                  value={params.categoryId}
                  placeholder={t("allCategories")}
                  onValueChange={(categoryId) => set({ categoryId })}
                />
              </Field>
              <Field label={t("tag")}>
                <Select
                  options={tagOptions}
                  value={params.tag ?? ALL}
                  onValueChange={(value) =>
                    set({ tag: value && value !== ALL ? value : null })
                  }
                />
              </Field>
            </div>
            <div className={styles.footer}>
              <Switch
                size="sm"
                label={t("unknownOnly")}
                checked={params.unknownOnly}
                onCheckedChange={(unknownOnly) => set({ unknownOnly })}
              />
              <Button
                variant="ghost"
                size="sm"
                iconStart={RotateCcwIcon}
                disabled={count === 0}
                onClick={clearAll}
              >
                {t("clearAll")}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
