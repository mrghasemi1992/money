# Money: a personal accounting app in Persian and English

Money is a personal accounting app for a person or a family: one shared book of accounts, categories, transactions and budgets, with a Persian (right-to-left, default) and an English (left-to-right) interface, Jalali and Gregorian calendars, roles (admin, editor, viewer), reports, CSV import and export, and an MCP connector through which Claude and ChatGPT read and record transactions. Next.js on Vercel, Postgres on Neon, Better Auth. Each family self-hosts a fork. Built by Mohammad Reza Ghasemi with Claude Code; PolyForm Noncommercial License 1.0.0 (`LICENSE`), the name and logo aren't covered.

## Read before you work

The docs are the source of truth for how Money works. This file only holds what every session needs.

- **Before your first change in a session**, read [docs/development/architecture.md](docs/development/architecture.md) (the parts, a request step by step, the data rules and model, routes, the folder map, the glossary) and [docs/development/decisions.md](docs/development/decisions.md) (the key decisions and their trade-offs: don't undo one without asking). All docs are listed in [docs/README.md](docs/README.md).
- **Before changing an area**, read its doc:

| Area | Doc |
|------|-----|
| Users, roles, sign-in, `/setup`, `/admin/users`, Better Auth, security headers | [docs/development/features/users-and-auth.md](docs/development/features/users-and-auth.md) |
| Accounts and categories | [docs/development/features/accounts-and-categories.md](docs/development/features/accounts-and-categories.md) |
| Transactions | [docs/development/features/transactions.md](docs/development/features/transactions.md) |
| Budgets | [docs/development/features/budgets.md](docs/development/features/budgets.md) |
| Reports and charts | [docs/development/features/reports.md](docs/development/features/reports.md) |
| Dashboard | [docs/development/features/dashboard.md](docs/development/features/dashboard.md) |
| CSV import and export | [docs/development/features/csv.md](docs/development/features/csv.md) |
| Claude and ChatGPT connector (MCP, OAuth) | [docs/development/features/connector.md](docs/development/features/connector.md) |
| Languages, calendars, currency, time zones | [docs/development/features/languages-and-currency.md](docs/development/features/languages-and-currency.md) |
| Design system, app shell, skeletons, pending states, copy | [docs/development/features/design-system.md](docs/development/features/design-system.md) |
| Releases, deployments, migrations, Dependabot, version check | [docs/development/releases.md](docs/development/releases.md) |
| Local development, Neon branches | [docs/development/local-development.md](docs/development/local-development.md) |
| Setup, scripts, workflow, the feature checklist | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Self-hosting and updating a copy | [docs/self-hosting.md](docs/self-hosting.md), [docs/updating.md](docs/updating.md) |

If the code and a doc disagree, say so to the user instead of picking one silently.

## Rules that always apply

- **One shared book, no `user_id` on financial data.** Access is by role, read fresh from the user record on every request. Every page, Server Action and Route Handler calls `requireUser()`, `requireWrite()` or `requireAdmin()` (`src/auth/session.ts`); MCP tools check the token's user and role. `src/proxy.ts` is only a redirect, never the check. Hiding controls in the UI is a convenience, not security.
- **The acting user** (`created_by`, `updated_by`) comes from the session or the OAuth token, never from input.
- **Dates are stored as Gregorian** (`date`, ISO strings through the app). Convert to the viewer's calendar only in date components and at the MCP boundary. Months, budgets and reports follow the viewer's calendar (`monthRange`); "today" is in the viewer's time zone (`todayIso`).
- **Amounts are integers in the book currency's smallest unit** (rials, cents, pence), positive, with the type giving the direction. Format only with `src/helpers/money.ts` or the `Amount` component. Toman is display only.
- **Transfers are never income or expense** in totals, budgets or reports. Balances come from `accountBalance()` in SQL; sum in Postgres, never in JavaScript.
- **The database enforces the rules too** (constraints in `src/db/schema/`); validate on the server first anyway, to show a clear error. Neon's HTTP driver has no interactive transactions: use `db.batch([...])` for writes that belong together.
- **Migrations stay backward compatible** with the previous version (expand, then contract) and are never edited once applied ([releases](docs/development/releases.md#migration-rules)).
- **Server-only code** (`src/db/`, `src/auth/`, `src/mcp/`) imports `server-only`. A Better Auth endpoint Money doesn't use goes on `DISABLED_PATHS`.
- **No user-facing text in components**, and every string in both `src/messages/fa.ts` and `src/messages/en.ts`. Every layout works right to left and left to right (logical CSS properties only). Tokens only, no hard-coded values.
- **Library versions:** Next.js and Better Auth here may be newer than your training data. Check `node_modules/next/dist/docs/` (see `AGENTS.md`) and the current Better Auth docs (its MCP plugin is being replaced by the OAuth Provider plugin) before using an API.

## Conventions

@docs/development/conventions.md

## Workflow

- **Branches:** before creating any branch, check out `main` and `git pull`. Names follow Conventional Branch (`feature/…`, `bugfix/…`, `hotfix/…`, `release/…`, `chore/…`).
- **Approval before committing:** never commit without asking first. Show the changed files and the proposed commit message, then wait for an explicit OK. An earlier approval doesn't cover later commits. The same goes for pushing, opening PRs and anything else that publishes.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …). A change self-hosters must act on gets a `BREAKING CHANGE:` footer that says what to do.
- **Checks before a PR:** `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`. Check UI changes in the browser (both languages, both themes, phone and desktop) and in Storybook.
- **Keep the docs up to date.** Every change updates the docs it affects, in the same PR: the feature doc, `docs/development/architecture.md` (data, routes, folders), `docs/development/decisions.md` (a key decision), `docs/development/conventions.md`, `CONTRIBUTING.md`, the self-hosting and release docs, the user guide in both languages (`docs/user-guide.md`, `docs/user-guide.fa.md`) with its screenshots (`pnpm docs:screenshots`, while Storybook runs), `README.md`, and this file when a rule for agents changes. The full table is in [CONTRIBUTING.md](CONTRIBUTING.md#keep-the-docs-up-to-date). When a decision changes, update the doc that records it. Docs are in English, quoting the interface in Persian where it helps.
- **PRs** fill in `.github/pull_request_template.md`. Screens are designed in Claude Design first; there are no hand-written design specs.
- **Releases:** merge release-please's release PR when the changes since the last release should reach self-hosted copies.

## Claude Code setup

The repo carries the Claude Code tools used to build Money, so cloud sessions (Claude Code on the web and in the iOS app, which clone the repo) have the same ones as the desktop. They are vendored copies, not code of the app: ESLint and Prettier ignore them.

- **Skills** in `.claude/skills/`, copied from the user-level installs: Emil Kowalski's (`emilkowalski/skill`: animate, animation-performance, apple-design, break-ui, emil-design-eng, find-animation-opportunities, mobile-native, prototype), Taste Skill (`Leonxlnx/taste-skill`: design-taste-frontend, brandkit, gpt-taste, high-end-visual-design, imagegen-frontend-web, industrial-brutalist-ui, minimalist-ui, redesign-existing-projects), `find-skills` (`vercel-labs/skills`) and `impeccable` (impeccable.style, without its macOS engine binary: the launcher downloads the one for the platform from GitHub releases on first run). Its agents are in `.claude/agents/`. To update one, copy the newer version over it.
- **Plugins** in `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins`): `vercel` (claude-plugins-official), `ui-ux-pro-max`, and Anthropic's `engineering` and `design` (knowledge-work-plugins: the same plugins as the claude.ai Anthropic Directory, so a desktop that has them on the account shows their skills twice), installed from GitHub when a session starts.
- **Hooks:** impeccable's design checks (SessionStart, PostToolUse on Edit and Write, Stop) run the project copy only when there is no user-level impeccable, so a desktop that has its own doesn't run them twice.
- **MCP servers** in `.mcp.json`: `chrome-devtools` (approved in `enabledMcpjsonServers`). claude.ai connectors (Money, Vercel, Figma, …) come with the account, not the repo.

## Reference repositories (siblings of this folder)

- `../daily-transactions`: MCP with `mcp-handler`, Neon access, Jalali helpers (`src/lib/jalali.ts`), the Dana font file, the MCP tool set and instructions.
- `../money-old` (GitHub `money-old`, formerly `money`): personal accounting features, Dana font notes, RTL and Persian number formatting rules.
- `../orange`: the implementation process, folder layout, Storybook setup, theme script and PostCSS media setup.
- `../kanvas`: Kanvas tokens (`src/styles/tokens.css`), the source of the royal blue ramp.
