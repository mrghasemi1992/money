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
- **Status:** Superseded by entry 18 (#70).
- **Why:** the features came first.
- **Trade-off:** regressions are caught by hand. Write code that is easy to test (small pure functions, data logic apart from the UI), so tests can be added without rewriting it.
- **Where:** [CONTRIBUTING.md](../../CONTRIBUTING.md#workflow).

## 15. One free-text field on a transaction

- **Decision:** a transaction has one free-text field, the description (optional, at most 300 characters). The separate note is gone from the form, the detail, search, the CSV export and the MCP results. Migration `0010` moved each note to the end of its description (`description — note`, leaving out text already in the other) and cleared it; the `note` column stays until a later release drops it.
- **Status:** Accepted.
- **Date:** 2026-11, #133.
- **Why:** the note came with the first migration, when the description also marked unknown transactions («؟»), so free text needed a field of its own. Since unknown transactions have their own tag and rows show the category first (#30), the two fields did the same job and people had to choose between them.
- **Trade-off:** no place for long text apart from the label; a long description is cut off in lists and shown in full only in the detail. The limit went from 100 to 300 so a merged note fits. MCP clients that still send `note` keep working until the parameter is removed: it is added to the description (`withNote`).
- **Alternatives considered:** keeping the note only in the detail for longer text (still two fields to choose between); merging the note into the description without clearing it (the previous version would have shown the text twice).
- **Where:** `src/helpers/transaction.ts` (`withNote`), `drizzle/0010_merge_notes.sql`, `src/mcp/tools.ts` (`noteInput`), `src/helpers/csv-import.ts`, [transactions](features/transactions.md).

## 16. A transaction's time is local and optional

- **Decision:** a transaction has an optional time of day, a Postgres `time` without a time zone (`HH:MM` through the app), stored as the local time the bank printed, like the date. Within a day, the list orders by it, newest first, and rows without a time come last; then by `created_at` and id as before. The web form, the connector (`time` in `add_transactions` and `update_transaction`) and the CSV import and export carry it.
- **Status:** Accepted.
- **Date:** 2026-11, #128.
- **Why:** bank SMS and statements print a local date and time, and the date is already stored as written, so the time joins it the same way: copied, never converted, and the same for everyone in the family. Ordering by `created_at` alone put a day's rows in the order they were entered, and rows of one `add_transactions` call or one import in an arbitrary or file order, not the bank's.
- **Trade-off:** a time means nothing outside its date's place: a family member in another time zone sees the bank's time, not their own (as with the date). The time isn't checked against the clock, only the date against today. Keyset pagination can't compare nulls, so the order and its index use `time is not null` and `coalesce(time, '00:00')` instead of the column.
- **Alternatives considered:** a `timestamptz` replacing the date (every query, the calendar rules and the MCP boundary would change, and a missing time would need a made-up one); storing the time in UTC (needs the user's time zone at write time, and the same SMS would read differently for two users); ordering nulls first (rows entered without a time would sit above the day's timed rows, out of the bank's order).
- **Where:** `src/db/schema/transactions.ts`, `drizzle/0011_transaction_time.sql`, `LIST_ORDER` in `src/db/transactions.ts`, `src/utils/time-of-day.ts`, [transactions](features/transactions.md).

## 17. Loans and debts are transfers and dated debts on counterparty accounts

- **Decision:** a person or lender money is owed to or by is an account of type `counterparty` (#47). Lending, borrowing and repaying are transfers between it and one of the book's own accounts. A debt that no money of the book moved for, such as one from years before the book, is a dated transaction of type `receivable` (they owe the book) or `payable` (the book owes them) on the counterparty, with no category or destination account; the database makes its account a counterparty (`transactions_debt_account_fk`). A counterparty's balance (from `accountBalance()`) is what they owe the book when positive, or what the book owes them when negative; its opening balance is always 0. Counterparties have their own page («طلب و بدهی», `/debts`) and stay out of the accounts page, the dashboard's balances and `list_accounts`' total.
- **Status:** Accepted.
- **Date:** 2026-11, #47.
- **Why:** money lent or borrowed is neither spent nor earned: accounting treats it as a receivable or a liability, and every app looked at keeps it out of income and expense (GnuCash: an asset account per person; YNAB: tracking or liability accounts outside the budget; Firefly III: a liability account per person, "I owe" or "I am owed"; Money Lover: a separate Debt/Loan kind). Recording it with «قرض و بدهی» categories inflated monthly expenses, budgets and reports. Modeling the other side as an account reuses what transfers already do (left out of totals, balances in SQL, the account filter, the connector's transfers, CSV), and the mixed cases come out right without new rules: someone paying for the book is an expense from their account, a forgiven debt an expense from it, a loan installment a transfer plus an interest expense. For debts with no money movement, double-entry books record an opening balance transaction against an equity account (GnuCash's Equity: Opening Balances, Firefly III's opening balance and reconciliation transactions); `receivable` and `payable` are that entry written one-sided on the counterparty, so each old debt has its own date, description and place in the person's ledger, and several of them with one person stay apart.
- **Interface:** the transaction form has four tabs, and «انتقال» is only between the book's own accounts. Everything with a person is in «طلب/بدهی»: «طلب دارم» / «بدهکارم», the person, the account the money moved through, and a «بدون حساب» checkbox for a debt from before; `debtEntry` saves a transfer or a receivable or payable from that. This follows the apps with a dedicated debt feature: two directions and an optional account or a "create a record?" choice (Money Wallet's "Debt you owe" / "Debt owed to you" and its master-record prompt, Pocket Clear's Lend / Borrow with an optional payment method). A first version with four actions (lent, borrowed, paid back to me, paid back, as Money Lover lists them) was dropped: lending and paying back store the same entry, so the extra choices only added steps.
- **Trade-off:** people sit in the accounts table, so every place that means "the book's money" must leave them out (`isCounterparty`), and every place that sums money must count only income and expense (`INCOME_EXPENSE_TYPES`), not "everything but transfers". The previous version doesn't know the new types: after a rollback, a counterparty or a debt added in between would reach screens that can't show it. A loan's interest and principal take two transactions; nothing calculates interest or schedules installments yet. Transactions already in «قرض و بدهی» are moved by hand, because the data doesn't say who.
- **Alternatives considered:** new transaction types `lent`, `borrowed`, `repaid` with a `person_id` (the issue's first idea: "repaid" needs a direction, so four types in every rule, form, filter and tool, and a debt with no bank movement, or an expense someone paid for the book, can't be recorded without an account); a `person_id` plus a flag on income and expense (keeps loans inside income and expense and needs every total to exclude them); a separate `people` table with its own ledger (a second set of balances to keep consistent with transfers); an opening balance with a date on the counterparty (one amount and one date per person, and not in their ledger; tried first in this PR); a hidden system "opening balances" account that old debts are transferred from (true double entry, but a fake account every list, picker, filter, export and tool would have to hide); transactions without an account (would break the rule that every amount belongs to an account, which balances rely on).
- **Where:** `src/constants/account.ts`, `src/constants/transaction.ts`, `src/helpers/account.ts`, `src/helpers/transaction.ts`, `src/helpers/account-balance.ts`, `drizzle/0012_counterparties.sql`, `src/app/(app)/debts/`, [loans and debts](features/loans-and-debts.md).

## 18. Unit and component tests that never reach a database, and database tests of their own

- **Decision:** Vitest runs unit tests in Node and component tests in jsdom (Testing Library, MSW for network calls). `@/db` is replaced by a client that fails the test on any call, so tests mock the query modules instead. The SQL in `src/db` has integration tests apart (`*.db.test.ts`, `pnpm test:db`, their own config) against a throwaway Neon database whose name must end in `_test`, on a schema-only `test` branch, wiped and migrated from zero on every run, with the app's HTTP driver. CI runs lint, type check, format check and the unit tests on every pull request, and the database tests in a second job with a `TEST_DATABASE_URL` secret, which fails without it in this repository and skips only for pull requests from forks and in self-hosted copies; the Vercel preview is the build check.
- **Status:** Accepted. Supersedes entry 14.
- **Date:** 2026-11, #70; database tests 2026-11, #71.
- **Why:** the rules live in small pure functions (`src/helpers`, `src/utils`) and the role checks in a few places, so they are cheap to test. Local development's database is a real copy of the book (`dev` branch), so a test that writes to it would change data someone looks at; tests that need no database also need no secrets in CI. But the rules that matter most for the numbers are SQL (balances, totals that leave out transfers and debts, the attempt limit, the last admin, the currency lock, the import's batch), and with the queries mocked a wrong one passed every test. A database of their own, on a branch with no data and its own password, keeps the real book and its copy out of reach, and the name check refuses a connection string to anything else.
- **Alternatives considered:** Jest (needs its own TypeScript and ESM transforms; Vitest reads the same Vite setup as Storybook), happy-dom (faster, but jsdom is closer to a browser for Base UI's focus and dialog behavior), and database tests against the `dev` branch (it holds a copy of real data, and its credentials in CI would expose it). For the database tests: Postgres in Docker with a proxy that speaks Neon's HTTP protocol (no secret, runs on every pull request including Dependabot's, but needs Docker locally and tests an imitation of Neon through a third-party image), PGlite in the test process (no network at all, but a different driver: no `db.batch`, so the import's all-or-nothing couldn't be tested, and one connection, so neither could two admins acting at once), and a new Neon branch per run through Neon's API (fully isolated runs, but an API key in CI with the power to delete branches, and a branch slot per concurrent run on the free plan).
- **Trade-off:** the database tests need a network, a Neon branch and a secret, and they run one at a time across the repository because every run wipes the same database; pull requests from forks and self-hosted copies skip them, and a missing secret in this repository fails the job rather than passing it unseen. Only the queries with rules that decide numbers or access are covered so far ([testing](testing.md#not-covered-yet)). Screens are still checked by hand in the browser and Storybook.
- **Where:** [testing](testing.md), `vitest.config.mts`, `vitest.db.config.mts`, `src/test/`, `src/test/integration/`, `src/db/*.db.test.ts`, `.github/workflows/ci.yml`.
