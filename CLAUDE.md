# Money: a Persian personal accounting app

## What this is

Money is a personal accounting app with a Persian, right-to-left interface. Users record income, expenses and transfers by hand in the web app, or by talking to Claude, which saves them through the app's MCP connector. Built by Mohammad Reza Ghasemi.

- Persian only. RTL everywhere, Jalali calendar in the UI, Persian digits. No i18n layer and no English locale.
- Light and dark themes.
- Several users, by invite only. There is no public sign-up. An admin creates accounts in the app.
- Each user's data is private to that user. The admin page manages user accounts only and never shows another user's financial data.
- Amounts are shown in rial.

## Features (full scope)

- Sign in with username and password (invite only)
- Admin user management: create users, reset passwords, disable accounts
- Accounts (bank cards, cash, …) with a starting balance and a live current balance
- Categories with one optional level of subcategories, separate for income and expense
- Transactions: income, expense and transfer between own accounts, with category, subcategory, account, tags, description and note
- Claude connector (MCP) with OAuth sign-in, so Claude can add, find, edit and delete the signed-in user's transactions
- Budgets: a monthly limit per category, repeating every Jalali month
- Reports: charts by category and by month
- Dashboard: balances, this month's totals, budget progress, recent transactions
- CSV import and export
- Later: one-time import of the `daily-transactions` data

## Tech stack

- **Framework:** Next.js with the App Router, React, TypeScript (strict mode). Chosen over Vite because the MCP endpoint, the OAuth server, sign-in and database access all live in the same project as Route Handlers and Server Actions, with no separate backend.
- **Database:** Postgres on Neon, connected through the Vercel Neon integration (`DATABASE_URL`).
- **Data access:** Drizzle ORM with the Neon serverless driver. Migrations with drizzle-kit, committed to the repo.
- **Auth:** Better Auth (self-hosted library, data in Neon, no paid service) with its username plugin (sign-in by username and password), admin plugin (user management) and OAuth 2.1 provider / MCP plugin (the Claude connector). Check the current Better Auth docs for the plugin names before using them: the MCP plugin is being replaced by the OAuth Provider plugin.
- **MCP:** `mcp-handler` + `@modelcontextprotocol/server` (same as `daily-transactions`), behind OAuth bearer tokens issued by Better Auth.
- **Validation:** Zod for every form, Server Action input, MCP tool input and CSV row.
- **UI primitives:** Base UI (`@base-ui/react`, unstyled). Use it for interactive parts like Dialog, Menu, Popover, Select, Combobox, Tooltip, Tabs, Switch, Checkbox.
- **Styling:** CSS Modules + CSS custom properties as design tokens. No Tailwind. No component libraries (no shadcn/ui, no MUI).
- **Icons:** lucide-react
- **Charts:** chosen in Phase 8 (Reports)
- **Design system docs:** Storybook
- **Formatting:** Prettier (default options) with `eslint-config-prettier`
- **Hosting:** Vercel
- **Tests:** not in scope yet. Planned later. Write code that is easy to test (small pure functions, data logic separate from UI).

## Data rules

- **Every row belongs to a user.** Every table with user data has `user_id`, and every query filters by the signed-in user's id. The user id always comes from the session (web) or the OAuth token (MCP), never from client input.
- **Dates are stored as Gregorian.** A transaction's date is a Postgres `date` (`YYYY-MM-DD`, no time zone). Timestamps (`created_at`, `updated_at`) are `timestamptz`. Never store Jalali dates.
- **Jalali only at the edges.** Dates travel through the app as ISO strings. Convert to Jalali only:
  - in UI components that show or pick a date (`JalaliDate`, the date picker), and
  - at the MCP boundary: tools take and return Jalali `YYYY/MM/DD`, because bank SMS use Jalali and LLMs are unreliable at calendar math. The MCP layer converts before reading or writing the database.
- **Jalali months drive periods.** "This month", budgets and monthly reports use Jalali months. A helper turns a Jalali month into a Gregorian date range for queries.
- **Today** is the current date in `Asia/Tehran`.
- **Amounts** are positive integers in rial (`bigint`). The transaction type gives the direction. Format for display with `Intl.NumberFormat("fa-IR")`, which also produces real Persian digit characters. Amount inputs accept both Persian and Latin digits.
- **Unknown transactions:** a description of `؟` (or empty) marks a transaction that still needs to be identified, as in `daily-transactions`.

### Data model

| Table | Main columns |
|-------|--------------|
| Better Auth tables | `user` (with `username`, `role`, `banned`), `session`, `account`, `verification`, and the OAuth provider tables |
| `accounts` | `id`, `user_id`, `name`, `opening_balance` (rial, may be 0), `archived`, `sort_order` |
| `categories` | `id`, `user_id`, `type` (`income` \| `expense`), `name`, `color`, `parent_id` (null for a category, set for a subcategory), `archived` |
| `transactions` | `id`, `user_id`, `type` (`income` \| `expense` \| `transfer`), `date`, `amount`, `account_id`, `to_account_id` (transfers only), `category_id` (category or subcategory; null for transfers), `description`, `note`, `tags` (`text[]`), `source` (`web` \| `mcp` \| `csv`), `created_at`, `updated_at` |
| `budgets` | `id`, `user_id`, `category_id` (top-level expense category), `amount` (rial per Jalali month) |

- Subcategories are one level deep: a subcategory's parent must be a top-level category, and it has the same `type` as its parent.
- A transaction's category must match its type (income categories for income, expense categories for expense). Transfers have no category.
- Budgets and reports roll subcategory amounts up into their parent category.
- Account balance = opening balance + income − expense − transfers out + transfers in. Transfers never count as income or expense in totals, budgets or reports.

## Design system

- **Brand:** name "Money" (Persian wordmark پول, as in the old `money` project, now `money-old`).
- **Look:** modern and calm, inspired by the Kanvas design system in Claude Design. Primary color is Kanvas royal blue `#223BB2` (`royal-600`), with a cool slate neutral tinted toward it and royal-tinted shadows. Flat stacked surfaces (page → card → raised), no gradients, no illustrations.
- **Logo:** Lucide's wallet glyph in white on a royal rounded tile, plus the wordmark «پول» at weight 800. `Logo` and `LogoMark` in `src/components/ui/`, favicon in `src/app/icon.svg`, iOS icon in `src/app/apple-icon.tsx`.
- **Tokens** live in `src/styles/tokens/` and are the only source of colors, type, spacing, radius, shadows and motion:
  - Colors: raw ramps (`--royal-*`, `--slate-*`, accent hues) plus semantic aliases. Components use only the aliases: `--surface-*`, `--border-*`, `--text-*`, `--brand-*`, `--status-*`, `--amount-*`, `--budget-*`, `--cat-*`. Light on `:root` and `[data-theme="light"]`; `[data-theme="dark"]` re-points the aliases.
  - Type roles as `font` shorthands: `font: var(--type-body)` (`display`, `title-lg`, `title`, `heading`, `body-md`, `body`, `label`, `control`, `caption`, `eyebrow`, `amount-hero`, `amount-lg`, `amount`). 12px floor; never letter-space Persian.
  - Categories: 10 hues + slate (`src/constants/category.ts`), each `--cat-<hue>` (dot), `-soft` (fill) and `-text` (label). A category is never shown by color alone.
  - Focus is a 3px ring drawn with `box-shadow: var(--shadow-focus)` (danger controls: `--shadow-focus-danger`).
- **Font:** Dana (variable, `dana-variable.woff2`, copied from `daily-transactions`), loaded with `next/font/local`.
  - Dana's default weight is 10 (hairline). Every text style must set a weight. Declare `weight: "10 900"`.
  - Dana has no `tnum` feature. Use `font-feature-settings: var(--font-features-tabular)` (`"ss03"`) for tabular Persian digits in amounts, dates and columns of numbers (helper class `.tabular`).
  - Never use Dana's `ss02` (it draws Latin digits as Persian glyphs and breaks copy and screen readers). Persian digits come from `Intl.NumberFormat("fa-IR")`.
- **RTL:** `<html lang="fa" dir="rtl">`, and Base UI's `DirectionProvider` (in `src/components/providers`) set to `rtl` for keyboard navigation and popup placement. Use CSS logical properties only (`margin-inline-start`, `inset-inline-end`, …), never `left`/`right`.
  - Directional icons (back/forward arrows and chevrons) are written in LTR terms (`ChevronLeftIcon` = back) and get the global `mirror-rtl` class (`mirrorIcon` / `mirrorIcons` props on IconButton and Button), so they point the right way in either direction. Money-direction icons (`ArrowUpIcon`, `ArrowDownIcon`, `ArrowLeftRightIcon`) are direction-neutral and never mirrored.
- **Themes:** light and dark, both defined as tokens. No flash of the wrong theme on load (inline script in `<head>` sets `data-theme` from the saved choice, otherwise the OS setting), same setup as `orange`.
- **Money semantics:** income and expense must be told apart by sign and wording too, not by color alone.
  - Income: green, `+`, ↓ `ArrowDownIcon`, «درآمد». Expense: red, `−` (U+2212), ↑ `ArrowUpIcon`, «هزینه». Transfer: royal, no sign, ⇄ `ArrowLeftRightIcon`, «انتقال». Balances: neutral text, `−` only when negative. The `Amount` component does all of this.
  - Numbers in amounts are an isolated left-to-right run (`<bdi dir="ltr">`). Persian thousands separator «٬» (U+066C), percent «٪».
  - Budgets: ok (royal) → near the limit from 85% (amber, ⚠, «نزدیک به سقف») → over (red with diagonal stripes, «… بیش از بودجه»). `getBudgetStatus` in `src/helpers/budget.ts`.
- **Dates in the UI:** «۹ مهر ۱۴۰۵», with weekday «پنج‌شنبه ۹ مهر ۱۴۰۵», «امروز» / «دیروز» in lists, numeric «۱۴۰۵/۰۷/۰۹» only in dense tables. Weeks start on Saturday (شنبه); Friday is tinted as the weekend. `AmountField` takes and returns a number in rial; `Calendar` and `DatePicker` take and return ISO date strings.
- **Copy:** calm, short, polite plural. Buttons are verbs that name the outcome («ثبت هزینه», never «تأیید»); cancel is always «انصراف». Labels are nouns without a colon. Errors are one specific sentence ending with a period, no exclamation mark. Toasts confirm in past tense and offer «واگرد» after add/delete. No emoji. Claude is written «Claude», in Latin.
- **Motion:** `--ease-out` for nearly everything, `--ease-lift` only for things that pop (checkbox tick, switch thumb, dialog and toast entry). 120ms color, 180ms position, 260ms overlays. Everything collapses under `prefers-reduced-motion` (in `base.css`).
- **Icons:** lucide-react, sized with `--icon-size-*` tokens. Import the `*Icon` export (`WalletIcon`, not `Wallet`).
- **Breakpoints:** 480 / 768 / 1024 (`--small-phone`, `--mobile` below 768, `--tablet-up`, `--desktop`). Below 768 is the phone layout: taller controls (40/48/52px), 44px tap targets, bottom sheets instead of dialogs. `@custom-media` rules in `src/styles/media.css`, injected into every CSS file by PostCSS (`@csstools/postcss-global-data` + `postcss-custom-media`), as in `orange`. JavaScript uses the same values from `src/constants/media.ts`.
- **Accessibility:** WCAG AA contrast in both themes, visible keyboard focus, respect `prefers-reduced-motion`.

## Conventions

- **Folder layout:** the repo root is this `money` folder. All app code lives in `src/` (the App Router is in `src/app`). Config files stay at the repo root. Never create a nested project folder (no `money/money`).
- **Components:** design system components (from the Claude Design handoff) live in `src/components/ui/`. Feature components live directly in `src/components/`. Storybook titles follow the folder: `Design system/<Name>` for `ui/`, `Components/<Name>` for feature components. Each component gets one lowercase folder with `index.tsx`, `styles.module.css`, `index.stories.tsx` (and `spec.test.tsx` once testing starts).
- **Props types:** extend native element props with `ComponentProps<"button">` (React 19). `ref` is a normal prop, so no `forwardRef`.
- Use Server Components by default. Add `"use client"` only when a component needs state, effects or browser APIs.
- Mutations from the web UI use Server Actions that validate input with Zod and check the session.
- Use design tokens (CSS variables) for all colors, spacing, radius, fonts and shadows. No hard-coded values in component CSS. Part-specific sizes go in `src/styles/tokens/components.css`.
- **Shared component styles** that several components use are CSS Modules in `src/styles/`: `control.module.css` (the input box of TextField, AmountField, Select, Combobox, DatePicker, …), `menu.module.css` (popup lists of Select, Combobox and Menu) and `choice.module.css` (label next to Checkbox, Switch, Radio).
- **Base UI:** interactive design system components wrap Base UI parts and style them with `data-*` state attributes (`[data-checked]`, `[data-highlighted]`, `[data-invalid]`, `[data-starting-style]`, …). `Providers` (`src/components/providers`) wraps the app and every story: `DirectionProvider`, the shared tooltip delay and the toast viewport (`useToast()` from `src/components/ui/toast`).
- **Forms:** put controls inside `Field` (Base UI Field), which wires the label, hint and error to the control. Controls that aren't Base UI fields (`DatePicker`) take an `id` that you also pass to Field's `htmlFor`.
- **Server-only code** (`src/db/`, `src/auth/`, `src/mcp/`) imports `server-only`.
- **Types, constants, utils and helpers** go in their own top-level folders, one file per topic:
  - `src/types/`: shared TypeScript types
  - `src/constants/`: fixed data and config
  - `src/utils/`: generic functions that would work unchanged in another project (for example `cx`, Jalali conversion, digit normalizing)
  - `src/helpers/`: functions specific to Money and its data (for example account balance, Jalali month range for budgets)
  - `src/hooks/`: React hooks that aren't tied to one component (for example `useControllableState`)

## Project structure

```text
src/
  app/                  App Router: layout (theme script, Providers), pages, icon.svg, apple-icon.tsx, globals.css
  components/
    ui/                 Design system: one folder per component (index.tsx, styles.module.css, index.stories.tsx)
                        logo, logo-mark, button, icon-button, tooltip, field, text-field, textarea, amount-field,
                        search-field, select, combobox, checkbox, switch, radio-group, segmented-control, calendar,
                        date-picker, jalali-date, dialog, sheet, menu, popover, toast, skeleton, empty-state, card,
                        badge, tag, category-chip, avatar, divider, amount, progress-bar, foundations (Storybook only)
    providers/          Base UI direction, tooltip delay group, toast viewport
    theme-sync/         Re-applies the theme after hydration and follows OS / other-tab changes
  constants/            category colors, media queries, theme script, transaction type labels
  helpers/              budget status, category color style
  hooks/                useControllableState
  styles/
    tokens/             colors, typography, spacing, radius, shadows, motion, components
    base.css            element defaults, focus ring, mirror-rtl, reduced motion
    typography.css      type helper classes (.type-*, .tabular, .ltr, .visually-hidden)
    media.css           @custom-media breakpoints
    control.module.css, menu.module.css, choice.module.css   shared component styles
    fonts.ts, fonts/    Dana via next/font/local
  types/                category, theme, transaction
  utils/                cx, focus, jalali, number, text, theme
```

## Workflow

1. Design one phase in Claude Design.
2. Send it to Claude Code with the "Send to Claude Code" button, together with that phase's Claude Code prompt from `docs/phases.md`.
3. Implement only that phase.
4. Commit on the phase branch and open a PR.
5. Merge when `build`, `lint`, type check and format check pass (tests are added later).
6. Move to the next phase.

Phases without UI (0a) run in Claude Code only.

- **Git:** project setup (Phase 0a) is committed directly on `main`. Every phase after that gets its own branch created from `main`.
- **Approval before committing:** never commit without asking first. Show the changed files and the proposed commit message(s), then wait for an explicit OK. An earlier approval does not cover later commits. The same applies to pushing and to creating the GitHub repo.
- **Branch names:** [Conventional Branch](https://conventionalbranch.org/): `<type>/<description>` with types `feature/`, `bugfix/`, `hotfix/`, `release/`, `chore/`. Lowercase letters, numbers and hyphens only. Phase branches use `feature/phase-<number>-<short-name>`.
- **Commit messages:** [Conventional Commits](https://www.conventionalcommits.org/): `<type>: <description>`.
- The PR description summarizes what the phase added.
- No hand-written design spec files. The design comes from the Claude Design handoff.
- When a decision changes, update this file in the same PR.

## Phases

The full plan with the Claude Design and Claude Code prompts for every phase is in `docs/phases.md`.

| # | Phase | Status |
|---|-------|--------|
| 0a | Project setup (on `main`): Next.js, TypeScript, ESLint, Prettier, packages, Storybook, Dana font | Done |
| 0b | Design system: logo, tokens, themes, RTL, base components, Storybook, first Vercel deploy | Done (Vercel deploy after merge) |
| 1 | Database and sign-in: Neon, Drizzle, Better Auth, login page, first admin | Not started |
| 2 | App shell: sidebar, mobile bottom bar, theme toggle, user menu, placeholder routes | Not started |
| 3 | User management (admin) | Not started |
| 4 | Accounts and categories | Not started |
| 5 | Transactions | Not started |
| 6 | Claude connector (MCP + OAuth) | Not started |
| 7 | Budgets | Not started |
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
| `/transactions` | Transactions (تراکنش‌ها) | 2 (placeholder until 5) |
| `/budgets` | Budgets (بودجه) | 2 (placeholder until 7) |
| `/reports` | Reports (گزارش‌ها) | 2 (placeholder until 8) |
| `/settings` | Settings (تنظیمات): profile and password, theme | 2 |
| `/settings/accounts` | Accounts | 4 |
| `/settings/categories` | Categories | 4 |
| `/settings/connector` | Claude connector: URL, connected apps | 6 |
| `/admin/users` | User management (admins only) | 3 |
| `/api/auth/[...all]` | Better Auth handler | 1 |
| `/mcp` | MCP endpoint (OAuth bearer token) | 6 |

All pages except `/login` (and the OAuth consent page, if one is needed) require a session.

## Reference repositories (siblings of this folder)

- `../daily-transactions`: MCP with `mcp-handler`, Neon access, Jalali helpers (`src/lib/jalali.ts`), the Dana font file, the MCP tool set and instructions.
- `../money-old` (GitHub `money-old`, formerly `money`): personal accounting features, Dana font notes, RTL and Persian number formatting rules.
- `../orange`: the implementation process, folder layout, Storybook setup, theme script and PostCSS media setup.
- `../kanvas`: Kanvas tokens (`src/styles/tokens.css`), the source of the royal blue ramp.

Tooling: pnpm, Turbopack, React Compiler off. The dev server and Storybook run on `money.localhost`.

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `storybook`, `build-storybook` (database scripts are added in Phase 1).
