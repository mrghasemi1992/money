# Money: phases and prompts

How to use this file:

1. Paste the phase's **Claude Design** prompt into Claude Design and iterate until the design is right.
2. Press "Send to Claude Code" and add the phase's **Claude Code** prompt.
3. Claude Code implements only that phase on the phase branch, then asks before committing.

All decisions (stack, data rules, conventions) are in `CLAUDE.md`. The prompts below don't repeat them; they point to it.

UI copy in the designs is Persian. The prompts are in English, with sample Persian labels where it matters.

---

## Phase 0a: Project setup

Branch: none (committed on `main`). No design step.

### Claude Code

```text
Phase 0a: project setup. Read CLAUDE.md first; it is the source of truth.

The repo root is this folder (Projects/personal/money). It already contains CLAUDE.md and docs/. Never create a nested money/ folder.

1. Scaffold Next.js (latest, App Router, TypeScript strict, ESLint, src/ dir, Turbopack, no Tailwind, `@/*` → `src/*`, pnpm). create-next-app refuses a folder that has CLAUDE.md in it, so scaffold into a temporary folder in your scratchpad and move the generated files into this repo root. Don't overwrite CLAUDE.md or docs/.
2. Read AGENTS.md and the Next.js docs in node_modules/next/dist/docs/ before writing code. This Next.js version has breaking changes.
3. Add Prettier (default options), eslint-config-prettier, .prettierrc.json and .prettierignore, the same as ../orange.
4. Install: @base-ui/react, lucide-react, zod, server-only. Don't install the database, auth or MCP packages yet (they come in Phases 1 and 6).
5. Install Storybook with @storybook/nextjs-vite, set up like ../orange/.storybook (stories in src/**/*.stories.tsx). The preview sets lang="fa" and dir="rtl" on <html> and has a light/dark toolbar.
6. Add PostCSS custom media (@csstools/postcss-global-data + postcss-custom-media) as in ../orange/postcss.config.mjs, with an empty src/styles/media.css for now.
7. Copy the Dana font from ../daily-transactions/src/app/fonts/dana-variable.woff2 into src/styles/fonts/ and load it with next/font/local (weight "10 900"). Root layout: <html lang="fa" dir="rtl">, a placeholder home page in Persian.
8. Dev server and Storybook on money.localhost (next dev -H money.localhost, storybook --host money.localhost, allowedDevOrigins).
9. Scripts: dev, build, start, lint, typecheck, format, format:check, storybook, build-storybook.
10. git init with main as the default branch. .gitignore covers .env*, .vercel, storybook-static and the usual Next.js files, but keeps .env.example.

Check that build, lint, typecheck and format:check pass. Then show me the files and the proposed commit message, and wait for my OK. After the commit, ask before creating the GitHub repo or pushing.
```

---

## Phase 0b: Design system

Branch: `feature/phase-0-design-system`

### Claude Design

```text
Design the design system for "Money" (Persian wordmark: پول), a personal accounting web app. The whole interface is Persian and right-to-left. Users record income, expenses and transfers between their own accounts, set monthly budgets, and see reports. Many people use it on a phone, so mobile matters as much as desktop.

Style: modern, calm and trustworthy, inspired by the Kanvas Design System project in Claude Design. Use Kanvas's blue as the primary color: royal-600 #223BB2, with a full royal ramp and a cool slate neutral ramp tinted toward it, as in Kanvas. No UI framework look (not shadcn, not Material).

Font: Dana (Persian variable font) for everything, including Latin text and numbers. Numbers use Persian digits (۰۱۲۳۴۵۶۷۸۹) with tabular widths for amounts. Dana's default weight is hairline, so give every text style an explicit weight.

Deliver:
1. Logo: a simple mark plus the پول wordmark. Must work as a favicon and an app icon.
2. Tokens for light and dark themes:
   - colors: surfaces, borders, text, brand, focus ring, status (success, warning, danger, info)
   - a set of about 10 category colors that are easy to tell apart in both themes
   - how income, expense and transfer amounts look. They must be distinguishable by sign or wording too, not by color alone.
   - typography scale, spacing, radius, shadows, motion, icon sizes
3. Components, each with all states (default, hover, focus, active, disabled, error) in both themes, laid out RTL:
   - Button (primary, secondary, ghost, danger; sizes), IconButton
   - TextField, Textarea, AmountField (rial, with a ریال suffix and thousand separators, Persian digits), SearchField
   - Select, Combobox (searchable, with grouped options for category → subcategory), Checkbox, Switch, RadioGroup, SegmentedControl (for درآمد / هزینه / انتقال)
   - Field wrapper: label, hint, error message
   - Jalali date picker (month grid with Persian month names; weeks start on شنبه)
   - Dialog, Sheet / bottom sheet for mobile, Menu, Popover, Tooltip, Toast
   - Card, Badge / Tag, CategoryChip (colored dot + name), Avatar, Divider, Skeleton, EmptyState
   - Amount display (signed, with ریال) and a date display, e.g. "۹ مهر ۱۴۰۵"
   - ProgressBar (for budgets: normal, near limit, over limit)
4. A foundations page that shows the tokens, the type scale and the color palette in both themes.

Use lucide icons. Arrows and chevrons point the RTL way.
```

### Claude Code

```text
Phase 0b: design system. Read CLAUDE.md first. Create branch feature/phase-0-design-system from main.

Implement the attached Claude Design handoff:
1. Tokens in src/styles/tokens/ (colors, typography, spacing, radius, shadows, motion, components), light on :root and [data-theme="light"], dark on [data-theme="dark"]. base.css, typography.css, media.css (breakpoints from the design) and globals.css that imports them.
2. Theme setup as in ../orange: an inline script in <head> sets data-theme before first paint (saved choice in localStorage key "money-theme", otherwise the OS setting), plus ThemeSync. Types in src/types/theme.ts, constants in src/constants/theme.ts, functions in src/utils/theme.ts.
3. Logo and LogoMark components, src/app/icon.svg and src/app/apple-icon.tsx.
4. Every component from the design in src/components/ui/<name>/ (index.tsx, styles.module.css, index.stories.tsx). Build the interactive ones on Base UI primitives, styled from scratch with CSS Modules. No UI framework.
5. RTL: logical CSS properties only. Mirror directional icons.
6. Numbers and dates:
   - src/utils/number.ts: formatRial (Intl.NumberFormat("fa-IR")), and parseDigits, which turns Persian/Arabic digits and separators into a number.
   - src/utils/jalali.ts: Gregorian ISO ↔ Jalali conversion, Jalali month names, days in a Jalali month and formatting. Base it on ../daily-transactions/src/lib/jalali.ts (pure functions). Use Intl with the persian calendar where it is enough.
   - The AmountField and the Jalali date picker take and return plain values (number in rial, ISO date string). Conversion happens inside the components.
7. Dana rules from CLAUDE.md: explicit weights, "ss03" for tabular digits on amounts, never "ss02".
8. Storybook: titles "Design system/<Name>", a Foundations section (tokens, type scale, palette), light/dark toolbar, RTL preview.
9. First Vercel deploy: link the project and deploy main after merge. Ask me before running any vercel command that creates or links a project.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md (phase status, project structure, anything the design decided that CLAUDE.md doesn't say yet). Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 1: Database and sign-in

Branch: `feature/phase-1-auth`

### Claude Design

```text
Using the Money design system, design the sign-in page (ورود), in Persian and RTL, light and dark, desktop and mobile.

- Logo, a short title, username (نام کاربری) and password (رمز عبور) fields, a show/hide password button and a ورود button.
- There is no sign-up and no "forgot password". Accounts are created by an admin. Add one quiet line saying that accounts are made by the admin.
- States: empty, filled, loading (button busy), wrong username or password (one general error, without saying which field was wrong), account disabled, too many attempts.
- Keep it calm and centered. On mobile it fills the screen and the keyboard must not hide the button.
```

### Claude Code

```text
Phase 1: database and sign-in. Read CLAUDE.md first. Create branch feature/phase-1-auth from main.

1. Neon through the Vercel Neon integration (DATABASE_URL). Walk me through adding it in Vercel and running `vercel env pull .env.local`, then wait for me to confirm. Add .env.example with every variable and what it is for.
2. Drizzle ORM with the Neon serverless driver. Schema in src/db/schema/, migrations with drizzle-kit, committed. Scripts: db:generate, db:migrate, db:studio.
3. Better Auth, data in Neon through the Drizzle adapter. Read the current Better Auth docs first. Use:
   - email/password disabled for sign-up; the username plugin for sign-in by username and password
   - the admin plugin (roles "admin" and "user", banned users can't sign in)
   - no public sign-up endpoint: disable it, so users can only be created by an admin
   - BETTER_AUTH_SECRET and BETTER_AUTH_URL in env
   - rate limiting on sign-in
   Route handler at src/app/api/auth/[...all]/route.ts. Server-side helpers in src/auth/ (getSession, requireUser, requireAdmin) importing server-only.
4. Protect every route except /login and the auth API: use the Next.js proxy (read the docs; it replaced middleware in this version) for the redirect, and also check the session in each page or Server Action. Never trust the proxy alone.
5. The /login page from the attached design. Signing in redirects to the page the user came from, or /. Add a sign-out Server Action (the button lands in Phase 2).
6. Bootstrap script `pnpm user:create-admin` that creates the first admin from a username and password given at the prompt (not as CLI args, so they stay out of shell history).
7. Create the app tables from CLAUDE.md's data model now (accounts, categories, transactions, budgets) with user_id foreign keys, checks (amount > 0, category type rules, one level of subcategories, transfers need to_account_id and no category) and indexes (user_id + date). No UI for them yet.

Check that build, lint, typecheck and format:check pass, and that sign-in, sign-out and the redirects work locally. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 2: App shell

Branch: `feature/phase-2-app-shell`

### Claude Design

```text
Using the Money design system, design the app shell, in Persian and RTL, light and dark.

Navigation: داشبورد, تراکنش‌ها, بودجه, گزارش‌ها, تنظیمات, plus مدیریت کاربران shown only to admins.

- Desktop: a sidebar on the right (RTL start) with the logo, the nav links and, at the bottom, the user's name with a menu (تنظیمات، تغییر تم، خروج). Show the active page clearly. It should be collapsible to an icon rail.
- Mobile: a bottom tab bar with the four main pages, and a central floating "add transaction" button (افزودن تراکنش). Settings and the user menu are reachable from a top bar.
- Desktop also has a clear "add transaction" button in the page header area.
- A page header pattern: title and optional actions.
- Placeholder content for pages not built yet, a loading skeleton, an error page (مشکلی پیش آمد + تلاش دوباره) and a not-found page (صفحه پیدا نشد + بازگشت به داشبورد).
- Settings page, first version: profile (display name, username read-only), change password (current, new, repeat), theme (روشن / تیره / سیستم).
```

### Claude Code

```text
Phase 2: app shell. Read CLAUDE.md first. Create branch feature/phase-2-app-shell from main.

Implement the attached design:
1. AppShell with skip link, the desktop sidebar (collapsible; save the choice in localStorage) and the mobile top bar + bottom tab bar + floating add button. Breakpoints from src/styles/media.css. Base UI Dialog for any drawer.
2. Nav items in src/constants/navigation.ts (label, href, icon, adminOnly), shared by the sidebar and the bottom bar. The admin item shows only for admins; check the role on the server.
3. User menu with settings, theme and sign out (wire the Phase 1 sign-out action).
4. Routes from CLAUDE.md as placeholders: /, /transactions, /budgets, /reports, /settings, /admin/users (admins only; others get not-found). The add-transaction button opens a placeholder dialog for now.
5. /settings: display name, change password (Better Auth), theme choice (light, dark, system). If the design shows a three-way theme choice, update the theme utils and CLAUDE.md to match.
6. loading.tsx, error.tsx and not-found.tsx inside the shell. Page titles "<page> | پول".
7. Stories for every new component (Components/<Name>), with the App Router mocks for active links.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 3: User management (admin)

Branch: `feature/phase-3-users`

### Claude Design

```text
Using the Money design system and app shell, design the admin page مدیریت کاربران, in Persian and RTL, light and dark, desktop and mobile.

- A list of users: display name, username, role (مدیر / کاربر), status (فعال / غیرفعال), created date (Jalali). On mobile it becomes a card list.
- "New user" (کاربر جدید) opens a dialog: display name, username, temporary password (with a "generate" button and a copy button), role.
- A row menu: reset password (shows a new temporary password to copy, once), disable / enable, change role.
- Confirmation dialogs for disabling a user and for removing admin rights.
- An admin can't disable or demote themself; show that as a disabled option with a short reason.
- Empty, loading and error states.
- The page never shows anyone's transactions or balances.
```

### Claude Code

```text
Phase 3: user management. Read CLAUDE.md first. Create branch feature/phase-3-users from main.

Implement the attached design at /admin/users with the Better Auth admin plugin:
1. List users; create a user (username, display name, temporary password, role); reset password; ban/unban (disable/enable); set role. Every action is a Server Action that calls requireAdmin() first and validates input with Zod.
2. Generate temporary passwords on the server with node:crypto. Show them once and never store them in plain text.
3. Guards on the server too: an admin can't ban or demote themself, and the last admin can't be demoted.
4. Disabling a user also revokes their sessions and, once Phase 6 exists, their OAuth tokens. Leave a TODO in the code pointing to Phase 6.
5. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 4: Accounts and categories

Branch: `feature/phase-4-accounts-categories`

### Claude Design

```text
Using the Money design system and app shell, design two settings pages, in Persian and RTL, light and dark, desktop and mobile.

1. حساب‌ها (accounts): bank cards, cash and so on.
   - List with name and current balance in rial; a total at the top.
   - Add / edit dialog: name, starting balance (موجودی اولیه; can be zero, the balance on the day you start using the app).
   - Reorder, archive (archived accounts are hidden from forms but keep their history), and delete only when the account has no transactions.
2. دسته‌بندی‌ها (categories):
   - Two tabs: هزینه (expense) and درآمد (income).
   - Categories with an optional level of subcategories underneath (e.g. خوراک → رستوران، سوپرمارکت). Each category has a name and a color from the category palette; subcategories use their parent's color.
   - Add, rename, recolor, archive. Delete only when nothing uses it.
   - A short set of suggested starter categories the user can add with one tap when the list is empty.
   Empty, loading and error states for both pages.
```

### Claude Code

```text
Phase 4: accounts and categories. Read CLAUDE.md first. Create branch feature/phase-4-accounts-categories from main.

Implement the attached design at /settings/accounts and /settings/categories:
1. Queries and mutations in src/db/ (server-only), always scoped to the signed-in user. Server Actions with Zod.
2. Account balance helper in src/helpers/ (opening + income − expense − transfers out + transfers in), computed in SQL. Transactions don't exist in the UI yet, so balances equal the opening balance for now, but the query must already be the real one.
3. Category rules on the server: one level of subcategories, a subcategory has its parent's type, delete only when unused (otherwise archive), names unique per user + type + parent.
4. Starter categories: a constant list in src/constants/ added in one Server Action.
5. Reordering accounts (sort_order). Archiving hides an account from forms.
6. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 5: Transactions

Branch: `feature/phase-5-transactions`

### Claude Design

```text
Using the Money design system and app shell, design the transactions page (تراکنش‌ها) and the add/edit transaction form, in Persian and RTL, light and dark, desktop and mobile.

1. The list:
   - Grouped by Jalali day (e.g. "چهارشنبه ۹ مهر ۱۴۰۵") within a month, with a month switcher and the month's income, expense and net at the top.
   - Each row: category chip (or a transfer icon showing "رسالت ← بلو"), description, account, tags, and the signed amount. Unknown transactions (description "؟") look visibly unidentified.
   - A row shows a small mark when it was added by Claude.
   - Filters, collapsible and closed by default: date range, type, account, category, tag, text search and "unknown only". Show active filters as removable chips.
   - Empty month, no results for the filters, loading.
2. The form, a dialog on desktop and a bottom sheet on mobile:
   - type: هزینه / درآمد / انتقال (segmented)
   - amount (large, the first field focused)
   - date (Jalali picker, default today)
   - account (for a transfer: from and to)
   - category, with subcategories grouped under it (hidden for a transfer)
   - description, tags (chips with suggestions from existing tags), note (collapsed by default)
   - save, "save and add another", cancel. Edit mode adds delete, with a confirmation.
   - Validation errors per field.
3. Transaction detail on mobile: tapping a row opens it, with edit and delete.
```

### Claude Code

```text
Phase 5: transactions. Read CLAUDE.md first. Create branch feature/phase-5-transactions from main.

Implement the attached design at /transactions, and wire the global add button from Phase 2 to the new form:
1. src/db/transactions.ts (server-only): list with filters (Gregorian date range, type, account, category including its subcategories, tag, search on description/note/tags, unknown only), create, update, delete, month totals. Every query is scoped to the user. Validate that the account and category belong to the user and match the type rules in CLAUDE.md.
2. Server Actions with one Zod schema shared by the form and the server. Amount arrives as an integer in rial; the date as ISO.
3. The month switcher and filters use Jalali months in the UI. Convert them to a Gregorian range with the helper in src/helpers/ before querying. Keep the filters in the URL search params, so a filtered view can be shared and survives a refresh.
4. The form: AmountField and the Jalali date picker from the design system. The default date is today in Asia/Tehran. Tag suggestions come from the user's existing tags. "Save and add another" keeps type, account and date.
5. source = "web" for rows created here.
6. Pagination or "load more" by month. Keep the list fast for a few thousand rows per user.
7. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass, and test creating, editing, deleting and filtering in the browser, including a transfer. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 6: Claude connector (MCP + OAuth)

Branch: `feature/phase-6-mcp`

### Claude Design

```text
Using the Money design system and app shell, design these screens, in Persian and RTL, light and dark, desktop and mobile.

1. Settings → اتصال به Claude (/settings/connector):
   - The connector URL with a copy button, and short numbered steps for adding it in Claude (Settings → Connectors → Add custom connector).
   - A list of connected apps (for example "Claude", connected on <Jalali date>, last used <date>) with a "قطع دسترسی" (revoke) button and a confirmation.
   - Examples of what to say to Claude, e.g. "این پیامک بانک رو ثبت کن", "این ماه چقدر خرج رستوران کردم؟".
2. The OAuth consent screen that opens when Claude connects: the app logo, "Claude می‌خواهد به حساب پول شما دسترسی داشته باشد", the list of permissions (read transactions, add and edit transactions, delete transactions when you ask), and buttons اجازه دادن / رد کردن. If the user isn't signed in, the sign-in page comes first and returns here.
```

### Claude Code

```text
Phase 6: Claude connector. Read CLAUDE.md first. Create branch feature/phase-6-mcp from main.

Goal: users add https://<domain>/mcp as a custom connector in claude.ai, sign in once with their username and password, and Claude works on that user's data.

1. OAuth: read the current Better Auth docs and the current MCP authorization spec. Use Better Auth's OAuth 2.1 provider / MCP plugin (whichever the docs now recommend) for authorization, token and client registration (dynamic client registration and/or client ID metadata documents, whichever claude.ai uses today), PKCE, and the .well-known metadata (oauth-authorization-server and oauth-protected-resource). Use the consent page from the attached design. Sign-in goes through /login and returns to the consent page.
2. MCP endpoint at src/app/mcp/route.ts with mcp-handler, wrapped in withMcpAuth. It verifies the bearer token with Better Auth, rejects banned users, and puts the user id in the tool context. Tool code lives in src/mcp/ (server-only) and reuses the src/db/ functions from Phase 5, so the same rules apply as in the web UI.
3. Tools, modeled on ../daily-transactions/src/lib/mcp.ts:
   - today
   - list_accounts (with balances), list_categories (with subcategories and type)
   - add_transactions (batch, with possible duplicates: same date, account, amount and type)
   - list_transactions (filters + totals), update_transaction, delete_transactions (destructive hint; only when the user asks)
   Dates in and out are Jalali YYYY/MM/DD, converted at this boundary with src/utils/jalali.ts. Amounts in rial (toman × 10). Accounts and categories are matched by id, with names in the list tools so Claude can map "رسالت" to an id. An unknown description is "؟". Write the server instructions in the same style as daily-transactions, adapted to accounts, categories and transfers.
4. source = "mcp" for rows created here. The web list shows the mark from the Phase 5 design.
5. /settings/connector from the design: the URL, a list of the user's OAuth clients/tokens, revoke. Banning a user (Phase 3) now also revokes their tokens; resolve the Phase 3 TODO.
6. Test the full flow locally with the MCP Inspector, then on a Vercel preview with claude.ai. Tell me when it's ready for me to add the connector.

Check that build, lint, typecheck and format:check pass. Update CLAUDE.md and the README (connector setup). Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 7: Budgets

Branch: `feature/phase-7-budgets`

### Claude Design

```text
Using the Money design system and app shell, design the budgets page (بودجه), in Persian and RTL, light and dark, desktop and mobile.

- A budget is a monthly limit for a top-level expense category, repeating every Jalali month. Subcategory spending counts toward its parent.
- A Jalali month switcher. At the top: total budget, total spent and remaining for the month.
- One row per budgeted category: color chip, name, spent / limit in rial, a progress bar (normal, near the limit at 80%, over the limit), and remaining or overspent amount. Tapping a row shows that category's transactions for the month (link to the filtered transactions page).
- Expense categories without a budget listed below, with a quick "set budget" action.
- Add / edit budget dialog: category, monthly amount. Remove budget, with a confirmation.
- Empty state for when there are no budgets yet.
```

### Claude Code

```text
Phase 7: budgets. Read CLAUDE.md first. Create branch feature/phase-7-budgets from main.

Implement the attached design at /budgets:
1. CRUD for budgets (only top-level expense categories, one per category, user-scoped), Server Actions with Zod.
2. Spending per budgeted category for a Jalali month in one SQL query: expense transactions in the month's Gregorian range, with subcategories rolled up into the parent. Transfers are excluded.
3. The month switcher uses Jalali months and keeps the month in the URL.
4. Rows link to /transactions with the category and month filters set.
5. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 8: Reports

Branch: `feature/phase-8-reports`

### Claude Design

```text
Using the Money design system and app shell, design the reports page (گزارش‌ها), in Persian and RTL, light and dark, desktop and mobile.

- A period picker: a Jalali month, the last 3, 6 or 12 months, or a custom range.
- Summary cards: income, expense, net, and the change against the previous period.
- Expense by category: a ranked bar chart or donut with category colors, amounts and percentages. Tapping a category expands its subcategories.
- Income by category, the same pattern.
- Month by month: income and expense bars per Jalali month, with net as a line.
- Spending by account.
- Charts read right to left, axes and labels use Persian digits and Jalali month names, and every chart has a table view for accessibility.
- Empty and loading states.
```

### Claude Code

```text
Phase 8: reports. Read CLAUDE.md first. Create branch feature/phase-8-reports from main.

1. Pick a chart approach: a small library that supports RTL, custom styling from our tokens and both themes, or hand-written SVG components if that's simpler for these few chart types. Tell me the choice and why before building, and record it in CLAUDE.md.
2. Aggregation queries in src/db/reports.ts (user-scoped, transfers excluded from income and expense): totals by category with subcategory roll-up, totals per Jalali month (group in the app by Jalali month, or with a Gregorian range per month; don't do Jalali math in SQL), totals by account, and the previous period for comparison.
3. Implement the attached design at /reports, with the period in the URL. Every chart has a table view.
4. Stories for the chart components with sample data.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 9: Dashboard

Branch: `feature/phase-9-dashboard`

### Claude Design

```text
Using the Money design system and app shell, design the dashboard (داشبورد), in Persian and RTL, light and dark, desktop and mobile. It's the first page after sign-in.

- A greeting and today's Jalali date.
- Total balance across accounts, plus each account's balance (horizontal scroll on mobile).
- This Jalali month: income, expense, net.
- Budget progress: the 3 to 5 categories closest to or over their limit, linking to /budgets.
- Top expense categories this month (small chart), linking to /reports.
- Recent transactions (about 8), linking to /transactions.
- A notice when there are unknown transactions ("۳ تراکنش ناشناس دارید"), linking to the filtered list.
- First-run state for a new user: steps to add accounts, add categories, add a first transaction and connect Claude.
```

### Claude Code

```text
Phase 9: dashboard. Read CLAUDE.md first. Create branch feature/phase-9-dashboard from main.

Implement the attached design at /, reusing the queries and components from Phases 4–8 (balances, month totals, budget progress, report aggregations, transaction rows). Load sections in parallel with Suspense and a skeleton each, so one slow query doesn't hold up the page. The first-run state shows when the user has no accounts or no transactions.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 10: CSV import and export

Branch: `feature/phase-10-csv`

### Claude Design

```text
Using the Money design system and app shell, design CSV import and export, in Persian and RTL, light and dark, desktop and mobile. It lives in Settings (درون‌ریزی و برون‌بری).

1. Export: choose a date range (Jalali) and download a CSV of transactions.
2. Import, as a stepper:
   - upload a file
   - map the columns (date, amount, type or signed amount, account, category, subcategory, description, tags, note), with a preview of the first rows; the date column can be Jalali or Gregorian
   - match unknown account and category names: map them to existing ones or create new ones
   - review: rows that will be added, rows with errors (with the reason per row), possible duplicates (skip or add anyway)
   - result: how many were added, skipped and failed
```

### Claude Code

```text
Phase 10: CSV import and export. Read CLAUDE.md first. Create branch feature/phase-10-csv from main.

1. Export: a Route Handler that streams the user's transactions in a date range as UTF-8 CSV with a BOM (so Excel shows Persian correctly). Columns: Gregorian date, Jalali date, type, amount, account, to account, category, subcategory, description, tags, note.
2. Import: parse the CSV (choose a parser library and say why), detect Jalali vs Gregorian dates, normalize Persian digits, validate every row with Zod, map accounts and categories as in the design, detect duplicates (same date, account, amount and type), and insert in one database transaction. source = "csv".
3. Limits on file size and row count, with clear errors.
4. Implement the attached design. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass, and test with a sample file that has both date formats and some bad rows. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

---

## Phase 11: Import from daily-transactions (later)

Branch: `feature/phase-11-daily-transactions-import`. No design step.

### Claude Code

```text
Phase 11: one-time import from daily-transactions. Read CLAUDE.md first. Create branch feature/phase-11-daily-transactions-import from main.

Write a script (not a UI) that copies the transactions table of the daily-transactions Neon database (read-only, its URL in a separate env var) into Money for one target user chosen by username:
- Jalali y/m/d → Gregorian date
- direction in/out → income/expense
- bank → an account with the same name (create it with opening balance 0 if missing; I'll fix opening balances after)
- tags kept as they are, description kept ("؟" stays unknown), no category (I'll categorize later)
- source = "mcp"
Dry run by default: print counts per account and month and a sample of the converted rows. Only write with an explicit --write flag. Refuse to run if the target user already has transactions, unless --force is given.

Ask me before running it against production.
```

---

## Phase 12: Tests (later)

Branch: `feature/phase-12-tests`. No design step.

### Claude Code

```text
Phase 12: tests. Read CLAUDE.md first. Create branch feature/phase-12-tests from main.

Propose a test setup for this Next.js app (unit, component and end-to-end), and wait for my OK before installing anything. Then cover first: src/utils/jalali.ts and src/utils/number.ts, the balance, month-range and budget helpers, the Zod schemas, user scoping in the src/db/ functions (one user can never read or change another's rows), the MCP tools' date conversion, and the main flows (sign in, add a transaction, transfer, budget progress). Add spec.test.tsx files next to components as CLAUDE.md describes, and a test script in CI.
```
