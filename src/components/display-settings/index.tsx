"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useId, useOptimistic, useTransition } from "react";

import { Card } from "@/components/ui/card";
import {
  SegmentedControl,
  type SegmentOption,
} from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { CALENDARS } from "@/constants/calendar";
import { RIAL_UNITS } from "@/constants/currency";
import { LOCALE_NAMES, LOCALES } from "@/constants/locale";
import { usePreferences } from "@/hooks/use-preferences";
import { useThemePreference } from "@/hooks/use-theme-preference";
import type { ActionResult } from "@/types/action";
import type { CalendarSystem } from "@/types/calendar";
import type { RialUnit } from "@/types/currency";
import type { Locale } from "@/types/locale";
import type { UserPreferences } from "@/types/preferences";
import type { ThemePreference } from "@/types/theme";

import styles from "./styles.module.css";

type DisplaySettingsProps = {
  /** Switches the interface language (the changeLocale Server Action); the page re-renders in it. */
  onChangeLocale: (locale: Locale) => Promise<void>;
  /** Saves the calendar or rial/toman choice (the updateDisplayPreferences Server Action). */
  onSavePreferences: (
    input: Partial<Pick<UserPreferences, "calendar" | "rialUnit">>,
  ) => Promise<ActionResult>;
};

/**
 * Settings section: language, calendar, rial or toman (IRR books only) and theme. Each choice
 * applies as soon as it is made. The first three are saved on the account; the theme on this
 * device.
 */
export function DisplaySettings({
  onChangeLocale,
  onSavePreferences,
}: DisplaySettingsProps) {
  const t = useTranslations();
  const toast = useToast();
  const preferences = usePreferences();
  const [theme, setTheme] = useThemePreference();
  const [, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic<UserPreferences>({
    locale: preferences.locale,
    calendar: preferences.calendar,
    rialUnit: preferences.rialUnit,
  });

  function save(change: Partial<UserPreferences>) {
    startTransition(async () => {
      setShown((current) => ({ ...current, ...change }));
      try {
        if (change.locale) {
          await onChangeLocale(change.locale);
          return;
        }
        const result = await onSavePreferences(change);
        if (!result.ok) toast.show({ title: result.error, tone: "danger" });
      } catch {
        toast.show({ title: t("settings.failed"), tone: "danger" });
      }
    });
  }

  const languageOptions: SegmentOption[] = LOCALES.map((locale) => ({
    value: locale,
    label: LOCALE_NAMES[locale],
    lang: locale,
  }));
  const calendarOptions: SegmentOption[] = CALENDARS.map((calendar) => ({
    value: calendar,
    label: t(`preferences.calendars.${calendar}`),
  }));
  const unitOptions: SegmentOption[] = RIAL_UNITS.map((unit) => ({
    value: unit,
    label: t(`preferences.rialUnits.${unit}`),
  }));
  const themeOptions: SegmentOption[] = [
    { value: "light", label: t("preferences.themes.light"), icon: SunIcon },
    { value: "dark", label: t("preferences.themes.dark"), icon: MoonIcon },
    {
      value: "system",
      label: t("preferences.themes.system"),
      icon: MonitorIcon,
    },
  ];

  return (
    <Card
      title={t("settings.display.title")}
      subtitle={t("settings.display.subtitle")}
    >
      <div className={styles.rows}>
        <Row label={t("preferences.language")}>
          {(labelId) => (
            <SegmentedControl
              aria-labelledby={labelId}
              options={languageOptions}
              value={shown.locale}
              onValueChange={(value) => save({ locale: value as Locale })}
            />
          )}
        </Row>
        <Row label={t("preferences.calendar")}>
          {(labelId) => (
            <SegmentedControl
              aria-labelledby={labelId}
              options={calendarOptions}
              value={shown.calendar}
              onValueChange={(value) =>
                save({ calendar: value as CalendarSystem })
              }
            />
          )}
        </Row>
        {preferences.currency === "IRR" ? (
          <Row
            label={t("preferences.rialUnit")}
            note={t("settings.display.tomanNote")}
          >
            {(labelId) => (
              <SegmentedControl
                aria-labelledby={labelId}
                options={unitOptions}
                value={shown.rialUnit}
                onValueChange={(value) => save({ rialUnit: value as RialUnit })}
              />
            )}
          </Row>
        ) : null}
        <Row
          label={t("preferences.theme")}
          note={t("settings.display.themeNote")}
        >
          {(labelId) => (
            <SegmentedControl
              aria-labelledby={labelId}
              options={themeOptions}
              value={theme}
              onValueChange={(value) => setTheme(value as ThemePreference)}
            />
          )}
        </Row>
      </div>
    </Card>
  );
}

/** One setting: its name (and a note) at the start, the control at the end. */
function Row({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: (labelId: string) => ReactNode;
}) {
  const labelId = useId();
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {note ? <span className={styles.note}>{note}</span> : null}
      </div>
      {children(labelId)}
    </div>
  );
}
