# Testing

Money's automated tests are unit and component tests with [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com) in jsdom and [MSW](https://mswjs.io) for network calls. They never reach a database. CI runs them on every pull request with the other checks.

## Running them

| Script               | What it does                                                  |
| -------------------- | ------------------------------------------------------------- |
| `pnpm test`          | Run every test once                                           |
| `pnpm test:watch`    | Run the tests of changed files while you work                 |
| `pnpm test:coverage` | Run every test with a coverage report (`coverage/index.html`) |

One file or one name: `pnpm test src/helpers/budget.test.ts`, `pnpm test -t "getBudgetStatus"`.

## Layers

`vitest.config.mts` has two projects, chosen by the file name:

| Project | Files        | Environment | For                                                                                              |
| ------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------ |
| `node`  | `*.test.ts`  | Node        | Helpers, utils, constants, i18n, auth and role checks, MCP tools, Server Actions, Route Handlers |
| `dom`   | `*.test.tsx` | jsdom       | Components, with Testing Library, `@testing-library/user-event` and jest-dom matchers            |

- **Where tests go:** next to the file they test, `budget.ts` → `budget.test.ts`, `actions.ts` → `actions.test.ts`, `route.ts` → `route.test.ts`. A component's test is `spec.test.tsx` in its folder ([conventions](conventions.md)). A config file at the root has its test beside it (`next.config.test.ts`, in the `node` project).
- **What to test:** behavior someone relies on: the rules in `src/helpers`, what a role may do, what the connector accepts and returns, what a user sees and can do in a component. No snapshot dumps, and no tests that only check that a mock was set up.

## Coverage

`pnpm test:coverage` reports lines, branches, functions and statements (`coverage/index.html`) and holds a floor: it fails when a metric falls below the threshold set in `vitest.config.mts`. The thresholds started at the baseline measured when the tests of #71 were finished (recorded in the issue), and CI runs the coverage report, so a pull request fails when it takes a metric below them. When a pull request adds code or tests, raise the thresholds with it, so the numbers only go up; never lower them to make a run pass. The thresholds sit just under the measured figures, so new code without tests can fail the run: add the tests.

## No database in tests

Local development runs on a `dev` Neon branch ([local development](local-development.md)), which is still a real database with a copy of the book, so unit tests never touch one. `src/test/setup.ts`, which runs before every test file:

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

## CI

`.github/workflows/ci.yml` runs `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm test:coverage` on every pull request and every push to `main`, with `contents: read` only and no secrets. Its actions are pinned to a commit SHA, which Dependabot updates monthly. The build is checked by the Vercel preview of the pull request.

## Not covered yet

- **Database queries** (`src/db/*.ts`): they are only mocked. That includes the rules the database enforces in one statement: the attempt limit's window (`takeAttempt`), keeping the last admin (`setUserRole`, `disableUser`), balances (`accountBalance`), the book currency lock and the import's single batch. Integration tests against a Neon branch, behind a `TEST_DATABASE_URL` and skipped when it isn't set, are a later step.
- **Pages** (`page.tsx`, `layout.tsx`): async Server Components aren't rendered in tests; what they hand to components is tested through the components and the queries' callers.
- **The MCP route** (`src/app/mcp/route.ts`, `src/mcp/handler.ts`) end to end: the token check and the tools are tested apart.
- **End-to-end tests** in a browser: none yet; screens are checked by hand in the browser and Storybook.
