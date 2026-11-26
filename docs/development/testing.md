# Testing

Money's automated tests are unit and component tests with [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com) in jsdom and [MSW](https://mswjs.io) for network calls, which never reach a database, and integration tests of the SQL in `src/db` against a throwaway Neon database ([database tests](#database-tests)). CI runs both on every pull request with the other checks.

## Running them

| Script               | What it does                                                  |
| -------------------- | ------------------------------------------------------------- |
| `pnpm test`          | Run every test once                                           |
| `pnpm test:watch`    | Run the tests of changed files while you work                 |
| `pnpm test:coverage` | Run every test with a coverage report (`coverage/index.html`) |
| `pnpm test:db`       | Run the database tests against `TEST_DATABASE_URL`            |

One file or one name: `pnpm test src/helpers/budget.test.ts`, `pnpm test -t "getBudgetStatus"`.

## Layers

`vitest.config.mts` has two projects, chosen by the file name, and the database tests have a config of their own, `vitest.db.config.mts`, so `pnpm test` never loads them:

| Project | Files          | Environment | For                                                                                              |
| ------- | -------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `node`  | `*.test.ts`    | Node        | Helpers, utils, constants, i18n, auth and role checks, MCP tools, Server Actions, Route Handlers |
| `dom`   | `*.test.tsx`   | jsdom       | Components, with Testing Library, `@testing-library/user-event` and jest-dom matchers            |
| `db`    | `*.db.test.ts` | Node        | The SQL in `src/db`, against a real Postgres (`pnpm test:db`)                                    |

- **Where tests go:** next to the file they test, `budget.ts` → `budget.test.ts`, `actions.ts` → `actions.test.ts`, `route.ts` → `route.test.ts`, and a query module's database test `src/db/budgets.ts` → `src/db/budgets.db.test.ts`. A component's test is `spec.test.tsx` in its folder ([conventions](conventions.md)). A config file at the root has its test beside it (`next.config.test.ts`, in the `node` project).
- **What to test:** behavior someone relies on, where a mistake wouldn't show on screen. In order:
  1. **Always:** the rules in `src/helpers` and `src/utils` (money, calendars, months, budgets, reports, CSV values, import planning), what a role may do (every write action and connector tool refuses a viewer), what the connector accepts and returns, every security fix, and a query that adds up money or decides access (a [database test](#database-tests)).
  2. **For flows with real logic:** a component test for what a user can do in a complex screen, such as the transaction dialog, the CSV import or user management.
  3. **Not needed:** a test for every small component or for how a screen looks; Storybook and the browser check those.
- **What not to write:** snapshot dumps, tests that only check that a mock was set up, tests that copy the code's logic to work out what to expect (write the expected value), and checks that can't fail (finding an element by its name, then asserting it has one). Never add a test only to raise the coverage figure.

## Coverage

`pnpm test:coverage` reports lines, branches, functions and statements (`coverage/index.html`), to see what the tests leave out. CI runs it with a loose floor (the thresholds in `vitest.config.mts`, about five points under the figures measured when #71 was finished): it fails when a large part of the tests is deleted or skipped, not when new code comes without a test. The number is a report, not a target: decide what to test by the list above, never to move the figure. Don't raise the floor with every pull request; lower it only when code that needs no test grows the app enough to reach it, and say so in the pull request.

## No database in tests

Local development runs on a `dev` Neon branch ([local development](local-development.md)), which is still a real database with a copy of the book, so unit and component tests never touch one; only the [database tests](#database-tests) do, on a database of their own. `src/test/setup.ts`, which runs before every test file:

- deletes `DATABASE_URL*` and `BETTER_AUTH_SECRET` from the environment, and the config sets `envDir: false`, so `.env.local` is never read;
- replaces `@/db` with a client whose every call throws (`src/test/db.ts`). The call is recorded too, so the test fails after it ends even when the code under test caught the error;
- makes the Neon driver refuse to connect, as a second barrier.

So a test of code that queries mocks the query module it calls, with only the functions it needs:

```ts
vi.mock("@/db/users", () => ({ getUserStatus: vi.fn() }));

vi.mocked(getUserStatus).mockResolvedValue({ role: "viewer", disabled: false });
```

Mocks are reset after every test (`mockReset`, `restoreMocks`), as are stubbed variables and globals.

`server-only` is aliased to an empty module, so tests import server code directly.

## Network calls

The MSW server (`src/test/msw.ts`) starts with no handlers, and a request without one fails (`onUnhandledFrame: "error"`). A test adds the handlers it needs; they are reset after it:

```ts
server.use(
  http.post("*/api/auth/sign-in/username", () =>
    HttpResponse.json({ code: "BANNED_USER" }, { status: 403 }),
  ),
);
```

Code that catches a failed request (most of Money's client calls return a failure instead of throwing) won't fail the test by itself, so assert on what the user sees, or count the requests.

## Server code

Server Actions, Route Handlers and the session checks run for real, against stand-ins for what they call on the server: `src/test/server.ts` replaces `@/auth` (the session lookup and the Better Auth calls the actions make), `next/headers`, `next/navigation`, `next/cache`, `next-intl/server` and `@/i18n/preferences`. A test file mocks the modules its code imports with it, then signs in:

```ts
vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));

beforeEach(() => resetServer());

it("refuses viewers", async () => {
  signInAs("viewer");
  expect(await outcome(() => createTransaction(input))).toBe("notFound");
  expect(insertTransaction).not.toHaveBeenCalled();
});
```

- `signInAs(role, user?)` and `signOut()`; `TEST_USER_ID` is the signed-in user, to check that an action records the session's user and not one from its input.
- `outcome(call)` is `"allowed"`, `"notFound"` (`requireWrite` and `requireAdmin` refusing) or `"redirect /login…"` (no session); `redirect` and `notFound` throw `NavigationError`, as Next's do.
- `setLocale`, `setCurrency`, `setRequestHeaders` and `setRequestCookies` shape the request; `getTranslations` returns the real messages, so expected errors come from `t` (`src/test/messages.ts`).
- `refresh` and the `auth.api` calls are `vi.fn()`s to assert on or make fail (`mockRejectedValue(new APIError(…))`).

Every write action has a test that a viewer is refused before anything is written, and the security fixes of #72 each have a regression test: the closed Better Auth endpoints (`src/auth/index.test.ts`, through the real handler), the admin role's permissions, the security headers (`next.config.test.ts`), the connector's allowed apps (`src/helpers/connector.test.ts`, `src/mcp/auth.test.ts`), `getSafeRedirect`, and password changes and resets disconnecting apps.

## Components

`renderWithApp` (`src/test/render.tsx`) renders inside the app's `Providers`: Persian, Jalali, rials and Tehran time unless the test passes `locale`, `calendar`, `currency` or `rialUnit`. Find elements as a user would, by role and accessible name, with the copy as the app shows it: `t` (`src/test/messages.ts`) is the Persian translator, so messages with values work too:

```ts
renderWithApp(<BudgetDialog open category={food} … />);
await user.type(screen.getByRole("textbox", { name: t("budgets.form.amount") }), "۱۵۰۰۰۰۰۰");
expect(screen.getByRole("dialog", { name: t("budgets.form.editTitle", { name: "خوراک" }) }));
```

Pass the sample data the stories use (`sample-*.ts` next to the components), so tests and stories show the same book.

Helpers in `src/test/`:

- `findToast(title)` (`queries.ts`): the toast with that title. Toasts sit outside an open dialog and are hidden from the accessibility tree, and their live region repeats the text, so `findByText` doesn't work for them.
- `startsWith(text)` (`queries.ts`): an accessible name that starts with the text. Optional fields add «(اختیاری)» to their label, and a checkbox's name includes its description.
- `setViewport("mobile")` (`browser.ts`): phone width for `matchMedia`, so `useMediaQuery` picks the Sheet instead of the Dialog. Every test starts on desktop. `browser.ts` also stubs the other browser APIs jsdom lacks (`ResizeObserver`, `scrollIntoView`), and reduced motion matches, so nothing waits for animations.
- Code that reads today (`todayIso`) gets a fixed date with `vi.useFakeTimers({ toFake: ["Date"] })` and `vi.setSystemTime(…)`; fake only `Date`, so user-event's timers keep running.

Next.js hooks that need the App Router, such as `useRouter`, are mocked in the test (`vi.mock("next/navigation", …)`).

When a query can't find something, the error lists every role and accessible name on the page; reading it is the quickest way to see what a screen reader gets.

## Database tests

The unit tests mock the query modules, so a wrong query, such as one that counts a transfer as an expense, would pass them. The database tests run the real SQL of `src/db` against Postgres: balances (`accountBalance`), the totals of the transactions list, reports and budgets over a viewer's month (`monthRange`, both ends included), the dashboard's first-run check, the attempt limit's window (`takeAttempt`, attempts at the same moment included), keeping the last admin (`setUserRole`, `disableUser`, two admins acting on each other at once included), the book currency lock and the import's single batch. They use the app's driver (Neon's HTTP driver through Drizzle), so `db.batch` and the results' types are the ones production gets.

### The database

They need a Neon database made for them, because every run wipes it: `pnpm test:db` refuses a `TEST_DATABASE_URL` whose database name doesn't end in `_test`, and checks the name again on the connection before it changes anything. The book's own database is `neondb` on every branch, so a connection string copied from the wrong place is refused instead of wiped. Set it up once:

1. In Neon (Vercel → **Storage**, the database, **Open in Neon**), open **Branches** and create a branch named `test` from `main` with **Schema only**, so it holds none of the book's data (auto-delete **Never**). It counts towards the free plan's 10 branches.
2. Switch the branch menu at the top left to `test`, open **Roles** and reset the role's password, as for the `dev` branch ([local development](local-development.md)): a child branch starts with its parent's passwords, and this connection string will live in `.env.test.local` and in GitHub. Check that the menu says `test` first.
3. Still on `test`, open **Databases** and create a database named `money_test`, owned by that role.
4. Choose **Connect**, pick the `test` branch and the `money_test` database, and copy the connection string. Put it in `.env.test.local` (ignored by git, like every `.env*` file):

   ```bash
   TEST_DATABASE_URL="postgresql://…/money_test?sslmode=require"
   ```

5. For CI, add the same string as the repository secret `TEST_DATABASE_URL` (GitHub, **Settings → Secrets and variables → Actions**). Dependabot's pull requests read only Dependabot secrets, so add it under **Dependabot** too for its upgrades of Drizzle or the Neon driver to be tested.

`pnpm test:db` reads `TEST_DATABASE_URL` from the shell or `.env.test.local`, never from `.env.local`. Without it, it says so and passes without running anything, so a local run, a pull request from a fork and a self-hosted copy's CI still pass. In this repository's CI a missing secret fails the job instead ([CI](#ci)).

### A run

1. **Once per run** (`src/test/integration/global-setup.ts`): drops the `public` and `drizzle` schemas and applies every migration in `drizzle/` from the start, with Drizzle's migrator for the HTTP driver. So each run starts from the schema a new self-hosted copy gets, and a migration that no longer applies from zero fails the run.
2. **Before each test** (`src/test/integration/setup.ts`): `@/db` connects to the test database (`DATABASE_URL` is set from `TEST_DATABASE_URL`), and every table is emptied.
3. **Files run one at a time** (`fileParallelism: false`): they share the database. Each query is a request to Neon, so a run takes about as long as the requests (about two minutes); the first one may wait a few seconds for the branch's compute to wake. A failed test is retried once (`retry: 1`), since a request can time out on the network, and the retry starts from emptied tables again. The tests of writes at the same moment (two admins acting on each other, attempts arriving together) set `{ retry: 0 }`: a race that fails only sometimes must fail the run, not pass on its second try.

### Writing one

A test seeds only what it is about, with the helpers in `src/test/integration/seed.ts` (`seedUser`, `seedAccount`, `seedCategory`, `seedTransaction`, `seedBudget`, `seedSession`, `seedConnection`), calls the query and checks what it returns, with literal expected values:

```ts
it("move a transfer from one account to the other without changing their total", async () => {
  const bank = await seedAccount({ name: "ملت", openingBalance: 1_000_000 });
  const cash = await seedAccount({ name: "نقد", type: "cash" });
  await seedTransaction({
    type: "transfer",
    amount: 300_000,
    date: "2026-10-01",
    accountId: bank,
    toAccountId: cash,
    createdBy: userId,
  });

  expect(await balances()).toEqual({ ملت: 700_000, نقد: 300_000 });
});
```

`seedNeverIncomeOrExpense(date, userId)` adds one of each movement that is never income or expense (a transfer, a loan to a counterparty and its repayment, a receivable, a payable) with large amounts, so a total that counts any of them is far off. Add it to the data of every test of a total.

## CI

`.github/workflows/ci.yml` has two jobs, on every pull request and every push to `main`, with `contents: read` only:

- **check** runs `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm test:coverage` (with the loose floor in [Coverage](#coverage)), with no secrets.
- **database** runs `pnpm test:db` with the `TEST_DATABASE_URL` secret, one run at a time across the repository (every run wipes the same database) and never cancelled halfway. In `mrghasemi1992/money` the secret is required: if the Actions copy, or the Dependabot copy on Dependabot's pull requests, is missing, a step before the tests fails the job with an error that names it, instead of passing without running anything. Pull requests from forks, which can never read secrets, and self-hosted copies, whose CI runs without it, skip the tests and pass.

Its actions are pinned to a commit SHA, which Dependabot updates monthly. The build is checked by the Vercel preview of the pull request.

## Not covered yet

- **The other queries** of `src/db`: the transactions list (keyset pagination, search, filters), categories and their trees, accounts' writes, the connector's queries, the remaining report insights (`recurringExpenses`, `largestTransactions`) and `findImportDuplicates` have no database test yet; they are only mocked in the unit tests.
- **Pages** (`page.tsx`, `layout.tsx`): async Server Components aren't rendered in tests; what they hand to components is tested through the components and the queries' callers.
- **The MCP route** (`src/app/mcp/route.ts`, `src/mcp/handler.ts`) end to end: the token check and the tools are tested apart.
- **End-to-end tests** in a browser: none yet; screens are checked by hand in the browser and Storybook.
