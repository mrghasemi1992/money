# Architecture

This is the map of Money: what the parts are, how a request moves through them, and where to look for each thing. Read it first; then [decisions](decisions.md) for why things are the way they are, the [feature docs](#feature-docs) for the area you work on, and [conventions](conventions.md) before writing code. Setting up a machine and the workflow are in [CONTRIBUTING.md](../../CONTRIBUTING.md).

## What Money is

A personal accounting app for a person or a family, with a Persian (right-to-left) and an English (left-to-right) interface. Users record income, expenses and transfers by hand, by importing a CSV file, or by talking to Claude or ChatGPT, which save them through Money's MCP connector.

- **One shared book.** All users work on the same accounts, categories, transactions and budgets. There is no per-user data; what a user can do depends on their role (admin, editor, viewer).
- **Invite only.** No public sign-up: a new copy creates its first admin, who creates the other users.
- **One currency per book:** rial, US dollar, euro or pound, chosen by an admin. No exchange rates.
- **Each user's own preferences:** language, calendar (Jalali or Gregorian), rial or toman, theme.
- **Self-hosted.** Each person or family runs their own copy: a fork of the repository on their own Vercel and Neon accounts ([self-hosting](../self-hosting.md)).

## Goals and constraints

- **Correct money.** Amounts are integers, totals are summed in Postgres, transfers never count as income or expense, and the database itself refuses data that breaks the rules.
- **Two languages and two calendars as equals.** Persian (right to left) is the default; every screen also works in English, left to right, with either calendar.
- **Free and simple to run.** A family runs a copy on free GitHub, Vercel and Neon plans, sets it up in the browser and updates it with one click. So: no paid services, no servers to look after, and migrations that never strand the previous version.
- **Each family's data stays theirs.** No shared hosted service, no analytics; the only outside request the app makes is the update check to GitHub's public API.
- **Safe by default.** Every page, action and MCP tool checks the role on the server; unused auth endpoints are closed; no page may be framed.
- **Calm, fast screens.** Pages render on the server, stream their sections, and show skeletons that match the final layout; nothing the user starts goes quiet.

The decisions that follow from these, and what they cost, are in [decisions](decisions.md).

## How it fits together

```text
Browser ──────────────┐                        ┌──> Neon Postgres
                      ├──> Next.js on Vercel ──┤    (one database per copy;
Claude / ChatGPT ─────┘    pages, Server        │     a branch per preview)
  (MCP over OAuth)         Actions, Route       │
                           Handlers, /mcp       └──> GitHub (update check only)
```

There is no separate backend. One Next.js project holds the pages, the Server Actions that change data, the sign-in (Better Auth), the OAuth server for the connector and the MCP endpoint. Every page is rendered on the server per request; the database is reached only from server code.

### Integration points

| Service         | What Money uses it for                                                                                         | Where                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Vercel          | Builds and hosts the app; environment variables; a preview per pull request; `vercel-build` migrates on deploy | `package.json`, `vercel.json`                                  |
| Neon            | Postgres: the main branch for production, a branch per preview, a `dev` branch for local work                  | `src/db/index.ts`, [local development](local-development.md)   |
| Claude, ChatGPT | MCP clients that sign in through Money's OAuth server and call its tools                                       | `src/app/mcp/`, `src/mcp/`, [connector](features/connector.md) |
| GitHub          | The code and releases; forks update with Sync fork; the app reads the latest release for the update notice     | `src/helpers/release.ts`, [releases](releases.md)              |
| Google Fonts    | Manrope for the English interface, downloaded at build time by `next/font` (no request from the browser)       | `src/styles/fonts.ts`                                          |

## Tech stack

- **Framework:** Next.js with the App Router, React, TypeScript (strict mode). Chosen over Vite because the MCP endpoint, the OAuth server, sign-in and database access all live in the same project as Route Handlers and Server Actions, with no separate backend.
- **Database:** Postgres on Neon, connected through the Vercel Neon integration (env prefix `DATABASE`: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`) for Production and Preview. Production uses the main branch, and every Preview deployment gets its own Neon branch (copied from main, named `preview/<git branch>`; the integration never deletes it and the free plan allows 10 per project, so `.github/workflows/delete-preview-branch.yml` deletes a PR's branch when the PR closes, where the repository has the `NEON_PROJECT_ID` variable and the `NEON_API_KEY` secret). **Development uses a `dev` branch**, a copy of main with its own `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `BETTER_AUTH_SECRET` in Vercel's Development environment, so local work never touches the real book and production's credentials stay off development machines; reset it from main for fresh data. Local variables come from `vercel env pull .env.local`; `.env.example` lists them all. Setup and reset: `docs/development/local-development.md`.
- **Data access:** Drizzle ORM over the Neon serverless driver's HTTP mode (`drizzle-orm/neon-http`, `src/db/index.ts`): one stateless request per query, no interactive transactions (use `db.batch([...])` for writes that must succeed together). `casing: "snake_case"`: schema keys are camelCase, columns snake_case. Schema in `src/db/schema/` (one file per table group). Migrations with drizzle-kit in `drizzle/`, committed; generate with `pnpm db:generate` and never edit an applied migration. On Vercel the `vercel-build` script runs `next build`, then `drizzle-kit migrate`, so every deployment migrates its own database (main branch for Production, its Neon branch for a Preview) and a failed build migrates nothing (see [releases](releases.md)); locally `pnpm db:migrate` migrates the `dev` branch.
- **Validation:** Zod for every form, Server Action input, MCP tool input and CSV row.
- **UI primitives:** Base UI (`@base-ui/react`, unstyled). Use it for interactive parts like Dialog, Menu, Popover, Select, Combobox, Tooltip, Tabs, Switch, Checkbox.
- **Styling:** CSS Modules + CSS custom properties as design tokens. No Tailwind. No component libraries (no shadcn/ui, no MUI).
- **Icons:** lucide-react
- **Design system docs:** Storybook
- **Formatting:** Prettier (default options) with `eslint-config-prettier`
- **Hosting:** Vercel. Two projects from this one repo: `money` (the app) and `money-storybook` (the design system docs, https://money-storybook.vercel.app: Storybook preset, `pnpm build-storybook`, output `storybook-static`), same as `orange` / `orange-storybook`.
- **Tests:** not in scope yet. Planned later. Write code that is easy to test (small pure functions, data logic separate from UI).

Feature-specific libraries are described with their feature: Better Auth in [users and auth](features/users-and-auth.md), `mcp-handler` in [connector](features/connector.md), next-intl in [languages](features/languages-and-currency.md), Papa Parse in [CSV](features/csv.md), and why the charts are hand-written in [reports](features/reports.md).

## Layers

Code is organised by what it does, and each layer only calls the ones below it:

| Layer                          | Folder                                                                                                | Rules                                                                                                                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages, layouts, Route Handlers | `src/app/`                                                                                            | Server Components. Each one checks the session first (`requireUser()`, `requireWrite()` or `requireAdmin()` from `src/auth/session.ts`), then runs its queries and hands plain data to a component. |
| Server Actions                 | `actions.ts` next to their page                                                                       | `"use server"`. Check the session, validate the input with Zod, call a query, `refresh()` the page, return an `ActionResult`. Pages pass them to components as props.                               |
| Components                     | `src/components/` (design system in `ui/`)                                                            | React, client components only when they need state or browser APIs. No text of their own: every string is a message.                                                                                |
| Queries                        | `src/db/`                                                                                             | Drizzle and SQL, `server-only`. They don't check roles (the caller did); writes take the acting user's id.                                                                                          |
| Shared logic                   | `src/helpers/` (Money-specific), `src/utils/` (generic), `src/constants/`, `src/types/`, `src/hooks/` | Small pure functions, shared by server, browser and the MCP tools. Zod schemas for forms live here, so the form and the action use the same rules.                                                  |
| The connector                  | `src/mcp/`                                                                                            | Tools that check the token's user and role, then call the same queries and schemas as the web app.                                                                                                  |

## A request, step by step

**Opening a page** (for example `/transactions?month=1405-08`):

1. `src/proxy.ts` sends visitors without a session cookie to `/login`. It is only a shortcut; the page checks again.
2. `src/app/(app)/layout.tsx` renders the app shell (sidebar, tab bar) with the user's role, and `getPreferences()` (`src/i18n/preferences.ts`) reads their language, calendar, currency unit and time zone.
3. `src/app/(app)/transactions/page.tsx` calls `requireUser()`, reads the filters from the URL (`src/helpers/transaction-filters.ts`), turns the month of the viewer's calendar into a Gregorian date range and runs the queries in `src/db/transactions.ts` in parallel.
4. It renders `Transactions` (`src/components/transactions/`) with the data, the user's write permission and the Server Actions as props. Components format dates and amounts for the viewer (`DateText`, `Amount`).
5. While it loads, `loading.tsx` shows the page's skeleton; on an error `error.tsx` shows a retry.

**Changing data** (adding a transaction):

1. `TransactionDialog` (`src/components/transaction-dialog/`) validates the form in the browser (`transactionErrors`, built on `transactionSchema` in `src/helpers/transaction.ts`) and calls the `createTransaction` Server Action it was given.
2. `createTransaction` (`src/app/(app)/transactions/actions.ts`) calls `requireWrite()` (viewers get not-found), parses the input with the same schema, checks that the accounts and category exist and aren't archived, and inserts the row with the user's id from the session (`src/db/transactions.ts`).
3. It calls `refresh()`, so the page's Server Component runs again with the new data, and returns `{ ok: true, id }`. The form shows a toast with «واگرد» / “Undo”, which calls `deleteTransaction` with that id.

**A Claude or ChatGPT request** (`POST /mcp`):

1. `src/app/mcp/route.ts` verifies the bearer token (`src/mcp/auth.ts`): signed by this copy, for this resource, from an allowed client, and the user still allows the app and isn't disabled.
2. `src/mcp/handler.ts` builds an MCP server for that user. Viewers get only the read tools.
3. A tool in `src/mcp/tools.ts` converts dates and amounts at the boundary (`src/helpers/connector.ts`), checks the role again for writes, and calls the same queries as the web app.

**A deployment:** `vercel-build` runs `next build`, then `drizzle-kit migrate` on that deployment's database; Vercel switches the domain only if both succeed. See [releases](releases.md).

## Feature docs

| Area                                                             | Doc                                                                        |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Users, roles, sign-in, first admin, user management, Better Auth | [features/users-and-auth.md](features/users-and-auth.md)                   |
| Accounts and categories                                          | [features/accounts-and-categories.md](features/accounts-and-categories.md) |
| Transactions                                                     | [features/transactions.md](features/transactions.md)                       |
| Budgets                                                          | [features/budgets.md](features/budgets.md)                                 |
| Reports and charts                                               | [features/reports.md](features/reports.md)                                 |
| Dashboard                                                        | [features/dashboard.md](features/dashboard.md)                             |
| CSV import and export                                            | [features/csv.md](features/csv.md)                                         |
| Claude and ChatGPT connector (MCP, OAuth)                        | [features/connector.md](features/connector.md)                             |
| Languages, calendars, currency, time zones                       | [features/languages-and-currency.md](features/languages-and-currency.md)   |
| Design system, app shell, skeletons, copy rules                  | [features/design-system.md](features/design-system.md)                     |
| Releases, deployments, migrations                                | [releases.md](releases.md)                                                 |
| Local development and database branches                          | [local-development.md](local-development.md)                               |

## Data rules

- **One shared book, no `user_id` on financial data.** `accounts`, `categories`, `transactions` and `budgets` belong to the book, not to a user. Queries don't filter by user; access is controlled by role (see [roles](features/users-and-auth.md#roles)).
- **Who did it.** Transactions record `created_by` and `updated_by` (user ids). The acting user always comes from the session (web) or the OAuth token (MCP), never from client input.
- **Dates are stored as Gregorian.** A transaction's date is a Postgres `date` (`YYYY-MM-DD`, no time zone). Timestamps (`created_at`, `updated_at`) are `timestamptz`. Never store Jalali dates.
- **Calendars only at the edges.** Dates travel through the app as ISO strings. Convert to the user's calendar (Jalali or Gregorian) only:
  - in UI components that show or pick a date (`DateText`, `Calendar`, `DatePicker`), and
  - at the MCP boundary: tools return dates in the signed-in user's calendar, Jalali `YYYY/MM/DD` or Gregorian `YYYY-MM-DD`, and take either (the year tells the calendar), because bank SMS use Jalali and LLMs are unreliable at Jalali calendar math. The MCP layer converts before reading or writing the database (`src/helpers/connector.ts`).
- **The viewer's calendar months drive periods.** "This month", budgets and monthly reports use the months of the viewing user's calendar, so two users with different calendars see different month boundaries. `monthRange` in `src/utils/calendar.ts` turns a month into a Gregorian date range for queries.
- **Today** is the current date in the viewer's device time zone (`Preferences.timeZone`): `todayIso(timeZone)`. MCP has no browser: it uses the time zone the user's browser last reported (`user.time_zone`), otherwise Asia/Tehran.
- **Amounts** are integers in the book currency's smallest unit (`bigint`): rials for IRR, cents or pence for USD, EUR and GBP. Transaction and budget amounts are positive; the transaction type gives the direction. Toman is only a way of showing and typing IRR amounts (1 toman = 10 rials); the stored value is always rials. Format with the helpers in `src/helpers/money.ts` (`formatMoney`, `formatMoneyNumber`) or the `Amount` component, never by hand. Amount inputs accept Persian, Arabic and Latin digits, and «.» or «٫» before decimals when the unit has them; with `allowNegative` (starting balances only) a leading «-» or «−».
- **The book currency** can change only while the book holds no amounts: no transactions, no budgets and every opening balance 0. Changing it later would silently reinterpret every stored number. `setBookCurrency` (`src/db/book.ts`) checks and upserts in one SQL statement (`insert … select … where not <holds amounts> on conflict do update`), so an amount recorded in between can't slip past; `bookHoldsAmounts` tells the settings page to show the currency locked.
- **Unknown transactions:** an income or expense **without a category** still needs to be identified (`isUnknownTransaction` in `src/helpers/transaction.ts`; in SQL `type <> 'transfer' and category_id is null`). It shows the tag «ناشناس» / “unknown” (`transactions.unknownTag`), which is derived and never stored in `tags`; `unknown=1` filters them and the search finds them by the tag's word. Descriptions are optional and an empty one stays empty: «؟» no longer marks anything (`daily-transactions` used it; `UNKNOWN_DESCRIPTION_MARKS` are saved as empty, and migration `0006` cleared the stored ones). Claude and the CSV import can save a transaction without a category; the web form can't.

## Data model

| Table              | Main columns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth tables | `user` (with `username`, `display_username`, `role` (`admin` \| `editor` \| `viewer`), `banned`, and Money's preference fields `locale` (`fa` \| `en`), `calendar` (`jalali` \| `gregorian`), `rial_unit` (`rial` \| `toman`), `time_zone`), `session`, `account` (the password hash; Drizzle export `authAccount`, not to be confused with `accounts`), `verification`, `rate_limit`, and in `src/db/schema/oauth.ts` the JWT and OAuth provider tables: `jwks`, `oauth_client`, `oauth_consent` (with Money's `last_used_at`), `oauth_refresh_token`, `oauth_access_token`, `oauth_resource`, `oauth_client_resource`, `oauth_client_assertion` |
| `book`             | One row (`id` 1): `currency` (`IRR` \| `USD` \| `EUR` \| `GBP`). No row until an admin first saves the settings; until then `DEFAULT_BOOK_SETTINGS` (IRR) applies (`getBookSettings` in `src/db/book.ts`)                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `accounts`         | `id`, `name` (unique ignoring case), `type` (`bank` \| `cash` \| `other`), `identifier_kind` (`accountNumber` \| `cardNumber` \| `sheba`) and `identifier` (both set or both null, bank accounts only), `opening_balance` (smallest unit, may be 0 or negative), `archived`, `sort_order`                                                                                                                                                                                                                                                                                                                                                         |
| `categories`       | `id`, `type` (`income` \| `expense`), `name`, `color`, `icon` (a Lucide name from `CATEGORY_ICONS`, default `shapes`), `parent_id` (null for a category, set for a subcategory), `archived`                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `transactions`     | `id`, `type` (`income` \| `expense` \| `transfer`), `date`, `amount`, `account_id`, `to_account_id` (transfers only), `category_id` (category or subcategory; null for transfers, optional otherwise), `description` and `note` (`''` when empty), `tags` (`text[]`), `source` (`web` \| `mcp` \| `chatgpt` \| `csv`), `created_by`, `updated_by` (user ids), `created_at`, `updated_at`                                                                                                                                                                                                                                                          |
| `budgets`          | `id`, `category_id` (top-level expense category), `amount` (smallest unit, per month)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

- Subcategories are one level deep: a subcategory's parent must be a top-level category, and it has the same `type` as its parent.
- A transaction's category must match its type (income categories for income, expense categories for expense). Transfers have no category.
- Budgets and reports roll subcategory amounts up into their parent category.
- Users are disabled (banned), never deleted, so `created_by` / `updated_by` always point to a real user.
- Account balance = opening balance + income − expense − transfers out + transfers in. Transfers never count as income or expense in totals, budgets or reports.
- **The database enforces these rules too** (constraints in `src/db/schema/`), so a bug in app code can't store bad data. Server code still validates first, to show a clear error:
  - amounts > 0; `type` (transactions, categories, accounts), `source`, `color`, `role`, `locale`, `calendar`, `rial_unit` and `currency` limited to their constants (CHECK constraints built with `oneOf`);
  - `book` has at most one row (`id = 1`);
  - a transfer has a `to_account_id` different from `account_id` and no category; income and expense have no `to_account_id`;
  - a transaction's category has the transaction's type: foreign key `(category_id, type)`;
  - one level of subcategories with the parent's type: foreign key `(parent_id, type, has_parent)` → `(id, type, is_top_level)`, using generated columns;
  - a budget's category is a top-level expense category: constant generated columns in the foreign key;
  - category names are unique per type and parent; account names are unique ignoring case (`lower(name)` index); one budget per category;
  - an account or category that is in use can't be deleted (foreign keys without cascade), and neither can a user who added or edited a transaction (disable them instead).
  - `role` is one of `USER_ROLES`.

## Routes

| Route                                                                                           | Page                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/login`                                                                                        | Sign in                                                                                                 |
| `/setup`                                                                                        | Create the first admin (only while there are no users)                                                  |
| `/`                                                                                             | Dashboard (داشبورد)                                                                                     |
| `/transactions`                                                                                 | Transactions (تراکنش‌ها)                                                                                |
| `/budgets`                                                                                      | Budgets (بودجه), `?month=`                                                                              |
| `/reports`                                                                                      | Reports (گزارش‌ها): the overview tab, `?period=` / `?month=` / `?from=&to=`                             |
| `/reports/breakdown`, `/reports/trends`                                                         | Reports' breakdown and over-time tabs, same period params                                               |
| `/settings`                                                                                     | Settings (تنظیمات): profile, password, language, calendar, rial or toman, theme; book currency (admins) |
| `/accounts`                                                                                     | Accounts (viewers read only); `/settings/accounts` redirects here                                       |
| `/categories`                                                                                   | Categories (viewers read only); `/settings/categories` redirects here                                   |
| `/settings/connector`                                                                           | Claude connector: URL, steps, connected apps (revoke), examples                                         |
| `/settings/import-export`                                                                       | CSV export (every role) and import (editors and admins)                                                 |
| `/transactions/export`                                                                          | CSV export Route Handler (`?from=&to=&account=`)                                                        |
| `/oauth/consent`                                                                                | OAuth consent for Claude (outside the app shell)                                                        |
| `/.well-known/oauth-protected-resource/mcp`, `/.well-known/oauth-authorization-server/api/auth` | OAuth discovery metadata                                                                                |
| `/admin/users`                                                                                  | User management (admins only; others get not-found)                                                     |
| `/api/auth/[...all]`                                                                            | Better Auth handler                                                                                     |
| `/mcp`                                                                                          | MCP endpoint (OAuth bearer token)                                                                       |

All pages except `/login` and `/setup` require a session (`/oauth/consent` sends signed-out visitors to `/login` with Claude's request). Every signed-in role can open every page except `/admin/users`; viewers see them without write controls.

## Project structure

```text
src/
  proxy.ts              Redirects visitors without a session cookie to /login (optimistic only)
  app/                  App Router: layout (lang/dir, theme and sidebar scripts, Providers), icon.svg, apple-icon.tsx, globals.css
    login/              Sign-in page (also Claude's sign-in, with the signed OAuth request; sends a new copy to /setup)
    setup/              Creating the first admin of a new copy (+ actions.ts: createFirstAdmin)
    oauth/consent/      The OAuth consent page for Claude
    mcp/                The MCP endpoint (route.ts: withMcpAuth + the tools)
    .well-known/        OAuth protected resource and authorization server metadata
    (app)/              Signed-in pages inside the app shell: layout.tsx (AppShell), loading, error, not-found,
                        (dashboard)/ (page.tsx: the dashboard, with its streamed sections, + loading.tsx), transactions (+ actions.ts, loading.tsx, error.tsx,
                        export/route.ts: the CSV export), budgets
                        (+ actions.ts, loading.tsx, error.tsx), reports ((overview)/, breakdown/, trends/, each with
                        page.tsx and loading.tsx; period.ts, error.tsx), accounts and categories
                        (+ actions.ts, loading.tsx, error.tsx), settings (+ actions.ts;
                        (overview)/ with the page and its loading.tsx; connector/ and import-export/ with
                        loading.tsx, error.tsx), admin/users
                        (+ actions.ts, loading.tsx),
                        [...rest] (unknown paths → not-found in the shell)
    api/auth/[...all]/  Better Auth handler
  auth/                 Better Auth config (index.ts), getSession / requireUser / requireWrite / requireAdmin (session.ts), signOut (actions.ts),
                        the connector's URLs (urls.ts), readOAuthRequest (oauth.ts), the setup code check (setup.ts)
  mcp/                  The Claude connector: token check (auth.ts), tools (tools.ts), instructions, per-request server (handler.ts)
  db/                   Drizzle client (index.ts), schema/ (auth, oauth, book, accounts, categories, transactions, budgets),
                        queries: book.ts (getBookSettings, bookHoldsAmounts, setBookCurrency), users.ts
                        (hasUsers, updateUserPreferences, listUsers, listTransactionCreators, getUserStatus, setUserRole, disableUser), accounts.ts,
                        categories.ts, transactions.ts (list, totals, unknown summary, tags, options, create / update / delete,
                        exportTransactions),
                        budgets.ts (listBudgetCategories, saveBudget, deleteBudget),
                        reports.ts (compareTotals, categoryTotals, rangeTotals, accountExpenseTotals,
                        recurringExpenses, largestTransactions, budgetRecord),
                        dashboard.ts (getBookProgress),
                        import.ts (findImportDuplicates, saveImport: the CSV import in one batch),
                        connector.ts (checkMcpGrant, listConnections, revokeConnection, revokeAllConnections, revokeGrants),
                        attempts.ts (takeAttempt, clearAttempts: attempt limits for Server Actions),
                        errors.ts (isUniqueViolation)
  i18n/                 next-intl request config (request.ts), resolveLocale (locale.ts), resolveTimeZone
                        (time-zone.ts), getPreferences (preferences.ts), changeLocale (actions.ts), typed messages
                        (types.d.ts)
  messages/             Interface copy: fa.ts (source, Messages type), en.ts, index.ts (MESSAGES)
  components/
    ui/                 Design system: one folder per component (index.tsx, styles.module.css, index.stories.tsx)
                        logo, logo-mark, button, icon-button, tooltip, field, text-field, textarea, amount-field,
                        search-field, select, combobox, checkbox, switch, radio-group, segmented-control, calendar,
                        date-picker, date-text, dialog, sheet, menu, link, popover, toast, skeleton, empty-state, card,
                        badge, tag, tag-input, category-chip, avatar, divider, amount, progress-bar, bar-list,
                        column-chart, data-table, foundations (Storybook only)
    login/              The sign-in screen (Components/Login)
    setup/              The first-admin screen of a new copy (Components/Setup)
    app-shell/          The frame of signed-in pages: skip link, sidebar, top bar, tab bar, add-transaction form
    sidebar/, top-bar/, tab-bar/, user-menu/   Its parts (desktop sidebar and rail; phone top and bottom bars;
                        the account menu with sign-out)
    more-menu/          The phone «More» tab's menu: links to the sections that aren't tabs
    add-transaction/    AddTransactionProvider (the add form, dialog / sheet), AddTransactionButton, useAddTransaction
    transactions/       The /transactions page: header with the month switcher, summary, filters, list, dialogs
                        (+ skeleton, error)
    transaction-list/, transaction-detail/, transaction-dialog/, transaction-filters/, transaction-summary/
                        Day-grouped rows (+ sample-transactions.ts for stories), the detail, the add / edit form,
                        the filter bar and panel, the month's income / expense / net
    month-switcher/     «‹ مهر ۱۴۰۵ ›» in the viewer's calendar
    budgets/            The /budgets page: header with the month switcher, summary, rows, categories without a
                        budget, dialogs (+ skeleton, error)
    budget-summary/, budget-list/, budget-dialog/   The month's spent / budget / remaining with today's line,
                        the budget rows and the unbudgeted categories (+ sample-budgets.ts for stories), the form
    reports/            The /reports tabs: header with the period switch, period bar, tabs, then the tab's cards
                        (+ skeleton, error, sample-reports.ts for stories)
    report-tabs/        The reports' tabs (overview, breakdown, over time), links that keep the period
    report-period/, report-summary/, report-card/   The period switch and bar (usePeriodText), the income /
                        expense / net cards with the change, a card with the chart / table switch
    movers-report/, savings-report/, recurring-report/, largest-report/, budget-record-report/
                        The insights: biggest changes in spending, savings rate per month, recurring
                        spending, largest transactions, how often budgets held
    category-report/, account-report/, monthly-report/   Income or expense by category, spending by account,
                        month by month
    dashboard/          The / page's layout (+ sample-dashboard.tsx for stories)
    balance-overview/, month-overview/, recent-transactions/, budget-progress/, top-spending/, unknown-notice/
                        The dashboard's sections, each with its skeleton
    first-run/          The dashboard of an empty book: setup steps (writers) or a note (viewers)
    transaction-tile/, transaction-title/   The tile at the start of a transaction row (category icon on its hue,
                        transfer, «؟» for unknown) and its first line (category / subcategory, route, or the «ناشناس» tag)
    page-header/, page-skeleton/, page-status/   Page building blocks (title, loading, error and not-found)
    navigation-progress/   The top-edge bar while a page loads (+ store.ts, useReportNavigation), mounted in AppShell
    user-management/    The /admin/users page: user-list/ (table and cards, filters, row menu), new-user-dialog/,
                        role-dialog/, reset-password-dialog/ (confirm, then the password once)
    responsive-dialog/, confirm-dialog/   Dialog on larger screens, Sheet on phones; a confirmation with one action
    account-settings/, category-settings/   The /accounts and /categories pages (+ skeleton, error)
    account-list/, account-dialog/   Account rows (drag handle, row menu, archived rows) and the add / edit form
    category-list/, category-dialog/, category-color-picker/, category-icon-picker/, starter-categories/
                        Category rows with subcategories, the category / subcategory form, the palette swatches,
                        the icon grid with its search, the suggestions
    archived-section/   «بایگانی‌شده (n)» toggle with the archived rows
    settings-links/     The /settings sections that link to import and export and the Claude connector
    settings/           The /settings sections: profile-settings/, password-settings/, display-settings/,
                        book-settings/ (admins), about-settings/ (version, update notice for admins)
    connector-settings/, connector-consent/   The /settings/connector page and the OAuth consent page
    import-export/      The /settings/import-export page (+ skeleton, error)
    csv-export/, csv-import/   The export card; the import card with its steps and state (+ sample-import.ts,
                        sample-plan.ts for stories)
    import-stepper/, import-upload/, import-mapping/, import-matching/, import-review/, import-result/
                        The import's stepper and five steps
    providers/          next-intl, preferences, Base UI direction, tooltip delay group, toast viewport
    theme-sync/         Re-applies the theme after hydration and follows OS / other-tab changes
    time-zone-sync/     Saves the device's OS time zone in a cookie and re-renders when it changed
  constants/            account (types, name length), account-icons, auth (sign-in limit, login path), book (default
                        settings), calendar (names, week start), category, category-icons (CATEGORY_ICONS),
                        category-icon-words (the picker's themes and search words), connector (paths, scope, allowed client origins, tool limits), csv (limits,
                        fields, header and type words, export columns and presets), currency (units, symbols), dashboard (section sizes), locale, media
                        queries, navigation (NAV_ITEMS), release (upstream repo, GitHub URLs, update check), report (periods, URL params, limits), sidebar (storage key, script), starter-categories, theme
                        script, time zone, transaction (types, sources, «؟» marks, limits, page size), transaction-icons,
                        user
  helpers/              account form rules, account balance SQL (accountBalance), budgets (status, form rules,
                        month, transactions link), category color
                        style, icon and name rules, category-icon (guessCategoryIcon, iconMatches), dashboard (closestBudgets, spendingSlices, links), money formatting (also compact, and axis scales) and input, navigation (getNavItems,
                        isNavItemActive), new-user form rules (newUserSchema), first-admin form rules (firstAdminSchema), preferences, reports (URL params,
                        resolveReportPeriod, period text, compareAmounts), role permissions,
                        connector (dates and amounts at the MCP boundary, isAllowedMcpClient), csv-values (dates, amounts, types, tags of
                        imported cells), csv-import (column guess, row schema, name matching, planImport, payload
                        schemas), csv-export (row, file name, presets), oauth-consent (consent requests),
                        release (getAppVersion, checkForUpdate),
                        sign-in request (and the signed OAuth query), transaction form rules (transactionSchema), transaction filters (URL
                        params, period, NO_TRANSACTION_FILTERS), user (placeholder email, temporary password)
  hooks/                useClipboard, useControllableState, usePreferences, useMediaQuery, useSidebarCollapsed,
                        useThemePreference
  styles/
    tokens/             colors, typography, spacing, radius, shadows, motion, components
    base.css            element defaults, focus ring, mirror-rtl, reduced motion
    typography.css      type helper classes (.type-*, .tabular, .ltr, .visually-hidden)
    media.css           @custom-media breakpoints
    control.module.css, menu.module.css, choice.module.css, list.module.css   shared component styles
    fonts.ts, fonts/    Dana via next/font/local
  types/                account, action (ActionResult), book, budget, calendar, category, connector, csv, currency, dashboard, locale, navigation, preferences,
                        release, report, theme, transaction, user
  utils/                calendar (both calendars, formatDate), chart (niceAxis, axisShare), csv (writing, BOM, formula
                        guard, download), csv-parse (Papa Parse), cx, duration, env, focus, iso-date, jalali (math),
                        locale (Accept-Language), metadata (CORS for public metadata), number, semver (isNewerVersion), sidebar (collapsed
                        state), text (also firstName, isolate), theme, url
drizzle/                SQL migrations generated by drizzle-kit (committed)
docs/                   README.md (index of all docs), self-hosting.md (setting up a copy), updating.md (updating a
                        copy; the app links to it)
  development/          architecture.md (this map), decisions.md (key decisions and trade-offs), conventions.md (rules
                        for code), features/ (one doc per area), releases.md (release process, migration rules),
                        local-development.md (the `dev` database branch for local work)
CONTRIBUTING.md         Setup, scripts, workflow, the feature checklist, which doc to update for which change
.github/pull_request_template.md   What a PR description covers, with the checks
.github/workflows/      release.yml (release-please), delete-preview-branch.yml (a closed PR's Neon branch)
.github/dependabot.yml  Dependency update PRs (npm weekly, grouped, a week's cooldown, at most 2 open; actions monthly)
SECURITY.md             How to report a vulnerability (GitHub private vulnerability reporting), supported versions, scope
scripts/                create-user.ts (`pnpm user:create`)
```

## Glossary

| Term                  | Meaning                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Book                  | The shared set of accounts, categories, transactions and budgets of one copy. The `book` table holds its settings (the currency).                              |
| Account               | Where money sits: a bank account or card, cash, … (`accounts`). Not Better Auth's `account` table, which holds password hashes (Drizzle export `authAccount`). |
| Category, subcategory | A label for income or expense. A subcategory has a parent and the parent's type; there is only one level.                                                      |
| Transfer              | Money moved between two of the book's accounts. It changes balances but is never income or expense.                                                            |
| Unknown transaction   | An income or expense without a category, shown with the «ناشناس» / “unknown” tag until someone picks one.                                                      |
| Source                | Where a transaction came from: `web`, `mcp` (Claude), `chatgpt` or `csv`.                                                                                      |
| Role                  | admin, editor or viewer: what a user may do. Read fresh from the user record on every request.                                                                 |
| Viewer's calendar     | Jalali or Gregorian, per user. Months, budgets and reports follow it, so two users can see different month boundaries.                                         |
| Smallest unit         | How amounts are stored: rials for IRR, cents or pence otherwise, as integers. Toman is only a way of showing rials.                                            |
| Copy                  | One self-hosted installation of Money: a fork, a Vercel project and a Neon database.                                                                           |
| Preview, `dev` branch | Neon database branches: one per preview deployment, and one for local development, so neither touches the real book.                                           |
