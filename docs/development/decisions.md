# Key decisions

The decisions that shape Money, each with why it was made, what it costs, and where it shows in the code. Read this before proposing to change one of them; if you do change one, update its entry in the same pull request (and add a new entry for a new decision of the same weight).

Each entry: **Decision**, **Why**, **Trade-off**, **Where**. A new entry also records:

- **Status:** Accepted, or Superseded by entry N (keep the old entry and point to the new one).
- **Date:** when it was decided, with the issue or PR that decided it.
- **Alternatives considered:** the options that lost, and why.

## 1. One Next.js project, no separate backend

- **Decision:** pages, Server Actions, sign-in, the OAuth server and the MCP endpoint all live in one Next.js App Router project on Vercel.
- **Why:** the MCP endpoint, OAuth and database access need a server anyway; one project means one deployment, one set of types and no API layer to keep in sync. Chosen over Vite plus a separate API.
- **Trade-off:** tied to Next.js and its fast-moving conventions (see `AGENTS.md`); server and client code share a repository, so the `server-only` rule matters.
- **Where:** `src/app/`, Server Actions in `actions.ts` files, `src/app/mcp/route.ts`.

## 2. One shared book, access by role

- **Decision:** accounts, categories, transactions and budgets belong to the book, not to a user; there is no `user_id` on financial data. Roles (admin, editor, viewer) decide who may read and write, read from the user record on every request.
- **Why:** a family keeps one set of books. Reading the role fresh means a change (or a ban) applies at once, also to connected Claude sessions.
- **Trade-off:** no private accounts within a book; a person who needs separate finances runs a separate copy.
- **Where:** `src/auth/session.ts`, `src/helpers/role.ts`, [users and auth](features/users-and-auth.md).

## 3. Postgres on Neon over HTTP, guarded single statements

- **Decision:** Drizzle over Neon's serverless HTTP driver: one stateless request per query, no interactive transactions. Writes that must succeed together use `db.batch([...])`; checks that must hold at write time are inside the SQL statement (for example "delete only when unused", "never demote the last admin").
- **Why:** serverless functions open no connection pools; Neon's free plan, branching for previews and local development, and Vercel's integration make self-hosting free and simple.
- **Trade-off:** no `BEGIN … COMMIT` around application logic, so race-safe rules must be written as single SQL statements. The database also enforces the core rules with constraints, so a bug can't store bad data.
- **Where:** `src/db/index.ts`, `src/db/*.ts`, constraints in `src/db/schema/`.

## 4. Better Auth, self-hosted and invite only

- **Decision:** Better Auth (a library, data in Neon) with username sign-in, the admin plugin and the OAuth provider plugins. No public sign-up. Its HTTP endpoints that Money doesn't use, including every admin endpoint, are closed; the app calls them from Server Actions instead.
- **Why:** no paid auth service, the data stays in each copy's database, and the same library is the OAuth server for the connector.
- **Trade-off:** Better Auth's plugins change between versions (its MCP plugin is being replaced by the OAuth Provider plugin), and every new endpoint must be reviewed and closed if unused. Money can't email anyone, so forgotten passwords are reset by an admin.
- **Where:** `src/auth/index.ts` (`DISABLED_PATHS`), [users and auth](features/users-and-auth.md).

## 5. Gregorian dates in the database, calendars only at the edges

- **Decision:** dates are stored and passed around as Gregorian ISO strings. They are converted to the viewer's calendar (Jalali or Gregorian) only in the date components and at the MCP boundary, where both calendars are accepted and the year tells which one (below 1700 is Jalali).
- **Why:** one representation in SQL and code; users with different calendars share the book; language models are unreliable at Jalali arithmetic, so Claude copies a bank SMS date as it is.
- **Trade-off:** periods (months, budgets, reports) depend on the viewer, so two users can see different month boundaries, and every query takes a Gregorian range computed with `monthRange`.
- **Where:** `src/utils/calendar.ts`, `src/helpers/connector.ts`, [languages](features/languages-and-currency.md).

## 6. Integer amounts, one currency per book

- **Decision:** amounts are positive integers in the smallest unit of the book's one currency (rials, cents, pence); the type gives the direction. Toman is only a way to show and type rials. The currency can change only while the book holds no amounts.
- **Why:** no floating-point errors; no exchange rates to maintain; changing the currency later would silently reinterpret every stored number.
- **Trade-off:** no multi-currency accounts.
- **Where:** `src/helpers/money.ts`, `src/constants/currency.ts`, `setBookCurrency` in `src/db/book.ts`.

## 7. Two languages without a locale in the URL

- **Decision:** next-intl without i18n routing. The language comes from the user record when signed in, otherwise a cookie or the browser. Persian is the source language and the default; every layout uses logical CSS properties so it flips with `dir`.
- **Why:** each user picks a language once; URLs stay the same for everyone in the family and in links Claude shares.
- **Trade-off:** pages can't be cached per language by URL (they're all dynamic anyway), and every string must exist in both message files.
- **Where:** `src/i18n/`, `src/messages/`.

## 8. CSS Modules, tokens and Base UI; no component library

- **Decision:** styling with CSS Modules and design tokens (CSS variables), interactive parts from Base UI (unstyled), icons from lucide-react. No Tailwind, no shadcn/ui or MUI.
- **Why:** full control of a calm, RTL-first design; themes switch by re-pointing tokens with no JavaScript; Base UI gives accessible behavior without imposing a look.
- **Trade-off:** every component is styled by hand and documented in Storybook.
- **Where:** `src/styles/tokens/`, `src/components/ui/`, [design system](features/design-system.md).

## 9. Hand-written charts, no chart library

- **Decision:** charts are React components in HTML and CSS (SVG only for one line), rendered on the server.
- **Why:** the charts are ranked bars, columns around a zero line and grids of months; CSS grid and logical properties flip them with `dir`, tokens theme them, and all text uses Money's formatting. Reviewed again for the report insights (#60).
- **Trade-off:** anything needing real scales, continuous time axes or zooming will need a library. When that chart comes, add `d3-scale` (about 9 KB) for the math and keep the markup ours; visx was rejected for its RTL and server-rendering costs.
- **Where:** `src/components/ui/bar-list/`, `column-chart/`, [reports](features/reports.md).

## 10. Money is its own OAuth server for the connector

- **Decision:** Claude and ChatGPT connect to `/mcp` with OAuth 2.1 issued by Money itself (Better Auth's `jwt`, `mcp` and `cimd` plugins). Clients identify with a Client ID Metadata Document; only documents on `claude.ai` and `chatgpt.com` are accepted. Every request re-checks the grant and the user in the database.
- **Why:** nothing to register and no secrets to share; each user connects with their own account and role; a look-alike app can't pose as Claude on the consent page; revoking, disabling or a password change applies on the next request although access tokens are self-contained JWTs.
- **Trade-off:** other MCP clients can't connect; a database read per MCP request.
- **Where:** `src/mcp/`, `src/auth/index.ts`, [connector](features/connector.md).

## 11. Each family self-hosts a fork

- **Decision:** there is no shared hosted service. Each copy is a fork on its owner's GitHub, deployed on their own Vercel project with a Neon database. Setup starts with the fork, not Vercel's Deploy button, which can't deploy a fork (#42). Updates are **Sync fork**; releases are cut by release-please.
- **Why:** each family's financial data stays in their own accounts; free plans cover it; updating needs no terminal.
- **Trade-off:** `main` must always be releasable and every migration must work with the previous version; there is no way to push a fix to copies, owners have to sync.
- **Where:** [self-hosting](../self-hosting.md), [releases](releases.md).

## 12. Build first, then migrate; migrations stay backward compatible

- **Decision:** `vercel-build` is `next build && drizzle-kit migrate`; Vercel switches the domain only if both succeed. Migrations expand first and contract a release later.
- **Why:** a failed build changes nothing, a failed migration rolls back, and the previous version keeps running in both cases, also after an Instant Rollback.
- **Trade-off:** renames and drops take two releases.
- **Where:** `package.json`, `drizzle/`, [releases](releases.md#migration-rules).

## 13. Docs in the repository, updated with every change

- **Decision:** all documentation is Markdown in the repository; the GitHub wiki isn’t used. Every pull request updates the docs its change affects.
- **Why:** the code was written with Claude Code, so the docs are where the knowledge lives. In the repository they are reviewed with the code, versioned with it, copied into every fork and readable by agents in cloud sessions.
- **Trade-off:** keeping them current is part of every change; a PR whose code and docs disagree isn't finished.
- **Where:** [CONTRIBUTING.md](../../CONTRIBUTING.md#keep-the-docs-up-to-date), `CLAUDE.md`.

## 14. No automated tests yet

- **Decision:** tests are planned but not in place; the checks are lint, type check, format check, build and manual checks in the browser and Storybook.
- **Why:** the features came first.
- **Trade-off:** regressions are caught by hand. Write code that is easy to test (small pure functions, data logic apart from the UI), so tests can be added without rewriting it.
- **Where:** [CONTRIBUTING.md](../../CONTRIBUTING.md#workflow).
