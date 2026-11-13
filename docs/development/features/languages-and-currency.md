# Languages, calendars and currency

Money speaks Persian (right to left, the default) and English (left to right). Each user picks their language, calendar (Jalali or Gregorian) and, in a rial book, rial or toman; an admin picks the book's currency. Dates are stored in Gregorian and amounts as integers, and both are converted only where they are shown or typed.

[Architecture](../architecture.md) explains how the pieces fit together; [conventions](../conventions.md) the rules for writing code.

## Where the code is

| Part                                             | Where                                                                                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Language, time zone and preferences of a request | `src/i18n/locale.ts`, `src/i18n/time-zone.ts`, `src/i18n/preferences.ts`, `src/i18n/request.ts`, `src/i18n/actions.ts` |
| Preferences in the browser                       | `src/hooks/use-preferences.ts`, `src/components/providers/`, `src/components/time-zone-sync/`                          |
| Interface copy                                   | `src/messages/fa.ts` (the source), `src/messages/en.ts`                                                                |
| Calendars                                        | `src/utils/calendar.ts`, `src/utils/jalali.ts`, `src/constants/calendar.ts`                                            |
| Money and numbers                                | `src/helpers/money.ts`, `src/utils/number.ts`, `src/constants/currency.ts`                                             |
| Book currency                                    | `src/db/book.ts`                                                                                                       |

## How it works

1. **Per request:** the server picks the language (the user's setting; signed out, a cookie, then the browser's languages, then Persian) and reads the preferences once with `getPreferences()`: language, calendar, rial or toman, the book's currency and the device's time zone.
2. **Rendering:** next-intl loads the messages of that language; `<html lang dir>` follows it. Client components get the same preferences through `Providers` and `usePreferences()`.
3. **Formatting** is done by pure functions that take the language, calendar or unit explicitly (`formatDate`, `formatMoney`, `formatNumber`), wrapped by components such as `DateText` and `Amount`.
4. **Storage stays neutral:** dates are Gregorian ISO strings and amounts integers in the smallest unit, converted only where they are shown or typed, or where they cross the MCP boundary.

## Details

| Setting           | Values                                 | Default                                                | Who                  | Stored in                                                                                        |
| ----------------- | -------------------------------------- | ------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------ |
| Language          | `fa` (فارسی, RTL), `en` (English, LTR) | `fa`                                                   | each user            | `user.locale`                                                                                    |
| Calendar          | `jalali`, `gregorian`                  | by language: Jalali for Persian, Gregorian for English | each user            | `user.calendar`                                                                                  |
| Rial or toman     | `rial`, `toman` (IRR books only)       | `rial`                                                 | each user            | `user.rial_unit`                                                                                 |
| Theme             | light, dark, system                    | system                                                 | each device          | `localStorage` (`money-theme`)                                                                   |
| Sidebar collapsed | expanded, collapsed (icon rail)        | expanded                                               | each device          | `localStorage` (`money-sidebar`)                                                                 |
| Currency          | `IRR`, `USD`, `EUR`, `GBP`             | `IRR`                                                  | admins, for the book | `book.currency`                                                                                  |
| Time zone         | IANA name                              | the device's OS time zone (automatic, not a setting)   | each device          | `money-time-zone` cookie (and `user.time_zone`, the last one reported, for the Claude connector) |

- **Language for a request** (`resolveLocale` in `src/i18n/locale.ts`): the signed-in user's `locale`; signed out, the `money-locale` cookie, otherwise the browser's Accept-Language (`negotiateLocale`), otherwise Persian. `changeLocale` (`src/i18n/actions.ts`) sets the cookie and, when signed in, the user's `locale`; the login page has a small switch that calls it. The language decides `<html lang dir>`, the digits, the fonts and the copy.
- **Preferences** (`Preferences` in `src/types/preferences.ts`): the user's language, calendar and rial/toman, the book's currency, the device's time zone, and the derived `moneyUnit` (`rial`, `toman`, `USD`, `EUR`, `GBP`). Server: `getPreferences()` (`src/i18n/preferences.ts`, once per request). Client: `usePreferences()` (`src/hooks/use-preferences.ts`), filled by `Providers` from the root layout. Signed-out pages get the defaults for their language.
- **Time zone** follows each viewer's device: `TimeZoneSync` (`src/components/time-zone-sync`, in the root layout) saves the browser's OS time zone in the `money-time-zone` cookie and refreshes the page when it rendered with another one (first visit, travel, OS change). The server reads it in `resolveTimeZone` (`src/i18n/time-zone.ts`): the cookie, otherwise Vercel's `x-vercel-ip-timezone` header, otherwise `Asia/Tehran`. Two users in different time zones can see a different «today».
- **Week**: Jalali weeks start on Saturday with Friday as the weekend; Gregorian weeks start on Monday with Saturday and Sunday as the weekend (`WEEK_START`, `WEEKEND` in `src/constants/calendar.ts`).
- **Money units** (`MONEY_UNITS` in `src/constants/currency.ts`): stored units per shown unit (rial 1, toman 10, dollar/euro/pound 100) and decimals always shown (2 for dollars, euros, pounds; tomans show one only when the rials don't divide by ten).

## i18n library

- **i18n:** next-intl without i18n routing: the locale comes from the user record (signed in) or the `money-locale` cookie, then Accept-Language (signed out), never from the URL. Request config in `src/i18n/request.ts`, wired with the next-intl plugin in `next.config.ts`. Messages are typed (`AppConfig` in `src/i18n/types.d.ts`).
