# Money: a personal accounting app in Persian and English

## What this is

Money is a personal accounting app with a Persian (right-to-left) and English (left-to-right) interface. Users record income, expenses and transfers by hand in the web app, or by talking to Claude, which saves them through the app's MCP connector. Built by Mohammad Reza Ghasemi.

- Two languages: Persian (the default and the design's language; RTL, Persian digits) and English (LTR, Latin digits), with next-intl and no locale in the URL (see Languages, calendars and currency).
- Each user picks their language, their calendar (Jalali or Gregorian) and, in an IRR book, whether amounts show in rial or toman.
- Light and dark themes.
- Several users, by invite only. There is no public sign-up. An admin creates accounts in the app.
- **One shared book.** All users work on the same accounts, categories, transactions and budgets. There is no per-user data. What a user can do depends on their role (see Roles).
- One book currency, chosen by an admin: Iranian rial (IRR), US dollar (USD), euro (EUR) or British pound (GBP). No exchange rates and no accounts in different currencies.

## Roles

| Role | Label (fa / en) | Read | Write | User management and book settings |
|------|-----------------|------|-------|-----------------------------------|
| `admin` | مدیر / Admin | ✓ | ✓ | ✓ |
| `editor` | ویرایشگر / Editor | ✓ | ✓ | ✗ |
| `viewer` | بیننده / Viewer | ✓ | ✗ | ✗ |

- **Read:** see every page with the book's data: dashboard, transactions, budgets, reports, accounts, categories. Export CSV.
- **Write:** create, edit and delete transactions, accounts, categories and budgets, and import CSV. Write includes read.
- **User management** (admins only): create users, reset passwords, disable and enable users, change roles. The page is `/admin/users` (see User management below).
- **Book settings** (admins only): the book's currency.
- Every user can change their own display name, password, language, calendar, rial or toman, and theme, and connect Claude.
- New users get `viewer` unless the admin picks another role (`DEFAULT_USER_ROLE`).
- The role is checked on the server for every page, Server Action, Route Handler and MCP tool call, read from the user record at that moment (a role change applies right away, also to already connected Claude sessions). Hiding controls in the UI is only a convenience: a viewer sees no add, edit or delete controls, but the server is what enforces it.
- Role names are in `src/constants/user.ts` (`USER_ROLES`); their labels are the `role` messages. What each role may do is in `src/helpers/role.ts` (`canWrite`, `canManageUsers`, and `toUserRole` for the plain string Better Auth stores), shared by the server checks, the MCP tools and the UI. The server checks are `requireUser()` (any role: reading, own settings), `requireWrite()` and `requireAdmin()` in `src/auth/session.ts`.

## User management

`/admin/users` (`UserManagement` in `src/components/user-management`, Server Actions in `src/app/(app)/admin/users/actions.ts`). Every action calls `requireAdmin()` first and validates its input with Zod; the user record and the role are read fresh each time.

- **Create:** display name, username, temporary password, role (default `viewer`) and language, through the Better Auth admin plugin's `createUser` with the admin's session headers. The calendar follows the language (`DEFAULT_CALENDAR`), as in `pnpm user:create`. The username plugin lowercases the username for sign-in, keeps the typed form as `display_username` and refuses a taken one (shown on the username field). The form's rules are `newUserSchema` (`src/helpers/new-user.ts`), shared by the form and the action; its messages are keys of `users.form.errors`.
- **Temporary passwords** are made on the server with `node:crypto` (`generateTemporaryPassword` in `src/helpers/user.ts`: three groups of four from an alphabet without look-alikes, «kT7m-Qx4p-Wz9r»). The new-user form asks for one when it opens (`generatePassword` action) and can ask for another; the admin may also type one. A reset makes one, sets it with the admin plugin's `setUserPassword` and returns it once to the dialog. Only Better Auth's hash is stored; the password is never logged or kept.
- **Reset password** also signs the user out everywhere (`revokeUserSessions`). An admin can't reset their own password here (they change it in settings, with the current one).
- **Change role** and **disable** run as one guarded SQL statement each (`setUserRole`, `disableUser` in `src/db/users.ts`): they lock the actor's and the target's rows (in id order) and write only while the actor is still an enabled admin and isn't the target. So an admin can't demote or disable themself, and two admins acting on each other at once can't leave the book without an admin: the last enabled admin always stays. The actions check self first for a clear message. Removing admin rights asks for confirmation.
- **Disable** (Better Auth's ban) deletes the user's sessions and their Claude connector grants and tokens (`revokeGrants`) in the same statement, so they are signed out and Claude loses access at once; banned users can't sign in and count as signed out in `getSession`. Disabled users stay in the database. **Enable** is the admin plugin's `unbanUser`; the toast after disabling offers «واگرد» / «Undo», which enables again.
- The list (`listUsers`) shows display name, username, role, language, status and creation date (the day in the viewer's time zone), with search and role and status filters on the client. A table from a 50rem-wide list (container query), cards below that. On the admin's own row the actions they can't take are disabled with a reason (Menu items' `description`).

## Accounts and categories

`/settings/accounts` (`AccountSettings` in `src/components/account-settings`) and `/settings/categories` (`CategorySettings` in `src/components/category-settings`), linked from the first section of `/settings` (`SettingsLinks`). Every role can open them; viewers get them without write controls and a «فقط مشاهده» badge. Server Actions in `src/app/(app)/settings/accounts/actions.ts` and `.../categories/actions.ts`: each calls `requireWrite()` first, validates with Zod and returns translated errors; adds, deletes, archiving and restoring offer «واگرد» in their toast (undoing a delete adds the item again under a new id).

- **Accounts** (`src/db/accounts.ts`): name (unique ignoring case), type (`card`, `cash`, `other`: only the icon and label, `ACCOUNT_TYPES`), starting balance (may be 0 or negative; AmountField `allowNegative`). The list shows the total of the active accounts and each account's live balance and transaction count. **Balances** come from `accountBalance()` (`src/helpers/account-balance.ts`): one SQL expression, opening + income − expense − transfers out + transfers in, summed in Postgres; never add balances up in JavaScript.
- **Order**: `sort_order`, set for the whole list in one statement (`reorderAccounts`). Drag by the handle from 768px up (native drag and drop), «انتقال به بالا / پایین» in the row menu everywhere. New accounts go to the end; archived ones keep their position. Forms list accounts in this order.
- **Archive** hides an account or category from forms (the transaction form leaves archived ones out, except the one an edited transaction already uses) and keeps its history; archived items are listed under «بایگانی‌شده» (`ArchivedSection`) with restore and delete.
- **Delete only when unused**, checked in the statement that deletes: an account without transactions (`deleteAccount`); a category or subcategory only when nothing in its family (the top-level category and all its subcategories) has transactions (`deleteCategories`), and a category goes with its subcategories. The page asks first, or explains why not and offers to archive. Budgets of a deleted category go with it (foreign key cascade).
- **Categories** (`src/db/categories.ts`): names unique per type and parent ignoring case (the server checks; the database's unique constraint catches exact duplicates), a color from the palette for top-level categories (`CategoryColorPicker`; a new category gets the first hue its siblings don't use, `nextCategoryColor`). Subcategories are created from their parent in one statement (`createSubcategory`), taking its type and color; recoloring a category recolors its subcategories. Archiving a category hides its subcategories without changing their own flag.
- **Starter categories**: `STARTER_CATEGORIES` (`src/constants/starter-categories.ts`), names in both languages, offered while a type has no active categories. `addStarterCategories` stores them (with their subcategories, in order, skipping names that exist) in one SQL statement in the acting user's language.
- Names are tidied before they are compared or saved (`tidyName` in `src/utils/text.ts`: Arabic «ي» «ك» to Persian, spaces collapsed, trimmed).
- **Raw SQL with Drizzle:** in a one-table query Drizzle writes columns without their table (`"id"`), so inside a correlated subquery an outer column must be qualified explicitly (`` sql`${accounts}.${sql.identifier("id")}` ``).

## Transactions

`/transactions` (`Transactions` in `src/components/transactions`, page in `src/app/(app)/transactions/page.tsx`). Every role reads; viewers get no add, edit or delete controls and a «فقط مشاهده» badge.

- **Queries** in `src/db/transactions.ts` (server-only). Like the other `src/db` files they don't check the role: the page calls `requireUser()`, every write action `requireWrite()`, and the MCP tools check the token's user before calling the same functions (`createTransactions`, `findSimilarTransactions` and `deleteTransactions` are their batch versions). Writes take the acting user's id for `created_by` / `updated_by` (from the session, never from input). `listTransactions(filters, cursor)` (with accounts, category and its parent, creator and last editor), `transactionTotals` (income, expense, count), `transactionDayTotals` (per day, for the day headers), `listTransactionTags` (most used first), `listTransactionOptions` (accounts, categories and tags for the form and filters), `checkTransactionReferences`, `createTransaction`, `updateTransaction`, `deleteTransaction` (returns what it stored, for undo).
- **Filters** (`TransactionFilters`): Gregorian date range, types, account (from or to), category (a top-level category includes its subcategories), tag, search (description, note, tags and category names; folded like `normalizePersian` in SQL, LIKE wildcards escaped) and unknown only. Column references in the filter SQL are qualified (`column()`), so the same conditions work in the joined list query and the one-table totals.
- **Speed:** keyset pagination on `(date, created_at, id)`, newest first, 50 rows a page (`TRANSACTION_PAGE_SIZE`), with the index `transactions_list_index` on the same three columns (migration `0004`). The cursor keeps `created_at` to the microsecond. Totals and day totals are summed in Postgres over the whole period, so a day split between pages still shows its full net. «نمایش بیشتر» calls `loadTransactions` (any role); after a change the page's refresh brings a new first page and the pages already shown are reloaded to match (`limit`).
- **URL:** the filters live in the search params (`src/helpers/transaction-filters.ts`): `month`, `from`, `to`, `type` (repeated), `account`, `category`, `tag`, `q`, `unknown=1`. `month` is `YYYY-MM` of the calendar its year belongs to (Jalali below 1700, Gregorian from 1700); a viewer with the other calendar sees that month as a date range. `from` / `to` replace the month. No period means the viewer's current month. `resolveTransactionPeriod` turns the month into a Gregorian range with `monthRange` before querying.
- **Form** (`TransactionDialog`, `src/components/transaction-dialog`): type, amount (focused on open), date (default today in the viewer's time zone, no future dates), account (from and to for a transfer), category with its subcategories (a category can be picked itself, «بدون زیردسته»; hidden for transfers), description, tags (`TagInput`, suggestions from the book's tags) and a note (collapsed). «ثبت و افزودن بعدی» keeps the type, account and date. Required for income and expense: a category. An empty description is saved as «؟».
- **Rules:** `transactionSchema(today, options)` in `src/helpers/transaction.ts` is shared by the form, the Server Actions and the MCP tools (which pass `categoryRequired: false`: Claude may save a transaction it can't place yet without a category) (`src/app/(app)/transactions/actions.ts`); `transactionErrors` gives each field's first error (also the rules between fields while another field is invalid). The actions then check in the database that the accounts and category exist, aren't archived (an edit may keep the archived ones it had) and the category has the transaction's type. Errors are translated on the server and come back on their field. Rows added here get `source = "web"`.
- **Undo:** adding offers «واگرد» (deletes it); deleting offers «واگرد» (`restoreTransaction` adds it again under a new id by the acting user, allowing the archived account or category it had). Editing shows «تغییرات ذخیره شد».
- **List** (`TransactionList`): grouped by day in the viewer's calendar («امروز، …», «دیروز، …») with each day's net; description or a «؟» mark with «ناشناس», category chip or the transfer's route («رسالت ← بلو»), account, tags, a Claude badge for `source = "mcp"`, the signed amount, and edit / delete for writers. Clicking a row opens `TransactionDetail` (who added it, «با Claude» for MCP rows, and who last edited it when that's someone else). From 62rem of list width (container query) the account gets its own column; on phones each row starts with a tile.
- **Global add:** the layout passes editors and admins `listTransactionOptions()` as a promise and the create / delete actions to `AppShell` → `AddTransactionProvider`, so the header button and the tab bar's floating button open the same form on every page without holding up the page.

## Budgets

`/budgets` (`Budgets` in `src/components/budgets`, page in `src/app/(app)/budgets/page.tsx`). Every role reads; viewers get no set, edit or remove controls and a «فقط مشاهده» badge.

- A budget is a monthly limit for a top-level expense category (one per category), repeating every month of the viewer's calendar. Subcategory spending counts toward its parent; transfers and income never count.
- **Month:** `?month=YYYY-MM`, read with the transactions page's `parseMonthParam`. `resolveBudgetMonth` (`src/helpers/budget.ts`) makes it a month of the viewer's calendar (a month of the other calendar becomes the viewer's month around its middle) with its Gregorian range (`monthRange`), its phase (past, current, future) and today's day in it. No param is the current month; the switcher drops the param there, goes into future months too (nothing spent yet), and «ماه جاری» / «This month» returns.
- **Query:** `listBudgetCategories(from, to)` (`src/db/budgets.ts`, server-only) reads every top-level expense category with its budget, its active subcategories' names and its expenses in the range in one SQL statement: expense transactions only, grouped by `coalesce(parent_id, id)` so subcategories roll up into their parent. The page's totals are the budgeted rows added up.
- **Writes:** `saveBudget` adds or changes a budget in one statement (`insert … select` from a top-level expense category that is active or already has a budget, `on conflict (category_id) do update`; `xmax = 0` tells whether it is new); `deleteBudget` returns what it removed, for undo. The Server Actions (`src/app/(app)/budgets/actions.ts`) call `requireWrite()` and validate with `budgetSchema` (shared with the form; messages are keys of `budgets.form.errors`). Setting a new budget and removing one offer «واگرد»; changing one shows «بودجه … ذخیره شد».
- **Page:** `BudgetSummary` (spent in the month, total budget, remaining or over, one bar for all of it with a line for today in the current month: ProgressBar's `marker`), `BudgetList` (most used first: chip, bar, percent, spent of limit, status; a table from 56rem of list width, cards below; each row links to `/transactions?month=…&category=…` through `budgetTransactionsHref`, and writers get an edit button), `UnbudgetedList` (active expense categories without a budget, what they spent, «تعیین بودجه»), `BudgetDialog` (category, fixed when editing; monthly limit; a note naming the subcategories that count; «حذف بودجه» opens a ConfirmDialog over it). The empty state follows the role; without expense categories it links to `/settings/categories`.
- A budget whose category is archived keeps its row (marked «بایگانی‌شده») and can be changed or removed; an archived category can't get a new budget.

## Claude connector (MCP)

Users add `https://<domain>/mcp` in Claude (Settings → Connectors → Add custom connector), sign in to Money once and allow access; Claude then works on the shared book as that user, with that user's role. The URL and the steps are on `/settings/connector` (and in the README).

- **Authorization server:** Better Auth's `mcp` plugin (the OAuth 2.1 provider, `@better-auth/mcp`), with `cimd` (`@better-auth/cimd`): Claude identifies itself with a Client ID Metadata Document (its `client_id` is a URL Money fetches), which claude.ai prefers when the metadata advertises it. There is no open dynamic client registration, and no one creates clients through the API (`clientPrivileges: () => false`). PKCE (S256) is required. Scopes: `money` (the MCP endpoint) and `offline_access` (refresh tokens); grants: authorization code and refresh token. The `jwt` plugin signs access tokens (its `/token` endpoint is in `disabledPaths`).
- **URLs** (`src/auth/urls.ts`): the app's URL is `BETTER_AUTH_URL`, on previews `https://$VERCEL_BRANCH_URL` (connect a preview through its branch URL). The MCP resource is `<app>/mcp` (locally `http://localhost:3000/mcp`: over plain HTTP only `localhost` is accepted, so `money.localhost` becomes `localhost`). The issuer is `<app>/api/auth`.
- **Discovery:** `/mcp` answers unauthenticated requests with 401 and `WWW-Authenticate: Bearer … resource_metadata=…`. `/.well-known/oauth-protected-resource/mcp` (RFC 9728) and `/.well-known/oauth-authorization-server/api/auth` (RFC 8414) are route handlers (`src/app/.well-known/`), with CORS for browser-based clients. The proxy leaves `/mcp` and `/.well-known/` alone.
- **Sign-in and consent:** Better Auth sends the browser to `/login` with a signed authorization request; the login page shows «Claude is asking to connect» and posts the request (`oauth_query`) with the sign-in, and Better Auth continues to `/oauth/consent` (`ConnectorConsent`, outside the app shell). The consent page shows who is signed in («تغییر حساب» signs out and back in), what Claude may do (follows the role: viewers read only) and where the answer goes, and posts the answer to `/api/auth/oauth2/consent`. `readOAuthRequest` (`src/auth/oauth.ts`) checks the request's signature for both pages. An existing consent skips the page.
- **MCP endpoint** (`src/app/mcp/route.ts`): `mcp-handler`'s `withMcpAuth` with `verifyMcpToken` (`src/mcp/auth.ts`): the JWT is verified with the signing keys read through `auth.api.getJwks()` (not over HTTP), for this issuer and audience; DPoP-bound tokens are refused. Then `checkMcpGrant` (`src/db/connector.ts`) checks in one statement that the user still allows the app (`oauth_consent`), marks it used (`last_used_at`, Money's own column) and reads the user fresh; banned users are refused. So revoking and disabling take effect on the next request, although access tokens are self-contained JWTs (an hour), and a role change applies right away.
- **Tools** (`src/mcp/tools.ts`, server instructions in `src/mcp/instructions.ts`, server built per request in `src/mcp/handler.ts`): `today`, `list_accounts` (balances), `list_categories` (with subcategories), `list_transactions` (filters, totals of every match, cursor), and for editors and admins only `add_transactions` (up to 100, all or none, with possible duplicates: same date, account, amount and type), `update_transaction` and `delete_transactions` (destructive hint). Viewers don't get the write tools, and the write tools re-read the role on every call (the MCP equivalent of `requireWrite()`, which needs a session cookie). They reuse the `src/db` queries and `transactionSchema` / `checkTransactionReferences`; errors for Claude are English texts in the tools, not messages. Rows added get `source = "mcp"`; `created_by` / `updated_by` are the token's user.
- **Dates and amounts at the boundary** (`src/helpers/connector.ts`): results use the user's calendar (Jalali `YYYY/MM/DD`, Gregorian `YYYY-MM-DD`). Input may be either: the year decides the calendar (below 1700 Jalali), so Claude copies a bank SMS date as it is and never converts calendars. Amounts are in the book currency's main unit (rials; dollars, euros, pounds with up to two decimals), converted to the stored smallest unit.
- **Time zone:** MCP requests have no browser, so `today` uses `user.time_zone`, which the app layout saves (after the response) when the browser's reported zone (TimeZoneSync's cookie) differs; otherwise Asia/Tehran.
- **Connected apps** (`/settings/connector`, `ConnectorSettings`): every role sees their own connections (`listConnections`: one per OAuth client, connected and last used days in the viewer's time zone) and can revoke one (`revokeConnection`: deletes its consent, refresh and access tokens in one statement).

## Languages, calendars and currency

| Setting | Values | Default | Who | Stored in |
|---------|--------|---------|-----|-----------|
| Language | `fa` (فارسی, RTL), `en` (English, LTR) | `fa` | each user | `user.locale` |
| Calendar | `jalali`, `gregorian` | by language: Jalali for Persian, Gregorian for English | each user | `user.calendar` |
| Rial or toman | `rial`, `toman` (IRR books only) | `rial` | each user | `user.rial_unit` |
| Theme | light, dark, system | system | each device | `localStorage` (`money-theme`) |
| Sidebar collapsed | expanded, collapsed (icon rail) | expanded | each device | `localStorage` (`money-sidebar`) |
| Currency | `IRR`, `USD`, `EUR`, `GBP` | `IRR` | admins, for the book | `book.currency` |
| Time zone | IANA name | the device's OS time zone (automatic, not a setting) | each device | `money-time-zone` cookie (and `user.time_zone`, the last one reported, for the Claude connector) |

- **Language for a request** (`resolveLocale` in `src/i18n/locale.ts`): the signed-in user's `locale`; signed out, the `money-locale` cookie, otherwise the browser's Accept-Language (`negotiateLocale`), otherwise Persian. `changeLocale` (`src/i18n/actions.ts`) sets the cookie and, when signed in, the user's `locale`; the login page has a small switch that calls it. The language decides `<html lang dir>`, the digits, the fonts and the copy.
- **Preferences** (`Preferences` in `src/types/preferences.ts`): the user's language, calendar and rial/toman, the book's currency, the device's time zone, and the derived `moneyUnit` (`rial`, `toman`, `USD`, `EUR`, `GBP`). Server: `getPreferences()` (`src/i18n/preferences.ts`, once per request). Client: `usePreferences()` (`src/hooks/use-preferences.ts`), filled by `Providers` from the root layout. Signed-out pages get the defaults for their language.
- **Time zone** follows each viewer's device: `TimeZoneSync` (`src/components/time-zone-sync`, in the root layout) saves the browser's OS time zone in the `money-time-zone` cookie and refreshes the page when it rendered with another one (first visit, travel, OS change). The server reads it in `resolveTimeZone` (`src/i18n/time-zone.ts`): the cookie, otherwise Vercel's `x-vercel-ip-timezone` header, otherwise `Asia/Tehran`. Two users in different time zones can see a different «today».
- **Week**: Jalali weeks start on Saturday with Friday as the weekend; Gregorian weeks start on Monday with Saturday and Sunday as the weekend (`WEEK_START`, `WEEKEND` in `src/constants/calendar.ts`).
- **Money units** (`MONEY_UNITS` in `src/constants/currency.ts`): stored units per shown unit (rial 1, toman 10, dollar/euro/pound 100) and decimals always shown (2 for dollars, euros, pounds; tomans show one only when the rials don't divide by ten).

## Features (full scope)

- Sign in with username and password (invite only)
- Roles: admin, editor, viewer (see Roles)
- Admin user management: create users, reset passwords, disable accounts, change roles
- Settings: profile, password, language (فارسی / English), calendar (Jalali / Gregorian), rial or toman (IRR books), theme (light / dark / system); for admins also the book's currency
- Accounts (bank cards, cash, …) with a starting balance and a live current balance
- Categories with one optional level of subcategories, separate for income and expense
- Transactions: income, expense and transfer between own accounts, with category, subcategory, account, tags, description and note
- Claude connector (MCP) with OAuth sign-in. Claude acts as the signed-in user with that user's role: everyone can read, editors and admins can also add, edit and delete transactions. Dates in the user's calendar, amounts in the book currency
- Budgets: a monthly limit per category, repeating every month of the viewer's calendar
- Reports: charts by category and by month
- Dashboard: balances, this month's totals, budget progress, recent transactions
- CSV import and export
- Later: one-time import of the `daily-transactions` data

## Tech stack

- **Framework:** Next.js with the App Router, React, TypeScript (strict mode). Chosen over Vite because the MCP endpoint, the OAuth server, sign-in and database access all live in the same project as Route Handlers and Server Actions, with no separate backend.
- **Database:** Postgres on Neon, connected through the Vercel Neon integration (env prefix `DATABASE`: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`). Production and Development use the main Neon branch, so **local development works on the production database**. Every Preview deployment gets its own Neon branch (copied from main). Local variables come from `vercel env pull .env.local`; `.env.example` lists them all.
- **Data access:** Drizzle ORM over the Neon serverless driver's HTTP mode (`drizzle-orm/neon-http`, `src/db/index.ts`): one stateless request per query, no interactive transactions (use `db.batch([...])` for writes that must succeed together). `casing: "snake_case"`: schema keys are camelCase, columns snake_case. Schema in `src/db/schema/` (one file per table group). Migrations with drizzle-kit in `drizzle/`, committed; generate with `pnpm db:generate` and never edit an applied migration. On Vercel the `vercel-build` script runs `drizzle-kit migrate` before `next build`, so every deployment migrates its own database (main branch for Production, its Neon branch for a Preview).
- **Auth:** Better Auth (self-hosted library, data in Neon, no paid service) with its username plugin (sign-in by username and password), admin plugin (user management) and OAuth 2.1 provider / MCP plugin (the Claude connector). Check the current Better Auth docs for the plugin names before using them: the MCP plugin is being replaced by the OAuth Provider plugin. Setup in `src/auth/index.ts`:
  - Drizzle adapter, UUID ids (`generateId: "uuid"`). The Better Auth tables are written by hand in `src/db/schema/auth.ts`; when a plugin adds fields, add them there.
  - No sign-up: `emailAndPassword.disableSignUp`, and `/sign-up/email`, `/sign-in/email` and `/is-username-available` are in `disabledPaths`. Users are created by an admin on `/admin/users` (admin plugin) or with `pnpm user:create`. Better Auth requires an email, so users get a random `…@users.money.invalid` address (`placeholderEmail` in `src/helpers/user.ts`) that is never shown.
  - Roles `admin`, `editor` and `viewer` (admin plugin `roles`: `admin` gets the plugin's user management permissions, `editor` and `viewer` get none; default `viewer`). Banned users can't sign in (checked after the password, so a wrong password never reveals the account) and count as signed out in `getSession`.
  - Sign-in rate limit: 5 attempts per IP per 5 minutes (`SIGN_IN_LIMIT`), stored in the `rate_limit` table so it holds across serverless instances. Rate limits only apply to HTTP calls to `/api/auth`, so the login form posts to `/api/auth/sign-in/username` (`signInWithUsername` in `src/helpers/sign-in.ts`), not to a Server Action.
  - `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in env. Previews leave `BETTER_AUTH_URL` unset and accept their own `VERCEL_URL` / `VERCEL_BRANCH_URL` hosts.
  - The OAuth 2.1 provider for the Claude connector: `jwt`, `mcp` and `cimd` plugins (see Claude connector).
- **MCP:** `mcp-handler` + `@modelcontextprotocol/server` (same as `daily-transactions`), behind OAuth bearer tokens issued by Better Auth (`@better-auth/mcp`, `@better-auth/cimd`, see Claude connector). `@better-auth/utils` is a direct dependency pinned to the version Better Auth's core expects, so the plugins share one copy of `@better-auth/core`.
- **i18n:** next-intl without i18n routing: the locale comes from the user record (signed in) or the `money-locale` cookie, then Accept-Language (signed out), never from the URL. Request config in `src/i18n/request.ts`, wired with the next-intl plugin in `next.config.ts`. Messages are typed (`AppConfig` in `src/i18n/types.d.ts`).
- **Validation:** Zod for every form, Server Action input, MCP tool input and CSV row.
- **UI primitives:** Base UI (`@base-ui/react`, unstyled). Use it for interactive parts like Dialog, Menu, Popover, Select, Combobox, Tooltip, Tabs, Switch, Checkbox.
- **Styling:** CSS Modules + CSS custom properties as design tokens. No Tailwind. No component libraries (no shadcn/ui, no MUI).
- **Icons:** lucide-react
- **Charts:** chosen in Phase 8 (Reports)
- **Design system docs:** Storybook
- **Formatting:** Prettier (default options) with `eslint-config-prettier`
- **Hosting:** Vercel. Two projects from this one repo: `money` (the app) and `money-storybook` (the design system docs, https://money-storybook.vercel.app: Storybook preset, `pnpm build-storybook`, output `storybook-static`), same as `orange` / `orange-storybook`.
- **Tests:** not in scope yet. Planned later. Write code that is easy to test (small pure functions, data logic separate from UI).

## Data rules

- **One shared book, no `user_id` on financial data.** `accounts`, `categories`, `transactions` and `budgets` belong to the book, not to a user. Queries don't filter by user; access is controlled by role (see Roles).
- **Who did it.** Transactions record `created_by` and `updated_by` (user ids). The acting user always comes from the session (web) or the OAuth token (MCP), never from client input.
- **Dates are stored as Gregorian.** A transaction's date is a Postgres `date` (`YYYY-MM-DD`, no time zone). Timestamps (`created_at`, `updated_at`) are `timestamptz`. Never store Jalali dates.
- **Calendars only at the edges.** Dates travel through the app as ISO strings. Convert to the user's calendar (Jalali or Gregorian) only:
  - in UI components that show or pick a date (`DateText`, `Calendar`, `DatePicker`), and
  - at the MCP boundary: tools return dates in the signed-in user's calendar, Jalali `YYYY/MM/DD` or Gregorian `YYYY-MM-DD`, and take either (the year tells the calendar), because bank SMS use Jalali and LLMs are unreliable at Jalali calendar math. The MCP layer converts before reading or writing the database (`src/helpers/connector.ts`).
- **The viewer's calendar months drive periods.** "This month", budgets and monthly reports use the months of the viewing user's calendar, so two users with different calendars see different month boundaries. `monthRange` in `src/utils/calendar.ts` turns a month into a Gregorian date range for queries.
- **Today** is the current date in the viewer's device time zone (`Preferences.timeZone`): `todayIso(timeZone)`. MCP has no browser: it uses the time zone the user's browser last reported (`user.time_zone`), otherwise Asia/Tehran.
- **Amounts** are integers in the book currency's smallest unit (`bigint`): rials for IRR, cents or pence for USD, EUR and GBP. Transaction and budget amounts are positive; the transaction type gives the direction. Toman is only a way of showing and typing IRR amounts (1 toman = 10 rials); the stored value is always rials. Format with the helpers in `src/helpers/money.ts` (`formatMoney`, `formatMoneyNumber`) or the `Amount` component, never by hand. Amount inputs accept Persian, Arabic and Latin digits, and «.» or «٫» before decimals when the unit has them; with `allowNegative` (starting balances only) a leading «-» or «−».
- **The book currency** can change only while the book holds no amounts: no transactions, no budgets and every opening balance 0. Changing it later would silently reinterpret every stored number. `setBookCurrency` (`src/db/book.ts`) checks and upserts in one SQL statement (`insert … select … where not <holds amounts> on conflict do update`), so an amount recorded in between can't slip past; `bookHoldsAmounts` tells the settings page to show the currency locked.
- **Unknown transactions:** a description of `؟` (or empty) marks a transaction that still needs to be identified, as in `daily-transactions`. The form saves an empty description as `؟` (`UNKNOWN_DESCRIPTION`); `isUnknownDescription` also accepts empty and «?».

### Data model

| Table | Main columns |
|-------|--------------|
| Better Auth tables | `user` (with `username`, `display_username`, `role` (`admin` \| `editor` \| `viewer`), `banned`, and Money's preference fields `locale` (`fa` \| `en`), `calendar` (`jalali` \| `gregorian`), `rial_unit` (`rial` \| `toman`), `time_zone`), `session`, `account` (the password hash; Drizzle export `authAccount`, not to be confused with `accounts`), `verification`, `rate_limit`, and in `src/db/schema/oauth.ts` the JWT and OAuth provider tables: `jwks`, `oauth_client`, `oauth_consent` (with Money's `last_used_at`), `oauth_refresh_token`, `oauth_access_token`, `oauth_resource`, `oauth_client_resource`, `oauth_client_assertion` |
| `book` | One row (`id` 1): `currency` (`IRR` \| `USD` \| `EUR` \| `GBP`). No row until an admin first saves the settings; until then `DEFAULT_BOOK_SETTINGS` (IRR) applies (`getBookSettings` in `src/db/book.ts`) |
| `accounts` | `id`, `name` (unique ignoring case), `type` (`card` \| `cash` \| `other`), `opening_balance` (smallest unit, may be 0 or negative), `archived`, `sort_order` |
| `categories` | `id`, `type` (`income` \| `expense`), `name`, `color`, `parent_id` (null for a category, set for a subcategory), `archived` |
| `transactions` | `id`, `type` (`income` \| `expense` \| `transfer`), `date`, `amount`, `account_id`, `to_account_id` (transfers only), `category_id` (category or subcategory; null for transfers, optional otherwise), `description` and `note` (`''` when empty), `tags` (`text[]`), `source` (`web` \| `mcp` \| `csv`), `created_by`, `updated_by` (user ids), `created_at`, `updated_at` |
| `budgets` | `id`, `category_id` (top-level expense category), `amount` (smallest unit, per month) |

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

## Design system

- **Brand:** name "Money": wordmark «پول» in the Persian interface (as in the old `money` project, now `money-old`), «Money» in the English one (`metadata.appName` message).
- **Look:** modern and calm, inspired by the Kanvas design system in Claude Design. Primary color is Kanvas royal blue `#223BB2` (`royal-600`), with a cool slate neutral tinted toward it and royal-tinted shadows. Flat stacked surfaces (page → card → raised), no gradients, no illustrations.
- **Logo:** Lucide's wallet glyph in white on a royal rounded tile, plus the wordmark («پول» / «Money») at weight 800. `Logo` and `LogoMark` in `src/components/ui/`, favicon in `src/app/icon.svg`, iOS icon in `src/app/apple-icon.tsx`.
- **Tokens** live in `src/styles/tokens/` and are the only source of colors, type, spacing, radius, shadows and motion:
  - Colors: raw ramps (`--royal-*`, `--slate-*`, accent hues) plus semantic aliases. Components use only the aliases: `--surface-*`, `--border-*`, `--text-*`, `--brand-*`, `--status-*`, `--amount-*`, `--budget-*`, `--cat-*`. Light on `:root` and `[data-theme="light"]`; `[data-theme="dark"]` re-points the aliases.
  - Type roles as `font` shorthands: `font: var(--type-body)` (`display`, `title-lg`, `title`, `heading`, `body-md`, `body`, `label`, `control`, `caption`, `eyebrow`, `amount-hero`, `amount-lg`, `amount`). 12px floor; never letter-space Persian. `:root:lang(en)` swaps `--font-sans` and `--font-features-tabular`, and the roles follow.
  - Categories: 10 hues + slate (`src/constants/category.ts`), each `--cat-<hue>` (dot), `-soft` (fill) and `-text` (label). A category is never shown by color alone.
  - Focus is a 3px ring drawn with `box-shadow: var(--shadow-focus)` (danger controls: `--shadow-focus-danger`).
- **Fonts** (`src/styles/fonts.ts`, both variables on `<html>`):
  - Persian interface: Dana for everything (variable, `dana-variable.woff2`, copied from `daily-transactions`, `next/font/local`, `--font-dana`). Dana's default weight is 10 (hairline): every text style must set a weight. Declare `weight: "10 900"`.
  - English interface: Plus Jakarta Sans (Kanvas's text face, `next/font/google`, `--font-jakarta`, weights 200–800), with Dana as the fallback for Persian text such as names and categories.
  - Tabular digits in amounts, dates and columns of numbers: `font-feature-settings: var(--font-features-tabular)` (helper class `.tabular`). It is `"ss03"` for Dana (no `tnum`) and `"tnum"` in English.
  - Never use Dana's `ss02` (it draws Latin digits as Persian glyphs and breaks copy and screen readers). Persian digits come from `Intl.NumberFormat("fa-IR")` (`formatNumber` in `src/utils/number.ts`).
- **Direction:** `<html lang dir>` follows the language (`fa` → `rtl`, `en` → `ltr`, `LOCALE_DIRECTIONS`), and Base UI's `DirectionProvider` (in `src/components/providers`) follows it for keyboard navigation and popup placement. Every layout must work in both directions. Use CSS logical properties only (`margin-inline-start`, `inset-inline-end`, `text-align: start`, …), never `left`/`right`. Where an element forces `direction: ltr` (number inputs), align it against the page's start edge with `:global(html[dir="rtl"])`.
  - Directional icons (back/forward arrows and chevrons) are written in LTR terms (`ChevronLeftIcon` = back) and get the global `mirror-rtl` class (`mirrorIcon` / `mirrorIcons` props on IconButton and Button), so they point the right way in either direction. Money-direction icons (`ArrowUpIcon`, `ArrowDownIcon`, `ArrowLeftRightIcon`) are direction-neutral and never mirrored.
- **Themes:** light and dark, both defined as tokens. Users choose light, dark or system (follow the OS) in settings and in the user menu (`useThemePreference`, `setThemePreference` in `src/utils/theme.ts`; «system» clears the saved choice). No flash of the wrong theme on load (inline script in `<head>` sets `data-theme` from the saved choice, otherwise the OS setting), same setup as `orange`.
- **App shell** (`AppShell`, `src/components/app-shell`, rendered by `src/app/(app)/layout.tsx` around every signed-in page): a skip link to `#main`; from 768px up the `Sidebar` on the start side (logo, sections, `UserMenu`); on phones the `TopBar` (logo, back on non-tab pages: to the section for a subpage such as `/settings/accounts`, otherwise to the dashboard; settings, user menu) and the fixed `TabBar` with the floating add button. Each part hides itself at the other breakpoint with CSS.
  - The sections are `NAV_ITEMS` (`src/constants/navigation.ts`: label = `nav` message key, href, icon, `tab`, `adminOnly`), filtered by `getNavItems(role)` and marked active by `isNavItemActive` (`src/helpers/navigation.ts`, subpages count: `/settings/accounts` → Settings). The layout passes the role from the user record; the pages check it again.
  - The sidebar collapses to an icon rail (tooltips show the labels). The choice is saved in `localStorage` (`money-sidebar`); an inline `<head>` script (`SIDEBAR_SCRIPT`) sets `<html data-sidebar="collapsed">` before the first paint, and CSS draws the rail from that attribute (`:global(html[data-sidebar="collapsed"])`), so it never flashes open. `useSidebarCollapsed` gives components the same value.
  - Add transaction: `AddTransactionProvider` (enabled for editors and admins) holds the form, a Dialog from 768px up and a Sheet on phones (`useMediaQuery(MOBILE_QUERY)`). `AddTransactionButton` goes in page headers (hidden on phones), the tab bar's floating button opens the same form (`TransactionDialog`, see Transactions).
  - Forms and confirmations opened from a page use `ResponsiveDialog` (`src/components/responsive-dialog`: a Dialog from 768px up, a Sheet on phones; `initialFocus` puts the focus on a form's first field) or `ConfirmDialog` (cancel plus one button that names the outcome).
  - Pages start with `PageHeader` (h1 title = the nav label, subtitle, actions). Unbuilt pages show `PagePlaceholder`. `loading.tsx` shows `PageSkeleton`, `error.tsx` `PageError` (retry), `not-found.tsx` `PageNotFound`, all inside the shell; the `[...rest]` catch-all sends unknown paths to that not-found page. Page titles are `<nav label> | پول` / `<nav label> | Money` (the root layout's title template).
- **Money semantics:** income and expense must be told apart by sign and wording too, not by color alone.
  - Income: green, `+`, ↓ `ArrowDownIcon`, «درآمد» / «Income». Expense: red, `−` (U+2212), ↑ `ArrowUpIcon`, «هزینه» / «Expense». Transfer: royal, no sign, ⇄ `ArrowLeftRightIcon`, «انتقال» / «Transfer». Balances: neutral text, `−` only when negative. The `Amount` component does all of this.
  - Numbers in amounts are an isolated left-to-right run (`<bdi dir="ltr">`). Persian: Persian digits, «٬» (U+066C) thousands, «٫» (U+066B) decimals, «٪» percent. English: Latin digits, «,», «.», «%».
  - Unit marks (`MONEY_UNIT_SYMBOLS`): Persian writes the unit's name after the number («۲٬۵۰۰٬۰۰۰ ریال», «… تومان», «… دلار», «… یورو», «… پوند»); English writes «$», «€», «£» before it, inside the left-to-right run, after the sign («−$1,234.56»), and «rial» / «toman» after it.
  - Budgets: ok (royal) → near the limit from 80% (amber, ⚠, «نزدیک به سقف») → over (red with diagonal stripes, «… بیش از بودجه»). `getBudgetStatus` in `src/helpers/budget.ts`.
- **Dates in the UI** (`formatDate` in `src/utils/calendar.ts`, the `DateText` component): long «۹ مهر ۱۴۰۵» / «9 Mehr 1405» / «1 October 2026» (Persian Gregorian: «۱ اکتبر ۲۰۲۶»), weekday «پنج‌شنبه ۹ مهر ۱۴۰۵» / «Thursday, 1 October 2026», «امروز» / «دیروز» (Today / Yesterday) in lists, numeric «۱۴۰۵/۰۷/۰۹» / «2026/10/01» only in dense tables. Month and weekday names are written out in `src/constants/calendar.ts`, not taken from Intl. The month grid starts the week and tints the weekend per calendar (see Languages, calendars and currency). `AmountField` takes and returns the stored integer (rials or cents); `Calendar` and `DatePicker` take and return ISO date strings.
- **Copy:** every string the user sees comes from the messages (see Conventions). Calm and short in both languages. No emoji. Claude is written «Claude», in Latin.
  - Persian: polite plural. Buttons are verbs that name the outcome («ثبت هزینه», never «تأیید»); cancel is always «انصراف». Labels are nouns without a colon. Errors are one specific sentence ending with a period, no exclamation mark. Toasts confirm in past tense and offer «واگرد» after add/delete.
  - English: sentence case. Buttons are verbs that name the outcome («Add expense», never «OK»); cancel is always «Cancel». Labels are nouns without a colon. Errors are one specific sentence ending with a period, no exclamation mark. Toasts confirm in past tense («Transaction added») and offer «Undo» after add/delete. Use typographic apostrophes («Couldn’t»).
- **Motion:** `--ease-out` for nearly everything, `--ease-lift` only for things that pop (checkbox tick, switch thumb, dialog and toast entry). 120ms color, 180ms position, 260ms overlays. Everything collapses under `prefers-reduced-motion` (in `base.css`).
- **Icons:** lucide-react, sized with `--icon-size-*` tokens. Import the `*Icon` export (`WalletIcon`, not `Wallet`).
- **Breakpoints:** 480 / 768 / 1024 (`--small-phone`, `--mobile` below 768, `--tablet-up`, `--desktop`), plus `--short-screen` (height below 600px: on phones, the keyboard is open; the login page uses `interactive-widget=resizes-content` so the keyboard shrinks the layout). Below 768 is the phone layout: taller controls (40/48/52px), 44px tap targets, bottom sheets instead of dialogs. `@custom-media` rules in `src/styles/media.css`, injected into every CSS file by PostCSS (`@csstools/postcss-global-data` + `postcss-custom-media`), as in `orange`. JavaScript uses the same values from `src/constants/media.ts`.
- **Accessibility:** WCAG AA contrast in both themes, visible keyboard focus, respect `prefers-reduced-motion`, correct `lang` and `dir` (set `lang` on text in the other language, like the language switch).

## Conventions

- **Folder layout:** the repo root is this `money` folder. All app code lives in `src/` (the App Router is in `src/app`). Config files stay at the repo root. Never create a nested project folder (no `money/money`).
- **Components:** design system components (from the Claude Design handoff) live in `src/components/ui/`. Feature components live directly in `src/components/`. Storybook titles follow the folder: `Design system/<Name>` for `ui/`, `Components/<Name>` for feature components. Each component gets one lowercase folder with `index.tsx`, `styles.module.css`, `index.stories.tsx` (and `spec.test.tsx` once testing starts).
- **Props types:** extend native element props with `ComponentProps<"button">` (React 19). `ref` is a normal prop, so no `forwardRef`.
- **Copy and translations:** no user-facing text in components. Every string is a message in `src/messages/fa.ts` (the source; it defines the `Messages` type) and `src/messages/en.ts` (typed as `Messages`, so a missing or extra key fails the type check). Use `useTranslations` in client components and non-async Server Components, `getTranslations` in async Server Components, `generateMetadata` and Server Actions (errors returned to the user are translated on the server). Messages use ICU syntax (`{amount}`); pass already formatted numbers and amounts. Group keys by feature (`login`, `budget`, …) with shared words in `common`. Sample data in stories (names, categories) may stay Persian.
- **Formatting:** formatting functions are pure and take the language, calendar or unit explicitly (`formatDate`, `formatMoney`, `formatNumber`). Components that show amounts or dates read them from `usePreferences()` / `useLocale()` and are client components (`Amount`, `DateText`, `ProgressBar`, …); they accept a `unit` or `calendar` override for stories.
- Use Server Components by default. Add `"use client"` only when a component needs state, effects or browser APIs.
- Mutations from the web UI use Server Actions that validate input with Zod and check the session.
- **Auth checks:** every page and Server Action calls `requireUser()`, `requireWrite()` or `requireAdmin()` from `src/auth/session.ts` (or `getSession()` when signed-out visitors are fine). The MCP endpoint checks its bearer token instead (`src/mcp/auth.ts`). `src/proxy.ts` only redirects visitors without a session cookie to `/login?next=<path>`; it never replaces the check in the page or action. `requireWrite()` answers viewers with not-found, and `requireAdmin()` answers non-admins with not-found. Redirect targets from the URL go through `getSafeRedirect` (`src/utils/url.ts`).
- **Server Actions** live next to the code they belong to, in an `actions.ts` with `"use server"` (`src/auth/actions.ts`: `signOut`; `src/app/(app)/settings/actions.ts`: profile, password, display preferences, book currency; `src/app/(app)/admin/users/actions.ts`: user management). Pages pass them to client components as props (`onSave`, `onSignOut`, …), so stories can pass fakes. Form actions take `unknown`, parse it with Zod and return `ActionResult` (`src/types/action.ts`): `{ ok: true }` (plus data when the action hands something back, such as a temporary password) or a translated `error`, with the `field` it belongs to when there is one. After a change that affects the page they call `refresh()` from `next/cache`.
- Use design tokens (CSS variables) for all colors, spacing, radius, fonts and shadows. No hard-coded values in component CSS. Part-specific sizes go in `src/styles/tokens/components.css`.
- **Layers** (`--z-*` in `tokens/components.css`): shell bars 20, overlays (Dialog, Sheet) 100, popups (Select, Combobox, Menu, DatePicker, Popover) 150, toasts and tooltips 200. Popups sit above overlays because forms in dialogs open them.
- **Shared component styles** that several components use are CSS Modules in `src/styles/`: `control.module.css` (the input box of TextField, AmountField, Select, Combobox, DatePicker, …), `menu.module.css` (popup lists of Select, Combobox and Menu), `choice.module.css` (label next to Checkbox, Switch, Radio) and `list.module.css` (rows of the accounts and categories lists: tile, name, quiet line, end).
- **Storybook** has toolbars for theme, language (فارسی RTL / English LTR), calendar and money (IRR rial, IRR toman, USD, EUR, GBP). Check new components in both languages.
- **Base UI:** interactive design system components wrap Base UI parts and style them with `data-*` state attributes (`[data-checked]`, `[data-highlighted]`, `[data-invalid]`, `[data-starting-style]`, …). `Providers` (`src/components/providers`) wraps the app and every story: `DirectionProvider`, the shared tooltip delay and the toast viewport (`useToast()` from `src/components/ui/toast`).
- **Forms:** put controls inside `Field` (Base UI Field), which wires the label, hint and error to the control. Controls that aren't Base UI fields (`DatePicker`) take an `id` that you also pass to Field's `htmlFor`.
- **Server-only code** (`src/db/`, `src/auth/`, `src/mcp/`) imports `server-only`.
- **Types, constants, utils and helpers** go in their own top-level folders, one file per topic:
  - `src/types/`: shared TypeScript types
  - `src/constants/`: fixed data and config
  - `src/utils/`: generic functions that would work unchanged in another project (for example `cx`, Jalali conversion, digit normalizing)
  - `src/helpers/`: functions specific to Money and its data (for example account balance, money formatting, preferences)
  - `src/hooks/`: React hooks that aren't tied to one component (for example `useControllableState`)

## Project structure

```text
src/
  proxy.ts              Redirects visitors without a session cookie to /login (optimistic only)
  app/                  App Router: layout (lang/dir, theme and sidebar scripts, Providers), icon.svg, apple-icon.tsx, globals.css
    login/              Sign-in page (also Claude's sign-in, with the signed OAuth request)
    oauth/consent/      The OAuth consent page for Claude
    mcp/                The MCP endpoint (route.ts: withMcpAuth + the tools)
    .well-known/        OAuth protected resource and authorization server metadata
    (app)/              Signed-in pages inside the app shell: layout.tsx (AppShell), loading, error, not-found,
                        page.tsx (dashboard), transactions (+ actions.ts, loading.tsx, error.tsx), budgets
                        (+ actions.ts, loading.tsx, error.tsx), reports, settings (+ actions.ts;
                        accounts/, categories/ and connector/ with actions.ts, loading.tsx, error.tsx), admin/users
                        (+ actions.ts, loading.tsx),
                        [...rest] (unknown paths → not-found in the shell)
    api/auth/[...all]/  Better Auth handler
  auth/                 Better Auth config (index.ts), getSession / requireUser / requireWrite / requireAdmin (session.ts), signOut (actions.ts),
                        the connector's URLs (urls.ts), readOAuthRequest (oauth.ts)
  mcp/                  The Claude connector: token check (auth.ts), tools (tools.ts), instructions, per-request server (handler.ts)
  db/                   Drizzle client (index.ts), schema/ (auth, oauth, book, accounts, categories, transactions, budgets),
                        queries: book.ts (getBookSettings, bookHoldsAmounts, setBookCurrency), users.ts
                        (updateUserPreferences, listUsers, getUserStatus, setUserRole, disableUser), accounts.ts,
                        categories.ts, transactions.ts (list, totals, tags, options, create / update / delete),
                        budgets.ts (listBudgetCategories, saveBudget, deleteBudget),
                        connector.ts (checkMcpGrant, listConnections, revokeConnection, revokeGrants),
                        errors.ts (isUniqueViolation)
  i18n/                 next-intl request config (request.ts), resolveLocale (locale.ts), resolveTimeZone
                        (time-zone.ts), getPreferences (preferences.ts), changeLocale (actions.ts), typed messages
                        (types.d.ts)
  messages/             Interface copy: fa.ts (source, Messages type), en.ts, index.ts (MESSAGES)
  components/
    ui/                 Design system: one folder per component (index.tsx, styles.module.css, index.stories.tsx)
                        logo, logo-mark, button, icon-button, tooltip, field, text-field, textarea, amount-field,
                        search-field, select, combobox, checkbox, switch, radio-group, segmented-control, calendar,
                        date-picker, date-text, dialog, sheet, menu, popover, toast, skeleton, empty-state, card,
                        badge, tag, tag-input, category-chip, avatar, divider, amount, progress-bar, foundations
                        (Storybook only)
    login/              The sign-in screen (Components/Login)
    app-shell/          The frame of signed-in pages: skip link, sidebar, top bar, tab bar, add-transaction form
    sidebar/, top-bar/, tab-bar/, user-menu/   Its parts (desktop sidebar and rail; phone top and bottom bars;
                        the account menu with settings, theme and sign-out)
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
    page-header/, page-placeholder/, page-skeleton/, page-status/   Page building blocks (title, unbuilt page,
                        loading, error and not-found)
    user-management/    The /admin/users page: user-list/ (table and cards, filters, row menu), new-user-dialog/,
                        role-dialog/, reset-password-dialog/ (confirm, then the password once)
    responsive-dialog/, confirm-dialog/   Dialog on larger screens, Sheet on phones; a confirmation with one action
    account-settings/, category-settings/   The /settings/accounts and /settings/categories pages (+ skeleton, error)
    account-list/, account-dialog/   Account rows (drag handle, row menu, archived rows) and the add / edit form
    category-list/, category-dialog/, category-color-picker/, starter-categories/   Category rows with
                        subcategories, the category / subcategory form, the palette swatches, the suggestions
    archived-section/   «بایگانی‌شده (n)» toggle with the archived rows
    settings-links/     The /settings sections that link to accounts, categories and the Claude connector
    settings/           The /settings sections: profile-settings/, password-settings/, display-settings/,
                        book-settings/ (admins)
    connector-settings/, connector-consent/   The /settings/connector page and the OAuth consent page
    providers/          next-intl, preferences, Base UI direction, tooltip delay group, toast viewport
    theme-sync/         Re-applies the theme after hydration and follows OS / other-tab changes
    time-zone-sync/     Saves the device's OS time zone in a cookie and re-renders when it changed
  constants/            account (types, name length), account-icons, auth (sign-in limit, login path), book (default
                        settings), calendar (names, week start), category, connector (paths, scope, tool limits), currency (units, symbols), locale, media
                        queries, navigation (NAV_ITEMS), sidebar (storage key, script), starter-categories, theme
                        script, time zone, transaction (types, sources, «؟», limits, page size), transaction-icons,
                        user
  helpers/              account form rules, account balance SQL (accountBalance), budgets (status, form rules,
                        month, transactions link), category color
                        style and name rules, money formatting and input, navigation (getNavItems,
                        isNavItemActive), new-user form rules (newUserSchema), preferences, role permissions,
                        connector (dates and amounts at the MCP boundary), oauth-consent (consent requests),
                        sign-in request (and the signed OAuth query), transaction form rules (transactionSchema), transaction filters (URL
                        params, period), user (placeholder email, temporary password)
  hooks/                useClipboard, useControllableState, usePreferences, useMediaQuery, useSidebarCollapsed,
                        useThemePreference
  styles/
    tokens/             colors, typography, spacing, radius, shadows, motion, components
    base.css            element defaults, focus ring, mirror-rtl, reduced motion
    typography.css      type helper classes (.type-*, .tabular, .ltr, .visually-hidden)
    media.css           @custom-media breakpoints
    control.module.css, menu.module.css, choice.module.css, list.module.css   shared component styles
    fonts.ts, fonts/    Dana via next/font/local
  types/                account, action (ActionResult), book, budget, calendar, category, connector, currency, locale, navigation, preferences,
                        theme, transaction, user
  utils/                calendar (both calendars, formatDate), cx, duration, env, focus, iso-date, jalali (math),
                        locale (Accept-Language), metadata (CORS for public metadata), number, sidebar (collapsed
                        state), text, theme, url
drizzle/                SQL migrations generated by drizzle-kit (committed)
docs/                   phases.md (the plan: prompts per phase), building-with-claude.md (the development log)
scripts/                create-user.ts (`pnpm user:create`)
```

## Workflow

1. Design one phase in Claude Design.
2. Send it to Claude Code with the "Send to Claude Code" button, together with that phase's Claude Code prompt from `docs/phases.md`.
3. Implement only that phase.
4. Add the phase to `docs/building-with-claude.md` (see below).
5. Commit on the phase branch and open a PR.
6. Merge when `build`, `lint`, type check and format check pass (tests are added later).
7. Move to the next phase.

Phases without UI (0a) run in Claude Code only.

- **Git:** project setup (Phase 0a) is committed directly on `main`. Every phase after that gets its own branch created from `main`.
- **Approval before committing:** never commit without asking first. Show the changed files and the proposed commit message(s), then wait for an explicit OK. An earlier approval does not cover later commits. The same applies to pushing and to creating the GitHub repo.
- **Branch names:** [Conventional Branch](https://conventionalbranch.org/): `<type>/<description>` with types `feature/`, `bugfix/`, `hotfix/`, `release/`, `chore/`. Lowercase letters, numbers and hyphens only. Phase branches use `feature/phase-<number>-<short-name>`.
- **Commit messages:** [Conventional Commits](https://www.conventionalcommits.org/): `<type>: <description>`.
- The PR description summarizes what the phase added.
- No hand-written design spec files. The design comes from the Claude Design handoff.
- **Development log:** `docs/building-with-claude.md` records how the app is built with Claude. Every phase, and every change outside the plan, adds a section in the same PR: the Claude Design prompt, the Claude Code prompt as it was actually sent (with the design file link and any differences from `docs/phases.md`), the questions Claude asked with their answers, the follow-up messages in order, and what the PR added. Also update its timeline table. Replace other people's usernames and anything secret with placeholders.
- When a decision changes, update this file in the same PR.

## Phases

The full plan with the Claude Design and Claude Code prompts for every phase is in `docs/phases.md`. The prompts actually sent, phase by phase, are in `docs/building-with-claude.md`.

| # | Phase | Status |
|---|-------|--------|
| 0a | Project setup (on `main`): Next.js, TypeScript, ESLint, Prettier, packages, Storybook, Dana font | Done |
| 0b | Design system: logo, tokens, themes, RTL, base components, Storybook, first Vercel deploy | Done |
| 1 | Database and sign-in: Neon, Drizzle, Better Auth, login page, first admin | Done |
| 1b | Languages and currency: Persian and English, Jalali and Gregorian, book currency, rial or toman (foundation; the settings UI is in Phase 2) | Done |
| 2 | App shell: sidebar, mobile bottom bar, theme toggle, user menu, placeholder routes, settings | Done |
| 3 | User management (admin) | Done |
| 4 | Accounts and categories | Done |
| 5 | Transactions | Done |
| 6 | Claude connector (MCP + OAuth) | Done |
| 7 | Budgets | Done |
| 8 | Reports | Not started |
| 9 | Dashboard | Not started |
| 10 | CSV import and export | Not started |
| 11 | Import from `daily-transactions` | Later |
| 12 | Tests | Later |

## Routes (planned)

| Route | Page | Phase |
|-------|------|-------|
| `/login` | Sign in | 1 |
| `/` | Dashboard (داشبورد) | 2 (placeholder until 9) |
| `/transactions` | Transactions (تراکنش‌ها) | 5 |
| `/budgets` | Budgets (بودجه), `?month=` | 7 |
| `/reports` | Reports (گزارش‌ها) | 2 (placeholder until 8) |
| `/settings` | Settings (تنظیمات): profile, password, language, calendar, rial or toman, theme; book currency (admins) | 2 |
| `/settings/accounts` | Accounts (viewers read only) | 4 |
| `/settings/categories` | Categories (viewers read only) | 4 |
| `/settings/connector` | Claude connector: URL, steps, connected apps (revoke), examples | 6 |
| `/oauth/consent` | OAuth consent for Claude (outside the app shell) | 6 |
| `/.well-known/oauth-protected-resource/mcp`, `/.well-known/oauth-authorization-server/api/auth` | OAuth discovery metadata | 6 |
| `/admin/users` | User management (admins only; others get not-found) | 3 |
| `/api/auth/[...all]` | Better Auth handler | 1 |
| `/mcp` | MCP endpoint (OAuth bearer token) | 6 |

All pages except `/login` require a session (`/oauth/consent` sends signed-out visitors to `/login` with Claude's request). Every signed-in role can open every page except `/admin/users`; viewers see them without write controls.

## Reference repositories (siblings of this folder)

- `../daily-transactions`: MCP with `mcp-handler`, Neon access, Jalali helpers (`src/lib/jalali.ts`), the Dana font file, the MCP tool set and instructions.
- `../money-old` (GitHub `money-old`, formerly `money`): personal accounting features, Dana font notes, RTL and Persian number formatting rules.
- `../orange`: the implementation process, folder layout, Storybook setup, theme script and PostCSS media setup.
- `../kanvas`: Kanvas tokens (`src/styles/tokens.css`), the source of the royal blue ramp and of Plus Jakarta Sans.

Tooling: pnpm, Turbopack, React Compiler off. The dev server and Storybook run on `money.localhost`.

Scripts: `dev`, `build`, `vercel-build` (Vercel only: migrate, then build), `start`, `lint`, `typecheck` (runs `next typegen` first, so route types exist), `format`, `format:check`, `storybook`, `build-storybook`, `db:generate`, `db:migrate`, `db:studio`, `user:create` (asks for username, display name, role, language and password at the prompt; run it in a terminal).
