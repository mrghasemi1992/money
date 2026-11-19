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

- **Where tests go:** next to the file they test, `budget.ts` → `budget.test.ts`. A component's test is `spec.test.tsx` in its folder ([conventions](conventions.md)).
- **What to test:** behavior someone relies on: the rules in `src/helpers`, what a role may do, what the connector accepts and returns, what a user sees and can do in a component. No snapshot dumps, and no tests that only check that a mock was set up.

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

`.github/workflows/ci.yml` runs `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm test` on every pull request and every push to `main`, with `contents: read` only and no secrets. Its actions are pinned to a commit SHA, which Dependabot updates monthly. The build is checked by the Vercel preview of the pull request.

## Not covered yet

- **Database queries** (`src/db/*.ts`): they are only mocked. Integration tests against a Neon branch, behind a `TEST_DATABASE_URL` and skipped when it isn't set, are a later step.
- **End-to-end tests** in a browser: none yet; screens are checked by hand in the browser and Storybook.
