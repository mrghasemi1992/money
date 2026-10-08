# Building Money with Claude

How Money was designed and built with Claude Design and Claude Code: the workflow, every prompt that was sent, the questions Claude asked and the answers given, the follow-up messages, and what each step produced.

This file is a log. It is updated at the end of every phase, in the same PR. The planned prompts for phases that haven't started yet are in [phases.md](phases.md); the prompts below are the ones that were actually sent, which sometimes differ from the plan.

- Repository: [mrghasemi1992/money](https://github.com/mrghasemi1992/money)
- App: Vercel project `money`. Design system docs: [money-storybook.vercel.app](https://money-storybook.vercel.app)
- Rules and decisions: [CLAUDE.md](../CLAUDE.md)

## Contents

- [Tools](#tools)
- [The workflow](#the-workflow)
- [Timeline](#timeline)
- [Step 0: Planning](#step-0-planning)
- [Phase 0a: Project setup](#phase-0a-project-setup)
- [Phase 0b: Design system](#phase-0b-design-system)
- [Phase 1: Database and sign-in](#phase-1-database-and-sign-in)
- [Change: One shared book with roles](#change-one-shared-book-with-roles)
- [Phase 1b: Languages and currency](#phase-1b-languages-and-currency)
- [Phase 2: App shell](#phase-2-app-shell)
- [Phase 3: User management](#phase-3-user-management)
- [Phase 4: Accounts and categories](#phase-4-accounts-and-categories)
- [Phase 5: Transactions](#phase-5-transactions)
- [Phase 6: Claude connector](#phase-6-claude-connector)
- [Phase 7: Budgets](#phase-7-budgets)
- [Next phases](#next-phases)
- [Notes on working this way](#notes-on-working-this-way)

## Tools

| Tool                                       | Used for                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Claude Code (Claude desktop app, Code tab) | Planning, writing every line of code, the docs, git, GitHub PRs, Vercel and Neon setup steps, testing in the browser |
| Claude Design (claude.ai/design)           | The design system and the screens of each phase, handed to Claude Code with "Send to Claude Code"                    |
| `claude_design` MCP                        | Lets Claude Code read the Claude Design project from the handoff (authorized with `/design-login`)                   |
| GitHub + Vercel + Neon                     | PRs with Vercel preview deployments, hosting, Postgres (a Neon branch per preview)                                   |

Model: Claude Opus 5.5. From Phase 2 on, set with `/model` and `/effort high` as the default for new sessions.

## The workflow

```text
Planning (Claude Code)
  └─ CLAUDE.md (source of truth) + docs/phases.md (a Claude Design and a Claude Code prompt per phase)

For each phase:
  1. Paste the phase's Claude Design prompt into Claude Design, iterate until the design is right.
  2. Press "Send to Claude Code". Claude Design builds a handoff prompt (see below); the phase's
     Claude Code prompt from docs/phases.md is pasted after "Implement:".
  3. Claude Code creates the phase branch, implements only that phase, checks build, lint,
     typecheck, format:check (and build-storybook), and updates CLAUDE.md.
  4. Claude Code shows the changed files and proposed commit messages and waits for an OK.
  5. Commit, push, open the PR. Vercel deploys a preview with its own Neon branch.
  6. Merge, then start the next phase.
```

Phases without UI (0a, 1b) skip the Claude Design steps.

### The handoff prompt

"Send to Claude Code" in Claude Design produces a prompt in this shape. The file list names the design files to read; the phase's Claude Code prompt goes after `Implement:`.

```text
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/<project-id>?file=<Screen>.dc.html

Focus on these files (the whole project is readable):
- `<Screen>.dc.html`

Also read these files the selection imports:
- `_ds/money-design-system-<id>/_ds_bundle.js`
- `_ds/money-design-system-<id>/styles.css`
- `_ds/money-design-system-<id>/tokens/….css`
- `support.js`

Implement: <the phase's Claude Code prompt from docs/phases.md>
```

## Timeline

| Step                       | Dates              | Branch                                | PR                                                    |
| -------------------------- | ------------------ | ------------------------------------- | ----------------------------------------------------- |
| Planning                   | 2026-10-01         | none                                  | none (CLAUDE.md and docs/phases.md committed with 0a) |
| 0a Project setup           | 2026-10-01         | `main`                                | none                                                  |
| 0b Design system           | 2026-10-01 → 10-02 | `feature/phase-0-design-system`       | [#1](https://github.com/mrghasemi1992/money/pull/1)   |
| 1 Database and sign-in     | 2026-10-02         | `feature/phase-1-auth`                | [#2](https://github.com/mrghasemi1992/money/pull/2)   |
| One shared book with roles | 2026-10-02         | `feature/shared-book-roles`           | [#3](https://github.com/mrghasemi1992/money/pull/3)   |
| 1b Languages and currency  | 2026-10-05         | `feature/i18n-and-currency`           | [#5](https://github.com/mrghasemi1992/money/pull/5)   |
| 2 App shell                | 2026-10-05         | `feature/phase-2-app-shell`           | [#6](https://github.com/mrghasemi1992/money/pull/6)   |
| 3 User management          | 2026-10-06         | `feature/phase-3-users`               | [#7](https://github.com/mrghasemi1992/money/pull/7)   |
| 4 Accounts and categories  | 2026-10-07         | `feature/phase-4-accounts-categories` | [#8](https://github.com/mrghasemi1992/money/pull/8)   |
| 5 Transactions             | 2026-10-07         | `feature/phase-5-transactions`        | [#10](https://github.com/mrghasemi1992/money/pull/10) |
| 6 Claude connector         | 2026-10-08         | `feature/phase-6-mcp`                 | [#11](https://github.com/mrghasemi1992/money/pull/11) |
| 7 Budgets                  | 2026-10-08         | `feature/phase-7-budgets`             | (linked when opened)                                  |

---

## Step 0: Planning

Tool: Claude Code. Date: 2026-10-01.

### Kickoff prompt

```text
Money app

I want to develop a personal accounting app in Persian with a right-to-left (RTL) interface. Users should be able to add transactions manually or use Claude Chat via MCP to create new transactions.

## Reference repositories
- Check the `daily-transactions` repository on my GitHub for guidance on implementing MCP and using Neon.
- Refer to the `money` repository for other features (personal accounting features) and for the Dana font.
- For the implementation process, follow the approach used in the `orange` repository.

## Design and implementation workflow
I want to design the app with Claude Design and implement it with Claude Code. For each phase, provide two prompts: one for Claude Design and one for Claude Code.

Start by creating the app's design system before implementing the rest of the interface. Do not use UI frameworks such as shadcn. Aim for a modern look inspired by the Kanvas design system; refer to Claude Design and use Kanvas's blue primary color.

## Technology stack
- React
- TypeScript
- Prettier
- Next.js or Vite (choose the best fit)
- lucide-react for icons
- Base UI
- Storybook for the design system

I'm leaning toward Next.js because the app needs MCP support, and I'd prefer not to create a separate backend project. However, if MCP can be handled within a single Vite project, Vite may be preferable. Please choose the best option.

## Other requirements
- Host the app on Vercel and use Neon.
- Add authentication with usernames and passwords; unlike `daily-transactions`, this app must include authentication.
- Store dates in a standard format in the database, not Jalali. Convert Gregorian dates to Jalali on the client.

If any part of my request is unclear, ask me before proceeding. Do not fill in gaps with assumptions.

If you've already started creating the app, don't create a "money" folder inside another "money" folder.
```

### Questions Claude asked

Because the prompt said not to fill gaps with assumptions, Claude asked before planning:

| Question                                                                                                          | Answer                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Who will have accounts in the app?                                                                                | Several, by invite                                                                                                                                                                         |
| How should Claude's MCP connector know which user it's acting for? (OAuth login / secret URL per user)            | "oauth login is easy? no need to buy a subscription for middle services?" Claude asked again, noting that its own OAuth server is free and runs inside the same Next.js app: **own OAuth** |
| Which features should the plan include?                                                                           | Dashboard, reports, budgets, CSV import/export                                                                                                                                             |
| Which color themes?                                                                                               | Light and dark                                                                                                                                                                             |
| How should amounts be shown? (toman / rial / user setting)                                                        | Rial (later made a user setting in Phase 1b)                                                                                                                                               |
| Should the daily-transactions data move into the new app?                                                         | "we will import it later" (Phase 11)                                                                                                                                                       |
| Where do you want the phase plan and the prompts?                                                                 | Files in this repo                                                                                                                                                                         |
| Which fields should a transaction have, besides date, amount, in/out and description?                             | Category, **and subcategory**, account / bank, tags, note                                                                                                                                  |
| How are invited users created?                                                                                    | Admin page                                                                                                                                                                                 |
| Persian only, or Persian with an English option?                                                                  | Persian only (changed to Persian + English in Phase 1b)                                                                                                                                    |
| Is a budget per category per month?                                                                               | Per category per month                                                                                                                                                                     |
| How do subcategories work?                                                                                        | One level, optional                                                                                                                                                                        |
| Are categories separate for income and expense?                                                                   | Separate                                                                                                                                                                                   |
| Should transfers between your own accounts be a transaction type?                                                 | Yes                                                                                                                                                                                        |
| Should accounts show a running balance?                                                                           | "I didn't understand what you meant." Claude rephrased it with an example (a رسالت card that starts at 50,000,000 rial and follows every transaction): **yes, show balances**              |
| Bank SMS show Jalali dates and LLMs are unreliable at calendar math. Which date format should the MCP tools take? | Jalali, the server converts                                                                                                                                                                |

### Result

- **Next.js over Vite**: the MCP endpoint, the OAuth server, sign-in and database access all live in one project as Route Handlers and Server Actions, with no separate backend.
- `CLAUDE.md`: the source of truth for the stack, data rules, design rules, conventions, workflow and phase table.
- `docs/phases.md`: a Claude Design prompt and a Claude Code prompt for every phase (0a to 12).

---

## Phase 0a: Project setup

Tool: Claude Code. Branch: `main`. Date: 2026-10-01. No design step.

### Claude Code prompt

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

### Follow-ups

```text
OK, commit it
```

```text
public, money, push it
```

### Result

Commit `7f87e07 chore: set up Next.js project` on `main`, with CLAUDE.md and docs/phases.md. Public GitHub repo `money` created and pushed.

---

## Phase 0b: Design system

Branch: `feature/phase-0-design-system`. Dates: 2026-10-01 → 10-02. PR [#1](https://github.com/mrghasemi1992/money/pull/1).

### Claude Design: setting up the design system

Claude Design's design system setup asked for a company name and blurb. Asked in Claude Code:

```text
Claude design for creating a design system asked me this:

Company name and blurb (or name of design system)
```

Claude Code's answer, pasted into Claude Design:

```text
Money (Persian wordmark: پول)

A personal accounting web app in Persian with a right-to-left layout. People record income, expenses and transfers between their own accounts, set a monthly budget per category, and see reports by category and by month. Entries are made by hand or by talking to Claude, which saves them through the app's connector. Dates use the Jalali calendar, numbers use Persian digits and amounts are in rial. Accounts are invite-only, created by an admin. It has light and dark themes and works equally well on phone and desktop. The look is modern, calm and trustworthy, based on the Kanvas design system, with royal blue #223BB2 as the primary color.
```

### Claude Design prompt

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

### Claude Code prompt (handoff)

Design project: `https://claude.ai/design/p/2cb876eb-4e63-4c09-a571-9e417280aab1`. The handoff listed the whole design system project (about 190 files: `tokens/*.css`, `components/<group>/<Name>.jsx` with `.d.ts`, `.prompt.md` and a card per group, `guidelines/*.html`, the logo and icon assets, the Dana font, `readme.md`, `SKILL.md`), followed by:

```text
Implement: Phase 0b: design system. Read CLAUDE.md first. Create branch feature/phase-0-design-system from main.

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

### Follow-ups

The first session was interrupted; a new one continued it:

```text
continue from where you left off
```

```text
OK, commit and open the PR
```

After the merge, in separate sessions:

```text
give me the logo of the app to upload it in vercel project section
```

```text
I want to add a design system for money as a separate project in Vercel, like the Orange project. do it
```

```text
commit current changes
```

```text
go ahead, commit to main
```

### Result

- PR #1: tokens and themes, Persian number and Jalali date utils, every design system component with stories, CLAUDE.md updated.
- On `main`: the two Vercel projects (`money` and `money-storybook`) described in CLAUDE.md, and `.claude/launch.json` for the dev server and Storybook previews.

---

## Phase 1: Database and sign-in

Branch: `feature/phase-1-auth`. Date: 2026-10-02. PR [#2](https://github.com/mrghasemi1992/money/pull/2).

### Claude Design prompt

```text
Using the Money design system, design the sign-in page (ورود), in Persian and RTL, light and dark, desktop and mobile.

- Logo, a short title, username (نام کاربری) and password (رمز عبور) fields, a show/hide password button and a ورود button.
- There is no sign-up and no "forgot password". Accounts are created by an admin. Add one quiet line saying that accounts are made by the admin.
- States: empty, filled, loading (button busy), wrong username or password (one general error, without saying which field was wrong), account disabled, too many attempts.
- Keep it calm and centered. On mobile it fills the screen and the keyboard must not hide the button.
```

### Claude Code prompt (handoff)

Design file: `https://claude.ai/design/p/d274d3ce-f87a-4507-b0c5-1018bf77d10c?file=Sign-in+States.dc.html`, plus the design system bundle, styles and tokens it imports.

This is the prompt as it was sent, before the shared book and roles change (per-user data with `user_id`, roles `admin` and `user`, `pnpm user:create-admin`). [phases.md](phases.md) now shows the updated version.

```text
Implement: Phase 1: database and sign-in. Read CLAUDE.md first. Create branch feature/phase-1-auth from main.

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

### Follow-ups

Setting up Neon and Vercel, step by step with Claude:

```text
in neon env

Create database branch for deployment: production, preview
tick both?
```

```text
is ok tell me to press connect button
```

```text
i tried vercel link in terminal but

zsh: command not found: vercel
```

(The Vercel CLI was installed under another Node version. Claude gave its full path, or `npm i -g vercel` for the current Node.)

```text
done, .env.local is pulled
```

```text
I forgot to add these to Vercel. Should I add them?  BETTER_AUTH_SECRET
BETTER_AUTH_URL
```

```text
this is the form. tell how to fill each of them
```

```text
id didn understand the form 4. explain step by step in details
```

```text
done, env pulled
```

```text
ok, commit them
```

```text
yes, push and open the PR
```

A copy change on the login page, found on the preview:

```text
replace
حساب‌ها را مدیر می‌سازد؛ برای دسترسی با مدیر تماس بگیرید.
by
ایجاد حساب کاربری فقط توسط مدیر امکان‌پذیر است؛ برای دسترسی با مدیر هماهنگ کنید.
```

```text
i want to create an admin user in preview env. how can i do that?
```

```text
i ran pnpm user:create-admin
the user created for production.
```

(Local development uses the production database, so the script created the admin in production. The preview's Neon branch had been copied from main before that, so Claude explained how to refresh it: Neon → Branches → the preview branch → Reset from parent.)

```text
In Neon we have just a database for production? yes or no
```

### Result

PR #2: Neon with Drizzle schema and migrations, Better Auth with username sign-in, admin roles and a sign-in rate limit, the login page, the first admin script, CLAUDE.md updated.

---

## Change: One shared book with roles

Branch: `feature/shared-book-roles`. Date: 2026-10-02. PR [#3](https://github.com/mrghasemi1992/money/pull/3). Not a planned phase: a change to the data model found after Phase 1.

### Claude Code prompt

The other users' usernames are replaced with placeholders here.

```text
- The app user management doesnt mean each user can create separate database (transactions). There is one book transactions, an admin have full access + user management + another one just have full access + another one with just read access


for example

user 1:
mrghasmei1992, admin
he has read access, write access and user managemnt



user 2:
<user 2>, level 2 (name it by yourself)
she has read and write access


user 3:
<user 3>, level 3 (name it by yourself)
he has read access


write means read, edit, create or delete a transaction
read mens just read a transaction


if its clear explain it again for me, then after my approve, update each part of the app, vercel and neon if needed
```

### Follow-ups

Claude explained the model back (one shared book; `admin`, `editor`, `viewer`) and asked whether editors manage everything except users:

```text
yes, editors manage everything except users, names are fine
```

The docs went to `main` first, then the code on a branch:

```text
yes, commit on main
```

```text
due to main is behind the origin, stash staged changes, pull main, then pop stash, commit and push ut
```

```text
push on main
```

```text
ok, start the code change on the branch
```

```text
yes, commit, push and open the PR
```

```text
yes, turn on auto-fix
```

### Result

- On `main`: CLAUDE.md and docs/phases.md describe one shared book with `admin`, `editor` and `viewer` roles.
- PR #3: no `user_id` on financial data, `created_by` / `updated_by` on transactions, the three roles in Better Auth, `requireWrite()`, `pnpm user:create` with a role choice.

---

## Phase 1b: Languages and currency

Branch: `feature/i18n-and-currency`. Date: 2026-10-05. PR [#5](https://github.com/mrghasemi1992/money/pull/5). Not in the original plan; no design step.

### Claude Code prompt

```text
phase 0b is done, deployed on vercel. phase 1 is done too. go to next phase
```

```text
before go to phase 1, i want to make this app to be in two languges: farsi and english so we need to have currency selection too: rial/toman, dollar, euro, British pound. so update the project and its doc before going to the next page. consider we need a settings page to change language, currencies and etc. phase 0b is done too change its status
```

### Questions Claude asked

| Question                                                                                                                    | Answer                                                               |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| How should currencies work in the shared book? (one book currency / currency per account / rial book with a converted view) | One book currency                                                    |
| How should the calendar relate to the language?                                                                             | Its own setting (defaults by language)                               |
| What should this change include, before Phase 2?                                                                            | The foundation and the docs (the settings screens come with Phase 2) |
| What language should signed-out visitors (the login page) see?                                                              | The browser's language                                               |

### Follow-ups

```text
for timezone follow user timezone (os timezone)
```

```text
run the migration and commit both
```

```text
push and open the PR
```

### Result

PR #5: next-intl with Persian and English, Jalali and Gregorian calendars, the book currency (IRR, USD, EUR, GBP), rial or toman, amounts in the smallest unit, the device time zone, Plus Jakarta Sans for English, a language switch on the login page, Storybook toolbars for language, calendar and money. CLAUDE.md updated, and a Phase 1b section added to docs/phases.md with the later phases' prompts updated for both languages. The Phase 1b prompt in [phases.md](phases.md) was written in this PR as a record of the change.

---

## Phase 2: App shell

Branch: `feature/phase-2-app-shell`. Date: 2026-10-05. PR [#6](https://github.com/mrghasemi1992/money/pull/6).

### Claude Design prompt

```text
Using the Money design system, design the app shell, in Persian (RTL) and English (LTR), light and dark. The interface language is a user setting; the English version mirrors the layout (sidebar on the left) and uses the Latin face and Latin digits.

Navigation: داشبورد, تراکنش‌ها, بودجه, گزارش‌ها, تنظیمات, plus مدیریت کاربران shown only to admins.

- Desktop: a sidebar on the start side (right in Persian, left in English) with the logo, the nav links and, at the bottom, the user's name with a menu (تنظیمات، تغییر تم، خروج). Show the active page clearly. It should be collapsible to an icon rail.
- Mobile: a bottom tab bar with the four main pages, and a central floating "add transaction" button (افزودن تراکنش). Settings and the user menu are reachable from a top bar.
- Desktop also has a clear "add transaction" button in the page header area.
- Viewers (بیننده) can only read: the add-transaction button (desktop and the floating one on mobile) is not shown for them. Show the user's role (مدیر / ویرایشگر / بیننده) quietly under their name in the user menu.
- A page header pattern: title and optional actions.
- Placeholder content for pages not built yet, a loading skeleton, an error page (مشکلی پیش آمد + تلاش دوباره) and a not-found page (صفحه پیدا نشد + بازگشت به داشبورد).
- Settings page, first version, in sections:
  - profile: display name, username read-only
  - change password: current, new, repeat
  - display: language (فارسی / English, each written in its own language), calendar (شمسی / میلادی), amounts in ریال / تومان (only shown when the book's currency is rial, with one line saying toman is ten rials), theme (روشن / تیره / سیستم)
  - for admins only, «تنظیمات دفتر» (book settings): currency (ریال ایران، دلار آمریکا، یورو، پوند بریتانیا). The currency can only be changed while nothing has been recorded yet; afterwards show it disabled with a one-line reason.
```

### Claude Code prompt (handoff)

```text
merged, go to phase 2
```

Claude asked whether to wait for the Claude Design handoff or build without one: wait for the handoff. Then the handoff, with the design file `https://claude.ai/design/p/3775f7cd-aa6b-4583-a953-95df97162dd4?file=App+Shell.dc.html` and the design system CSS and tokens it imports:

```text
Implement: Phase 2: app shell. Read CLAUDE.md first. Create branch feature/phase-2-app-shell from main.

Implement the attached design:
1. AppShell with skip link, the desktop sidebar (collapsible; save the choice in localStorage) and the mobile top bar + bottom tab bar + floating add button. Breakpoints from src/styles/media.css. Base UI Dialog for any drawer.
2. Nav items in src/constants/navigation.ts (label, href, icon, adminOnly), shared by the sidebar and the bottom bar. The admin item shows only for admins; check the role on the server. The add-transaction buttons show only for editors and admins.
3. User menu with settings, theme and sign out (wire the Phase 1 sign-out action).
4. Routes from CLAUDE.md as placeholders: /, /transactions, /budgets, /reports, /settings, /admin/users (admins only; others get not-found). The add-transaction button opens a placeholder dialog for now.
5. /settings: display name, change password (Better Auth), theme choice (light, dark, system). If the design shows a three-way theme choice, update the theme utils and CLAUDE.md to match.
6. Display preferences on /settings: language (reuse changeLocale from src/i18n/actions.ts), calendar and rial/toman, saved with updateUserPreferences in a Server Action that calls requireUser() and validates with Zod. The page re-renders in the new language right away.
7. Book settings on /settings for admins only (requireAdmin() in the action, hidden for others): the currency, upserted into the book table. Refuse a currency change once the book holds amounts (any transaction or budget, or a non-zero opening balance), checked in SQL in the action, with a clear error.
8. loading.tsx, error.tsx and not-found.tsx inside the shell. Page titles "<page> | پول" / "<page> | Money" from the messages.
9. All copy in src/messages (fa and en). Stories for every new component (Components/<Name>), with the App Router mocks for active links; check them with the language toolbar in both directions.

Check that build, lint, typecheck, format:check and build-storybook pass, and that switching language, calendar, rial/toman and (as an admin) the book currency works in the browser. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

### Follow-ups

The `claude_design` MCP wasn't connected in that session, so Claude asked how to get the design files: "I'll connect the MCP". In a new session:

```text
/design-login
/model     (Opus 5.5, saved as the default)
/effort    (high, saved as the default)
/clear
```

Then the same handoff prompt again. For the browser tests Claude asked for a signed-in admin session (local development uses the production database, so it changed and then restored the admin's own preferences, and only tested the currency change if the book held no amounts): "Signed in, test all".

```text
commit them
```

```text
yes
```

### Result

PR #6: the app shell (sidebar with icon rail, phone top bar and tab bar with the floating add button, user menu), placeholder pages, loading, error and not-found pages, and the settings page (profile, password, display preferences, book currency for admins). CLAUDE.md updated.

---

## Phase 3: User management

Branch: `feature/phase-3-users`. Date: 2026-10-06. PR [#7](https://github.com/mrghasemi1992/money/pull/7).

### Claude Design prompt

As planned in [phases.md](phases.md#phase-3-user-management-admin):

```text
Using the Money design system and app shell, design the admin page مدیریت کاربران, in Persian (RTL) and English (LTR), light and dark, desktop and mobile.

- A list of users: display name, username, role (مدیر / ویرایشگر / بیننده), language, status (فعال / غیرفعال), created date (in the viewer's calendar). On mobile it becomes a card list.
- "New user" (کاربر جدید) opens a dialog: display name, username, temporary password (with a "generate" button and a copy button), role, language (فارسی / English; sets the new user's calendar default too). The role choice shows one short line per role: مدیر (everything, plus managing users), ویرایشگر (read and change all data), بیننده (read only). The default is بیننده.
- A row menu: reset password (shows a new temporary password to copy, once), disable / enable, change role.
- Confirmation dialogs for disabling a user and for removing admin rights.
- An admin can't disable or demote themself; show that as a disabled option with a short reason.
- Empty, loading and error states.
- The page is about user accounts only; it shows no transactions or balances.
```

### Claude Code prompt (handoff)

The handoff, with the design file `https://claude.ai/design/p/14995d4f-ac77-43c6-a38c-6dc45293f0e4?file=User+Management.dc.html` (a canvas of `UsersPage.dc.html` frames) and the design system bundle, CSS and `support.js` it imports. The prompt is the one in phases.md:

```text
Implement: Phase 3: user management. Read CLAUDE.md first. Create branch feature/phase-3-users from main.

Implement the attached design at /admin/users with the Better Auth admin plugin:
1. List users; create a user (username, display name, temporary password, role, language; the calendar follows the language as in scripts/create-user.ts); reset password; ban/unban (disable/enable); set role (admin, editor, viewer). Every action is a Server Action that calls requireAdmin() first and validates input with Zod.
2. Generate temporary passwords on the server with node:crypto. Show them once and never store them in plain text.
3. Guards on the server too: an admin can't ban or demote themself, and the last admin can't be demoted.
4. Disabling a user also revokes their sessions and, once Phase 6 exists, their OAuth tokens. Leave a TODO in the code pointing to Phase 6.
5. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

### Where the implementation differs from the design

- **Password hint.** The design says the user sets their own password at first sign-in. Money has no forced password change, so the hint says to give the password to the person, who can change it later in Settings.
- **Reset password on your own row** is disabled with a reason (change it in Settings, with the current password). An admin reset skips the current-password check and signs the user out everywhere.
- **No undo after creating a user.** Users are never deleted. Undo is offered after disabling (it enables again).
- **Reset and disable sign the user out everywhere**, and the confirmation texts say so.
- **Username rules** stay the ones Better Auth's username plugin uses (Latin letters, digits, «.» and «_», 3 to 30 characters) instead of the design's lowercase-only with «-».
- **The error state** is the shell's error page (`error.tsx`), as on the other pages.

### Follow-ups

The UI was tested in Storybook with fake actions, because local development uses the production database; the real actions are tested on the PR's preview, which has its own Neon branch.

```text
commit them, then create pr
```

```text
yes, add and push it
```

(The second one approved this commit, which fills in the PR link and these follow-ups.)

### Result

`/admin/users`: the user list (table on wide screens, cards on narrow ones, search and role and status filters), new user with a server-made temporary password, change role with a confirmation for removing admin rights, disable with undo, enable, and reset password with the new password shown once. Role changes and disabling are guarded in the SQL statement that writes them (no self-demotion or self-ban, and the last enabled admin stays). Disabling deletes the user's sessions in the same statement, with a TODO for Phase 6 to revoke OAuth tokens. Menu items got an optional description line, for disabled actions with a reason. Stories for every new component. CLAUDE.md updated.

---

## Phase 4: Accounts and categories

Branch: `feature/phase-4-accounts-categories`. Date: 2026-10-07. PR [#8](https://github.com/mrghasemi1992/money/pull/8).

### Claude Design prompt

As planned in [phases.md](phases.md#phase-4-accounts-and-categories).

### Claude Code prompt (handoff)

The handoff, with the design file `https://claude.ai/design/p/410b1d85-ba50-452b-9598-88e4ae39cfe2?file=Money+Settings.dc.html` (a canvas of `SettingsScreen.dc.html` frames: both pages in Persian and English, light and dark, desktop and mobile, the dialogs and sheets, empty, loading and error states, and the viewer's read-only pages) and the design system bundle, CSS and `support.js` it imports. The prompt is the one in phases.md:

```text
Implement: Phase 4: accounts and categories. Read CLAUDE.md first. Create branch feature/phase-4-accounts-categories from main.
Implement the attached design at /settings/accounts and /settings/categories:

1. Queries and mutations in src/db/ (server-only) on the shared book. Pages call requireUser(); every mutating Server Action calls requireWrite() first and validates with Zod.
2. Account balance helper in src/helpers/ (opening + income − expense − transfers out + transfers in), computed in SQL. Transactions don't exist in the UI yet, so balances equal the opening balance for now, but the query must already be the real one.
3. Category rules on the server: one level of subcategories, a subcategory has its parent's type, delete only when unused (otherwise archive), names unique per type + parent.
4. Starter categories: a constant list in src/constants/ with names in both languages, added in one Server Action in the acting user's language.
5. Reordering accounts (sort_order). Archiving hides an account from forms.
6. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

### Where the implementation differs from the design

- **Account type.** The design gives each account a type (bank card, cash, other) with its own icon. It wasn't in the data model, so `accounts.type` was added (migration `0003_account_types`, default `card`). Account names became unique ignoring case (a unique index on `lower(name)`), as the design's «حسابی با این نام وجود دارد» needs.
- **Negative starting balances.** The data model allows them (an overdrawn card) but the design's amount field has no sign. AmountField got `allowNegative`: a leading «-» or «−» makes the amount negative.
- **Navigation.** The design's sidebar lists حساب‌ها and دسته‌بندی‌ها under a Settings heading. The app shell keeps one Settings item; /settings got a first section that links to both pages, and on phones the top bar's back button goes from a settings subpage to /settings.
- **Viewers' empty states** say an editor or admin adds accounts and categories (the design says «مالک دفتر», book owner, which isn't a role).
- **Undo** is offered after adding, deleting, archiving and restoring, as the copy rules ask. Editing shows «تغییرات ذخیره شد» without undo. Undoing a delete adds the account or category again (with its subcategories) under a new id; it had no transactions, so nothing pointed to the old one.
- **Subcategory rows** don't get the parent's «+ زیردسته» button on phones (as in the design); the row menu has it.
- **Starters** are offered while a type has no active categories. A suggestion whose name already exists (also an archived one) isn't offered.
- **The type control** in the account form is a labelled group instead of a Field: inside a Field, Base UI named every option «نوع». The same problem in the new-user form's language control is left for a separate fix.

### Testing

The UI was tested in Storybook with fake actions (both languages, both themes, desktop and phone; drag and drop, menus, dialogs, undo). Because local development uses the production database, the SQL was tested against a throwaway local Postgres 18 with all migrations applied, running the real `src/db` functions through node-postgres. That caught a real bug: in a one-table query Drizzle writes columns without their table, so inside the balance and usage subqueries `"id"` meant the transaction's id and every balance came back as the opening balance. The outer columns are now qualified.

### Follow-ups

Trying the pages locally, the accounts page failed with `column "type" does not exist`: local development uses the production database, and the new migration hadn't run there yet.

```text
i'm in /accounts page but i got error
```

Claude explained the cause and asked before migrating production (the migration only adds a column with a default, a check and an index, so the deployed app keeps working). The migration was then applied from the terminal:

```text
pnpm db:migrate
```

```text
it works now, commit them
```

```text
push and create the pr
```

### Result

`/settings/accounts`: the total balance of the active accounts, the accounts in their saved order (drag by the handle from 768px up, «انتقال به بالا / پایین» in the row menu everywhere), each with its type, transaction count and live balance; add and edit (name, type, starting balance), archive and restore, delete only without transactions (otherwise a dialog offers to archive). `/settings/categories`: expense and income tabs, categories with their subcategories in the parent's color, add, rename and recolor (subcategories follow), archive, restore, delete only when nothing in the family is used, and suggested starter categories (one tap, or all at once) named in the user's language. Balances are computed in SQL by `accountBalance` (`src/helpers/account-balance.ts`); each rule is checked by the Server Action for a clear message and again in the statement that writes. Viewers see both pages read only. Loading and error states for both pages, links from /settings, stories for every new component. CLAUDE.md updated.

---

## Phase 5: Transactions

Branch: `feature/phase-5-transactions`. Date: 2026-10-07. PR [#10](https://github.com/mrghasemi1992/money/pull/10).

### Claude Design prompt

As planned in [phases.md](phases.md#phase-5-transactions).

### Claude Code prompt (handoff)

The handoff, with the design file `https://claude.ai/design/p/ac0b31b3-e13c-4a9a-90d1-aba0155d0a46?file=Transactions.dc.html` (one `Transactions.dc.html` with switches for language, theme, device, role (owner or viewer), data state (live, loading, empty) and the previews: list, filters, add, errors, edit, detail, unknown, delete) and the design system bundle, CSS and `support.js` it imports. The prompt is the one in phases.md:

```text
Phase 5: transactions. Read CLAUDE.md first. Create branch feature/phase-5-transactions from main.

Implement the attached design at /transactions, and wire the global add button from Phase 2 to the new form:
1. src/db/transactions.ts (server-only): list with filters (Gregorian date range, type, account, category including its subcategories, tag, search on description/note/tags, unknown only), create, update, delete, month totals, on the shared book. Reads call requireUser(); create, update and delete call requireWrite() and set created_by / updated_by from the session. Validate that the account and category exist and match the type rules in CLAUDE.md.
2. Server Actions with one Zod schema shared by the form and the server. Amount arrives as an integer in the book currency's smallest unit (rials, cents); the date as ISO. Validation errors are translated on the server.
3. The month switcher and filters use the viewer's calendar months in the UI. Convert them to a Gregorian range with monthRange (src/utils/calendar.ts) before querying. Keep the filters in the URL search params, so a filtered view can be shared and survives a refresh.
4. The form: AmountField and DatePicker from the design system. The default date is today in the viewer's time zone (Preferences.timeZone). Tag suggestions come from the existing tags in the book. "Save and add another" keeps type, account and date.
5. source = "web" for rows created here.
6. Pagination or "load more" by month. Keep the list fast for tens of thousands of rows.
7. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass, and test creating, editing, deleting and filtering in the browser, including a transfer, and that a viewer sees no write controls and gets an error from the Server Actions. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

### Where the implementation differs from the prompt and the design

- **Role checks.** The prompt puts `requireUser()` / `requireWrite()` inside `src/db/transactions.ts`. They stay in the page and the Server Actions instead, like every other `src/db` file: those checks read the session cookie and redirect, which the MCP tools of Phase 6 can't use with a bearer token. The db functions take the acting user's id for `created_by` / `updated_by`; the actions pass the session's user. Every write action calls `requireWrite()` first, and reading more of the list calls `requireUser()`.
- **Category icons.** The design gives each category an icon (utensils, car, …); categories have only a color. On phones the row's tile is tinted with the category's color and shows the type's arrow.
- **Category is required** for income and expense in the web form, as the design asks, although the database allows none (Claude saves unknown ones without a category).
- **Search** covers the description, note, tags and category names (the design's placeholder). The design's mock also matched accounts and amounts; the account has its own filter.
- **A category itself can be picked** («بدون زیردسته» under it), not only its subcategories, since categories may have none. The filter's picker lists expense and income categories, each with «همه» for the whole family.
- **No undo after an edit** («تغییرات ذخیره شد»), following the copy rules (undo after add and delete). Undoing a delete adds the transaction again under a new id, by the acting user.
- **Shell.** The design's sidebar has its own «ثبت تراکنش» button, a Claude card and a dark-mode switch; the Phase 2 shell keeps «افزودن تراکنش» in the page header and the theme in the user menu.
- **Month in the URL.** `month=1405-07` is a Jalali month and `month=2026-10` a Gregorian one (told apart by the year); a viewer with the other calendar sees the shared month as a date range.
- **A tag typed without pressing Enter** is kept as a tag when the box loses focus, so it isn't lost when saving.

Changes to earlier parts, found while building and testing:

- **Popups above dialogs.** `--z-popup` was below `--z-overlay`, so a Select, Combobox or DatePicker opened inside a dialog drew behind it (no earlier dialog had one). Popups are now 150, between overlays (100) and toasts (200).
- `Dialog`, `Sheet` and `ResponsiveDialog` take `initialFocus` (the amount field). `Combobox` options take a `selectedLabel` (an option that stands for the whole group shows «خوراک», not «خوراک / همه»). New design-system control `TagInput`. `Amount` uses the shared `TRANSACTION_TYPE_ICONS`.
- Migration `0004_transaction_list_index` replaces the date index with one on `(date, created_at, id)`, the list's order. It only adds an index, so the deployed app keeps working before it runs.

### Testing

Local development uses the production database, so the browser tests ran against a throwaway Postgres 17 in Docker with all migrations applied. The dev server was pointed at it through a temporary node-postgres switch in `src/db/index.ts` and a seed script, both removed afterwards and not committed. Three local test users (admin, editor, viewer), three accounts, a few categories and 300 generated transactions.

Tested in the browser: adding an expense (errors on every empty required field at once, a subcategory found by search, a new tag typed with Arabic «ي» saved as «کاری»), «ثبت و افزودن بعدی» (form reset with type, account and date kept, the dialog staying open through the refresh), a transfer (the same-account error, then saved), the detail, editing, deleting with undo, adding from the dashboard; filters (search, type, account, the whole «خوراک» family, a date range, unknown only, clear all) with counts and totals checked against SQL; the previous month through the URL; «نمایش بیشتر» to all 93 rows of a month, with a day split between pages showing its full net; the phone layout (tiles, detail sheet, add sheet). Viewer: with the edit form open, the signed-in admin was demoted to viewer in the database and saved; the Server Action refused it, nothing changed, and the page came back without write controls. A fresh viewer page has no add, edit or delete controls and a read-only detail. `EXPLAIN ANALYZE` shows the month query using the new index without a sort.

Bugs found this way and fixed: popups behind dialogs, the category error hidden while the amount was also missing (Zod skips refinements while a field fails), the account column showing on narrow lists and pushing the row's buttons to a second line, summary amounts clipped on phones, and a tag lost when the box lost focus.

### Result

`/transactions`: a month of the viewer's calendar (or a date range) with its income, expense and net, the filters (search, dates, type, account, category with its subcategories, tag, unknown only) as removable chips and in the URL, and the transactions grouped by day with each day's net, 50 at a time with «نمایش بیشتر». Rows show the category or the transfer's route, the account, tags, a Claude mark and the signed amount; unknown ones are marked «ناشناس». The detail shows who added and last edited a transaction. Editors and admins add (from every page, through the header or floating button), edit and delete with undo; viewers read. One Zod schema for the form and the actions, checks of the accounts and category in the database, errors translated on their field. Keyset pagination with a matching index. Stories for every new component. CLAUDE.md updated.

## Phase 6: Claude connector

Branch: `feature/phase-6-mcp`. Date: 2026-10-08. PR [#11](https://github.com/mrghasemi1992/money/pull/11).

### Claude Design prompt

As planned in [phases.md](phases.md#phase-6-claude-connector-mcp--oauth).

### Claude Code prompt (handoff)

The handoff, with the design file `https://claude.ai/design/p/a3595c44-16c8-43b9-8064-eba0e06d9e8a?file=Claude+Connector+Screens.dc.html` (a canvas of `Connector Settings.dc.html` frames: both languages, light and dark, desktop and mobile, the revoke confirmation, the toast and no apps; and `Claude Consent.dc.html` frames: the consent for an editor, an admin and a viewer, and sign-in first) and the `support.js` it imports. The design files were read through the design MCP. The prompt is the one in phases.md:

```text
Phase 6: Claude connector. Read CLAUDE.md first. Create branch feature/phase-6-mcp from main.

Goal: users add https://<domain>/mcp as a custom connector in claude.ai, sign in once with their username and password, and Claude works on the shared book with that user's role.

1. OAuth: read the current Better Auth docs and the current MCP authorization spec. Use Better Auth's OAuth 2.1 provider / MCP plugin (whichever the docs now recommend) for authorization, token and client registration (dynamic client registration and/or client ID metadata documents, whichever claude.ai uses today), PKCE, and the .well-known metadata (oauth-authorization-server and oauth-protected-resource). Use the consent page from the attached design. Sign-in goes through /login and returns to the consent page.
2. MCP endpoint at src/app/mcp/route.ts with mcp-handler, wrapped in withMcpAuth. It verifies the bearer token with Better Auth, rejects banned users, and puts the user id and current role in the tool context. Tool code lives in src/mcp/ (server-only) and reuses the src/db/ functions from Phase 5, so the same rules apply as in the web UI.
3. Tools, modeled on ../daily-transactions/src/lib/mcp.ts:
   - today
   - list_accounts (with balances), list_categories (with subcategories and type)
   - add_transactions (batch, with possible duplicates: same date, account, amount and type)
   - list_transactions (filters + totals), update_transaction, delete_transactions (destructive hint; only when the user asks)
   Viewers only get the read tools (today, list_*). The write tools also call requireWrite() on every call, so a role change applies to an existing connection right away. Rows added or changed through MCP set created_by / updated_by to the token's user.
   MCP requests carry no browser time zone: save the browser's time zone on the user record when the web app reports it (add a column), and use it for today in the tools, falling back to Asia/Tehran.
   Dates in and out are in the user's calendar: Jalali YYYY/MM/DD or Gregorian YYYY-MM-DD (today says which), converted at this boundary with src/utils/calendar.ts and src/utils/jalali.ts. Amounts in and out are in the book currency's main unit (rials for IRR, toman × 10; dollars, euros or pounds with up to two decimals), converted to the smallest unit here; today also returns the currency. Accounts and categories are matched by id, with names in the list tools so Claude can map "رسالت" to an id. An unknown description is "؟". Write the server instructions in the same style as daily-transactions, adapted to accounts, categories, transfers, the book currency, both calendars and read-only (viewer) users.
4. source = "mcp" for rows created here. The web list shows the mark from the Phase 5 design.
5. /settings/connector from the design: the URL, a list of the user's OAuth clients/tokens, revoke. Banning a user (Phase 3) now also revokes their tokens; resolve the Phase 3 TODO.
6. Test the full flow locally with the MCP Inspector, then on a Vercel preview with claude.ai. Tell me when it's ready for me to add the connector.

Check that build, lint, typecheck and format:check pass. Update CLAUDE.md and the README (connector setup). Show me the changes and proposed commits, and wait for my OK.
```

### Follow-ups

1. The session hit its usage limit after the local tests, before the Inspector test, the stories and the docs. In a new turn: "continue from where you interrupted".

### Decisions and where the implementation differs from the prompt and the design

- **Client registration.** The current Better Auth docs recommend the `mcp` plugin (an OAuth 2.1 provider set up for MCP) over a separate `oauthProvider`, with `cimd` for Client ID Metadata Documents; MCP has deprecated dynamic client registration. claude.ai's connector docs list CIMD and DCR as supported and use CIMD when the authorization server metadata advertises it with the `none` token auth method. So Money offers CIMD only: no open registration endpoint, and nobody can create clients through the API.
- **Token checks.** The prompt's "verifies the bearer token with Better Auth" is done with Better Auth's JWT verification, reading the signing keys through `auth.api.getJwks()` rather than over HTTP (a preview's own URL can sit behind Vercel's protection). Access tokens are JWTs, which can't be revoked, so every MCP request also checks the user's consent for that app in the database (and marks it used); revoking on `/settings/connector` or disabling the user deletes the consent and tokens, and access ends at the next request.
- **`requireWrite()` on every call.** `requireWrite()` reads the session cookie and redirects, which a bearer-token request can't use (as noted in Phase 5). The write tools re-read the user's role from the database on every call instead; viewers don't get them at all.
- **Dates in.** Results use the user's calendar as asked. Input accepts both forms, the year telling the calendar (below 1700 is Jalali, as in the transactions URL), so a Jalali date from a bank SMS works for a user of the Gregorian calendar without Claude converting it.
- **Category.** Claude may save income or expense without a category (an unknown transaction), as the database allows; the web form still requires one (`categoryRequired`).
- **Batches.** `add_transactions` saves all or none, and reports each invalid row with its reasons, so Claude can fix and retry without duplicates.
- **Local URL.** OAuth only accepts plain HTTP resources on `localhost`, so locally the connector URL is `http://localhost:3000/mcp` while the app runs on `money.localhost`. Previews use the branch URL.
- **Time zone.** The browser's time zone is saved on the user from the app layout (after the response) when TimeZoneSync's cookie differs. TimeZoneSync only wrote the cookie when the browser's zone differed from the server's guess, so a user in Asia/Tehran never reported one; it now always keeps the cookie current.
- **Design.** The consent and sign-in screens use Money's username, not the design's email. The Claude mark is Lucide's sparkles, as in the design (no official mark). The connected apps show the day of «last used», not the time. The settings page has no breadcrumb (no other settings subpage has one), and the design's sidebar Claude card isn't built (as in Phase 5). The consent page also says where the answer goes («… به claude.ai برمی‌گردید»), which the MCP spec asks for.
- **Settings.** `/settings` gets a second link section, «Claude», for the connector page.
- **Dependencies.** `@better-auth/mcp`, `@better-auth/cimd`, `@better-auth/oauth-provider`, `mcp-handler`, `@modelcontextprotocol/server`, and `@better-auth/utils` pinned to the version Better Auth's core expects (otherwise the new plugins resolved a second copy of `@better-auth/core` and the types broke).

### Testing

Like Phase 5, against a throwaway Postgres 17 in Docker with all migrations, through a temporary node-postgres switch in `src/db/index.ts` and a seed script (three users: admin, editor, viewer; three accounts; categories; a few transactions), all removed afterwards and not committed.

- **OAuth as Claude Code**, with its real Client ID Metadata Document (`https://claude.ai/oauth/claude-code-client-metadata`) and a local callback: 401 with `resource_metadata`, the protected resource and authorization server metadata, the CIMD client created, `/login` with «Claude Code is asking to connect», straight on to the consent page after signing in, Allow, the code exchanged with PKCE and `resource` (form-encoded), a JWT bound to `http://localhost:3000/mcp`, a refresh token, and the refresh grant (rotated). An existing consent skips the page; Deny ends on the design's result screen.
- **Tools**, through a small JSON-RPC client: `today` (1405/07/16, Asia/Tehran), balances, categories; a batch with a future date, a transfer to the same account and a bad date and fractional rials (nothing saved, every reason listed); a valid batch with Persian digits, an Arabic «ي» in a tag, an empty description (saved as «؟», no category), a transfer with a Gregorian date (shown back in Jalali) and a copy of an existing transaction (flagged as a possible duplicate); filters and totals for the «خوراک» family, unknown only, an update (and a refused change of type with an expense category), deleting the duplicate with an unknown id reported. Rows have `source = mcp` and the token's user as author and editor, and show the Claude mark on `/transactions`.
- **Roles and revoking:** demoting the editor to viewer with the token still valid: the next `tools/list` has only the read tools and a direct `delete_transactions` call fails. The viewer (English, Gregorian) gets Gregorian dates and only «Read transactions» on the consent page. Revoking on `/settings/connector`: the toast, the empty state, and the still-unexpired token gets 401 and its refresh token `invalid_grant`. Disabling the user (`disableUser`): signed out, consent and tokens gone in the same statement, 401.
- **Time zone:** saved on the user after a page load; `today` follows it (America/Los_Angeles still on 7 October).
- **MCP Inspector 2.9:** it discovers the server but expects dynamic client registration, so it got a client registered for it in the test database. Sign-in, «تغییر حساب» from the viewer to the editor, Allow, «Authorization complete», connected and tools run on both protocol versions (2025-11-25 and 2026-07-28).
- The consent page and the connector page on a phone and in the light theme.

Bugs found this way and fixed: TimeZoneSync not reporting a time zone the server had guessed right, and «Settings › Connectors» breaking after the chevron on phones.

### Result

The Claude connector: Money is an OAuth 2.1 authorization server for its MCP endpoint (Better Auth `mcp` + `cimd` + `jwt`, migration `0005_oauth_connector`), with the discovery metadata, Claude's sign-in through `/login`, the consent page from the design and `/settings/connector` (URL with copy, steps, connected apps with revoke, examples). `/mcp` checks the token, the grant and the user on every request and offers seven tools on the same queries and rules as the web UI, with dates in the user's calendar and amounts in the book currency; viewers read only. Disabling a user revokes their connections (the Phase 3 TODO). Stories for the new components and the login's Claude state. CLAUDE.md and the README (connector setup) updated.

---

## Phase 7: Budgets

Branch: `feature/phase-7-budgets`. Date: 2026-10-08. PR: linked when it is opened.

### Claude Design prompt

As planned in [phases.md](phases.md#phase-7-budgets).

### Claude Code prompt (handoff)

The handoff, with the design file `https://claude.ai/design/p/ad61f70f-27c1-4a17-b7c5-8a70a270305f?file=Budgets+Board.dc.html` (a canvas of `Budgets Page.dc.html` frames: both languages, light and dark, desktop and mobile; add, edit and remove as dialogs and sheets; no budgets yet; a viewer), the design system bundle and tokens it imports, and `support.js`. The design files were read through the design MCP. The prompt is the one in phases.md:

```text
Phase 7: budgets. Read CLAUDE.md first. Create branch feature/phase-7-budgets from main.

Implement the attached design at /budgets:
1. CRUD for budgets (only top-level expense categories, one per category), Server Actions with Zod that call requireWrite(). The page calls requireUser().
2. Spending per budgeted category for a month of the viewer's calendar in one SQL query: expense transactions in the month's Gregorian range, with subcategories rolled up into the parent. Transfers are excluded.
3. The month switcher uses the viewer's calendar months and keeps the month in the URL.
4. Rows link to /transactions with the category and month filters set.
5. Stories for the new components.

Check that build, lint, typecheck, format:check and build-storybook pass. Update CLAUDE.md. Show me the changes and proposed commits, and wait for my OK.
```

### Decisions and where the implementation differs from the prompt and the design

- **Near the limit at 80%.** The design and phases.md use 80%; the code had 85% since Phase 0b (`BUDGET_NEAR_RATIO`). It is now 80%, for ProgressBar too.
- **One query.** The same statement reads every top-level expense category with its budget, its active subcategories and its spending, so the rows, the totals and the «without a budget» list come from one round trip.
- **Save is one action.** Adding and changing a budget are the same upsert, so two people setting the same category at once can't fail on the unique constraint; the action says whether it was new, and only a new budget offers «واگرد» (the design's toast has none; the app's rule is undo after add and delete).
- **URL.** `?month=1405-07`, the same parameter as the transactions page. A month of the other calendar opens the viewer's month around its middle. The switcher also goes into future months (budgets repeat; nothing is spent yet), as in the design.
- **Rows.** Most used first, as in the design. They link to `/transactions?month=…&category=…`; the category filter already includes subcategories, so the transactions page's expense total matches the row. Categories have no icons in Money, so rows show the category's color dot (the design shows icon tiles).
- **Archived categories.** A budget whose category was archived keeps its row with an «بایگانی‌شده» badge and can be changed or removed; an archived category can't get a new budget (checked in the statement that writes).
- **Empty state.** Viewers see the app's usual «when an editor or admin …» wording instead of the design's «book owner». Without any expense categories, writers get a link to `/settings/categories`.
- **Today's line.** The design's pace marker on the summary bar is a new `marker` / `markerLabel` on ProgressBar. ProgressBar's `aria-label` now names the meter.
- **Header.** As in the design, the budgets header has the month switcher, «ماه جاری» and «تعیین بودجه», not «افزودن تراکنش» (the tab bar's button still adds transactions on phones).

### Testing

Local development uses the production database, so nothing was written to it: the read query ran against it, and the insert and delete statements were checked with `EXPLAIN` (which plans them without running them). The page's states and flows were checked in Storybook with working fakes: setting a budget from a category without one, editing, removing (confirmation over the form) and «واگرد»; the row links; the empty states for writers, viewers and a book without expense categories; Persian and English, light and dark, desktop and phone. The real `/budgets` wasn't opened signed in: the preview browser had no session, and the only accounts are on the production book.

Bugs found this way and fixed: the summary's amounts overflowing their cells on phones, and the phone rows' order (percent next to the name, status before spent of limit).

### Result

The budgets page from the design: a month of the viewer's calendar in the URL, the month's spent, total budget and remaining with a line for today, one row per budget linking to that category's transactions for the month, the expense categories without a budget, and the add / edit / remove dialogs with undo; viewers read only. One SQL query for the month's spending with subcategories rolled up, Server Actions with Zod and `requireWrite()`. Stories for the new components and ProgressBar's marker. CLAUDE.md updated.

---

## Next phases

Phases 8 to 12 haven't started. Their planned prompts are in [phases.md](phases.md). Each one gets a section here when it is done, in the same shape:

```markdown
## Phase N: <name>

Branch: `feature/phase-N-…`. Date: YYYY-MM-DD. PR [#n](https://github.com/mrghasemi1992/money/pull/n).

### Claude Design prompt

### Claude Code prompt (handoff) (as sent; design file link; differences from phases.md)

### Questions Claude asked (question and answer table, if any)

### Follow-ups (the messages sent after the prompt, in order)

### Result (what the PR added)
```

## Notes on working this way

- **CLAUDE.md first.** Every Claude Code prompt starts with "Read CLAUDE.md first". The prompts stay short because the rules live in one place, and each phase updates CLAUDE.md in its own PR.
- **"Ask me before proceeding."** The kickoff prompt told Claude not to fill gaps with assumptions. It asked about 20 questions before writing the plan, and asked again when an answer was unclear (OAuth cost, running balances).
- **Approval before every commit and push.** Claude shows the files and proposed commit messages and waits. An earlier OK doesn't cover later commits.
- **Plans change.** Two changes came up between phases (one shared book with roles, Persian and English with a book currency). Each was its own branch and PR, and docs/phases.md was updated so the later prompts matched.
- **Design handoff over the MCP.** The handoff only works when the `claude_design` MCP is connected and authorized (`/design-login`) in the Claude Code session.
- **Local development uses the production database.** Scripts run locally (like creating a user) write to production; previews get their own Neon branch.
