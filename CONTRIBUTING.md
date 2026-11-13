# Contributing to Money

This guide is for anyone who changes Money's code: the maintainer, an outside contributor or an AI agent. Money was written with Claude Code, so the documentation, not anyone's memory, is where its knowledge lives. Keep it that way: every change updates the docs it affects ([below](#keep-the-docs-up-to-date)).

## Read first

1. [Architecture](docs/development/architecture.md): what the parts are, how a request moves through them, the data rules, the folder map and a glossary.
2. [Decisions](docs/development/decisions.md): the key decisions, why they were made and what they cost.
3. [Conventions](docs/development/conventions.md): the rules for code, copy, styling, components and stories.
4. The doc of the area you change, in [docs/development/features/](docs/development/features/) (all listed in the [docs index](docs/README.md)).

## Set up your machine

You need Node.js 24, pnpm 10 (`corepack enable` picks the version in `package.json`), the [Vercel CLI](https://vercel.com/docs/cli) and a copy of Money on your own Vercel and Neon accounts ([self-hosting](docs/self-hosting.md)): local development uses that copy's database, on a branch of its own.

1. Clone your fork and install:

   ```bash
   pnpm install
   ```

2. Link the folder to your Vercel project and pull the variables of its **Development** environment into `.env.local` (the variables are listed in `.env.example`):

   ```bash
   vercel link
   ```

   ```bash
   vercel env pull .env.local
   ```

   First give Development its own Neon `dev` branch and secret, so local work never touches your real book: [docs/development/local-development.md](docs/development/local-development.md).

3. Start the app and open [http://money.localhost:3000](http://money.localhost:3000):

   ```bash
   pnpm dev
   ```

4. Storybook, with every component and page on sample data, in both languages and themes, runs on [http://money.localhost:6006](http://money.localhost:6006) (and is published at [money-storybook.vercel.app](https://money-storybook.vercel.app)):

   ```bash
   pnpm storybook
   ```

## Scripts

| Script                  | What it does                                                                   |
| ----------------------- | ------------------------------------------------------------------------------ |
| `pnpm dev`              | Start the dev server on `money.localhost:3000`                                 |
| `pnpm build`            | Production build                                                               |
| `pnpm start`            | Serve the production build                                                     |
| `pnpm lint`             | ESLint                                                                         |
| `pnpm typecheck`        | Generate route types (`next typegen`), then type check                         |
| `pnpm format`           | Format every file with Prettier                                                |
| `pnpm format:check`     | Check formatting                                                               |
| `pnpm storybook`        | Start Storybook on `money.localhost:6006`                                      |
| `pnpm build-storybook`  | Build the static Storybook                                                     |
| `pnpm db:generate`      | Generate a SQL migration from the schema in `src/db/schema/`                   |
| `pnpm db:migrate`       | Apply migrations to the database in `.env.local` (your `dev` branch)           |
| `pnpm db:studio`        | Browse the database in Drizzle Studio                                          |
| `pnpm docs:screenshots` | Retake the user guide's screenshots from Storybook (Storybook must be running) |
| `pnpm user:create`      | Create a user from the terminal (asks for the details)                         |
| `vercel-build`          | Vercel only: `next build`, then migrate that deployment's database             |

## Workflow

1. **An issue first.** Work starts from a GitHub issue that says what and why.
2. **A branch from a fresh `main`.** Check out `main` and `git pull` before creating any branch. Names follow [Conventional Branch](https://conventionalbranch.org/): `feature/…`, `bugfix/…`, `hotfix/…`, `release/…`, `chore/…`, lowercase letters, numbers and hyphens.
3. **The change, with its docs.** Code, messages in both languages, stories, and the docs it affects.
4. **The checks**, which must all pass before merging:

   ```bash
   pnpm lint && pnpm typecheck && pnpm format:check && pnpm build
   ```

   Check UI changes in the browser and in Storybook, in Persian and English, light and dark, at phone and desktop widths.

5. **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/): `feat: …`, `fix: …`, `docs: …`, `chore: …`. They decide the next version, so pick the type with care; a change that asks something of self-hosters gets a `BREAKING CHANGE:` footer that says what to do ([releases](docs/development/releases.md)).
6. **A pull request** that fills in the template: what changed, why, and how it was checked. Every PR gets a Vercel preview with its own database branch.
7. **Releases** are cut by release-please: merging its release PR publishes a version, and self-hosted copies get it with **Sync fork** ([releases](docs/development/releases.md)).

Screens are designed in [Claude Design](https://claude.ai/design) before they are built; the design comes from its handoff, so there are no hand-written design specs.

## Adding a feature, end to end

Not every feature needs every step, but go through the list:

- [ ] **Data:** tables and constraints in `src/db/schema/`, then `pnpm db:generate`. Follow the migration rules in [releases](docs/development/releases.md#migration-rules): the previous version must still run on the migrated database.
- [ ] **Queries** in `src/db/<area>.ts` (`server-only`, sums in SQL, `db.batch` for writes that belong together).
- [ ] **Rules** as pure functions and Zod schemas in `src/helpers/`, shared by the form, the action and the MCP tools.
- [ ] **Server Actions** in `actions.ts` next to the page: `requireWrite()` or `requireAdmin()` first, Zod, translated errors, `refresh()`.
- [ ] **The page** in `src/app/(app)/…`: `requireUser()`, its own `loading.tsx` skeleton and `error.tsx`, and an entry in `NAV_ITEMS` if it is a section.
- [ ] **Components**, one folder each with `index.tsx`, `styles.module.css` and `index.stories.tsx`, tokens only, logical CSS properties only.
- [ ] **Copy** in `src/messages/fa.ts` and `src/messages/en.ts`; Persian sample text in stories, with its English in `src/constants/sample-text.ts`.
- [ ] **Roles:** viewers see no write controls, and the server refuses them anyway.
- [ ] **The connector:** if Claude should be able to use it, a tool in `src/mcp/tools.ts` and a line in its instructions.
- [ ] **Docs** (next section).

## Common tasks

**Change or add interface text.** Add the key to `src/messages/fa.ts` (the source, which defines the `Messages` type) and the same key to `src/messages/en.ts`; `pnpm typecheck` fails while one is missing. Messages use ICU syntax (`{amount}`), and you pass them values already formatted. Read them with `useTranslations` in client components and `getTranslations` in async Server Components and Server Actions. The copy rules (tone, buttons, errors) are in [design system](docs/development/features/design-system.md).

**Change the database.**

1. Edit the tables in `src/db/schema/`.
2. Generate the migration and read the SQL it wrote in `drizzle/`:

   ```bash
   pnpm db:generate
   ```

3. Apply it to your `dev` branch and try the app:

   ```bash
   pnpm db:migrate
   ```

4. Check it against the [migration rules](docs/development/releases.md#migration-rules): the previous version must still work on the migrated database. Never edit a migration that has been applied; after rebasing onto a newer migration, regenerate yours. Each Vercel deployment migrates its own database.

**Add a page.** Create `src/app/(app)/<name>/` with `page.tsx` (`generateMetadata` for the title, `requireUser()` first), `loading.tsx` (the page's skeleton) and `error.tsx`. Put the page's UI in `src/components/<name>/` with stories, including a `Loading` story. If it is a section, add it to `NAV_ITEMS` in `src/constants/navigation.ts` with a `nav` message. Add the route to the table in [architecture](docs/development/architecture.md#routes).

**Add or change an MCP tool.** Register it in `src/mcp/tools.ts` with a Zod input whose fields have `.describe()` texts, and the right annotations (`readOnlyHint`, `destructiveHint`). Write tools go after the `if (!writer) return` line and convert dates and amounts with `src/helpers/connector.ts`. Mention it in `src/mcp/instructions.ts`, update the tool table in the [connector doc](docs/development/features/connector.md#tools), and try it from Claude Code against `http://localhost:3000/mcp`.

**Create a user on your machine:** `pnpm user:create` asks for the username, display name, role, language and password.

**Start again with fresh data:** reset your `dev` branch from production, as [local development](docs/development/local-development.md#fresh-data) describes.

## Getting help

- **Questions, bugs and ideas:** open an [issue](https://github.com/mrghasemi1992/money/issues). For a new feature, open the issue before writing code, so the approach can be agreed first.
- **Vulnerabilities:** privately, as [SECURITY.md](SECURITY.md) describes, never in a public issue.
- **The maintainer** is [Mohammad Reza Ghasemi](https://github.com/mrghasemi1992).
- **If the docs don't answer your question,** find the answer in the code, then add it to the right doc in your pull request, so the next person doesn't have to dig.

## Keep the docs up to date

Every change updates the docs it affects, in the same pull request. A PR whose code and docs disagree isn't finished.

| You changed                                         | Update                                                                                                                                                   |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How a feature works, its files, queries or rules    | Its doc in `docs/development/features/`                                                                                                                  |
| A table, a column, a data rule, a route or a folder | `docs/development/architecture.md`                                                                                                                       |
| A convention or a tool                              | `docs/development/conventions.md` (and `CLAUDE.md` if agents must know)                                                                                  |
| The setup, the scripts or the workflow              | `CONTRIBUTING.md`                                                                                                                                        |
| Anything a self-hoster does or sees during setup    | `docs/self-hosting.md`                                                                                                                                   |
| Updating, releases, migrations, deployments         | `docs/updating.md`, `docs/development/releases.md`                                                                                                       |
| Local development or database branches              | `docs/development/local-development.md`                                                                                                                  |
| A key decision, or the reason behind one            | `docs/development/decisions.md`                                                                                                                          |
| A screen or a flow users see                        | `docs/user-guide.md` and `docs/user-guide.fa.md`; retake its screenshots with `pnpm docs:screenshots` (callouts are defined in `scripts/screenshots.ts`) |
| What Money can do                                   | `README.md`                                                                                                                                              |
| A rule for AI agents                                | `CLAUDE.md`                                                                                                                                              |

The docs are in English, except where they quote the interface in Persian.

## License

Money is under the [PolyForm Noncommercial License 1.0.0](LICENSE).
