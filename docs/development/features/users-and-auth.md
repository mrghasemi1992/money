# Users, roles and sign-in

Money has no public sign-up. A new copy creates its first admin on `/setup`, and from then on admins create every account on `/admin/users`. Each user has a role (admin, editor or viewer) that decides what they may do, checked on the server on every request. Sign-in is by username and password, through Better Auth.

[Architecture](../architecture.md) explains how the pieces fit together; [conventions](../conventions.md) the rules for writing code.

## Where the code is

| Part                                 | Where                                                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Sign-in page                         | `src/app/login/`, `src/components/login/`, `src/helpers/sign-in.ts`                                               |
| First admin of a new copy            | `src/app/setup/` (page, `actions.ts`), `src/components/setup/`, `src/auth/setup.ts`, `src/helpers/first-admin.ts` |
| User management page                 | `src/app/(app)/admin/users/` (page, `actions.ts`), `src/components/user-management/`                              |
| Better Auth setup                    | `src/auth/index.ts`, schema in `src/db/schema/auth.ts`, handler `src/app/api/auth/[...all]/`                      |
| Session and role checks              | `src/auth/session.ts` (`requireUser`, `requireWrite`, `requireAdmin`), `src/helpers/role.ts`, `src/proxy.ts`      |
| Queries                              | `src/db/users.ts`, `src/db/attempts.ts`                                                                           |
| Roles, passwords, placeholder emails | `src/constants/user.ts`, `src/helpers/user.ts`, `src/helpers/new-user.ts`                                         |

## How it works

1. **A new copy** has no users, so `/login` sends visitors to `/setup`. Whoever knows the setup code (the deployment's `BETTER_AUTH_SECRET`) creates the first admin there; afterwards the page is closed.
2. **Signing in** posts the username and password to Better Auth (`/api/auth/sign-in/username`, limited to 5 tries per IP in 5 minutes), which sets a session cookie.
3. **Every request** reads the session and the user record. `requireUser()`, `requireWrite()` and `requireAdmin()` decide by the role stored at that moment, so a role change or a disabled account takes effect on the next request. Viewers and non-admins get a not-found page, not an error.
4. **Admins manage users** on `/admin/users`. Its Server Actions call Better Auth's admin plugin from the server; the plugin's own HTTP endpoints are closed, so nobody can skip the page's guards (an admin can't demote or disable themself, and the last admin always stays).
5. **Disabling a user or resetting a password** signs them out everywhere and disconnects their Claude and ChatGPT access in the same step.

## Roles

| Role     | Label (fa / en)   | Read | Write | User management and book settings |
| -------- | ----------------- | ---- | ----- | --------------------------------- |
| `admin`  | مدیر / Admin      | ✓    | ✓     | ✓                                 |
| `editor` | ویرایشگر / Editor | ✓    | ✓     | ✗                                 |
| `viewer` | بیننده / Viewer   | ✓    | ✗     | ✗                                 |

- **Read:** see every page with the book's data: dashboard, transactions, budgets, reports, accounts, categories. Export CSV.
- **Write:** create, edit and delete transactions, accounts, categories and budgets, and import CSV. Write includes read.
- **User management** (admins only): create users, reset passwords, disable and enable users, change roles. The page is `/admin/users` (see User management below).
- **Book settings** (admins only): the book's currency.
- Every user can change their own display name, password, language, calendar, rial or toman, and theme, and connect Claude.
- New users get `viewer` unless the admin picks another role (`DEFAULT_USER_ROLE`).
- The role is checked on the server for every page, Server Action, Route Handler and MCP tool call, read from the user record at that moment (a role change applies right away, also to already connected Claude sessions). Hiding controls in the UI is only a convenience: a viewer sees no add, edit or delete controls, but the server is what enforces it.
- Role names are in `src/constants/user.ts` (`USER_ROLES`); their labels are the `role` messages. What each role may do is in `src/helpers/role.ts` (`canWrite`, `canManageUsers`, and `toUserRole` for the plain string Better Auth stores), shared by the server checks, the MCP tools and the UI. The server checks are `requireUser()` (any role: reading, own settings), `requireWrite()` and `requireAdmin()` in `src/auth/session.ts`.

## First admin

A new copy has no users, so `/login` sends visitors to `/setup` (`Setup` in `src/components/setup`, page in `src/app/setup/page.tsx`, outside the app shell; the proxy lets it through without a session). It works only while the `user` table is empty (`hasUsers` in `src/db/users.ts`; afterwards the page and its action redirect to `/login`).

- The form asks for the **setup code**, then a display name, username and password (`firstAdminSchema` in `src/helpers/first-admin.ts`, shared by the form and the action; messages are keys of `setup.errors`). The setup code is the deployment's `BETTER_AUTH_SECRET`, which only the person who deployed the copy knows (`isSetupCode` in `src/auth/setup.ts`: SHA-256 digests compared with `timingSafeEqual`). It keeps a stranger who finds a new copy's address first (new domains appear in public certificate logs) from claiming the book.
- `createFirstAdmin` (`src/app/setup/actions.ts`) creates an `admin` with the admin plugin's `createUser` without a session (as `pnpm user:create` does), in the page's language with its calendar. The browser then signs in through `/api/auth/sign-in/username` (`signInWithUsername`) and opens the dashboard, whose first-run steps take over.
- `pnpm user:create` still creates users from a terminal.

## User management

`/admin/users` (`UserManagement` in `src/components/user-management`, Server Actions in `src/app/(app)/admin/users/actions.ts`). Every action calls `requireAdmin()` first and validates its input with Zod; the user record and the role are read fresh each time.

- **Create:** display name, username, temporary password, role (default `viewer`) and language, through the Better Auth admin plugin's `createUser` with the admin's session headers. The calendar follows the language (`DEFAULT_CALENDAR`), as in `pnpm user:create`. The username plugin lowercases the username for sign-in, keeps the typed form as `display_username` and refuses a taken one (shown on the username field). The form's rules are `newUserSchema` (`src/helpers/new-user.ts`), shared by the form and the action; its messages are keys of `users.form.errors`.
- **Temporary passwords** are made on the server with `node:crypto` (`generateTemporaryPassword` in `src/helpers/user.ts`: three groups of four from an alphabet without look-alikes, «kT7m-Qx4p-Wz9r»). The new-user form asks for one when it opens (`generatePassword` action) and can ask for another; the admin may also type one. A reset makes one, sets it with the admin plugin's `setUserPassword` and returns it once to the dialog. Only Better Auth's hash is stored; the password is never logged or kept.
- **Reset password** also signs the user out everywhere (`revokeUserSessions`) and then disconnects their apps (`revokeAllConnections`), so an app connected with the old password, or in between, loses its access. An admin can't reset their own password here (they change it in settings, with the current one, which also signs out their other sessions and disconnects their apps).
- **Change role** and **disable** run as one guarded SQL statement each (`setUserRole`, `disableUser` in `src/db/users.ts`): they lock the actor's and the target's rows (in id order) and write only while the actor is still an enabled admin and isn't the target. So an admin can't demote or disable themself, and two admins acting on each other at once can't leave the book without an admin: the last enabled admin always stays. The actions check self first for a clear message. Removing admin rights asks for confirmation.
- **Disable** (Better Auth's ban) deletes the user's sessions and their Claude connector grants and tokens (`revokeGrants`) in the same statement, so they are signed out and Claude loses access at once; banned users can't sign in and count as signed out in `getSession`. Disabled users stay in the database. **Enable** is the admin plugin's `unbanUser`; the toast after disabling offers «واگرد» / «Undo», which enables again.
- The list (`listUsers`) shows display name, username, role, language, status and creation date (the day in the viewer's time zone), with search and role and status filters on the client. A table from a 50rem-wide list (container query), cards below that. On the admin's own row the actions they can't take are disabled with a reason (Menu items' `description`).

## Better Auth

- **Auth:** Better Auth (self-hosted library, data in Neon, no paid service) with its username plugin (sign-in by username and password), admin plugin (user management) and OAuth 2.1 provider / MCP plugin (the Claude connector). Check the current Better Auth docs for the plugin names before using them: the MCP plugin is being replaced by the OAuth Provider plugin. Setup in `src/auth/index.ts`:
  - Drizzle adapter, UUID ids made by `generateId: () => crypto.randomUUID()`, not `"uuid"`: with `"uuid"` Better Auth drops ids it is handed that aren't UUIDs, such as the jti digest of a `private_key_jwt` assertion (`oauth_client_assertion`), and ChatGPT's token request fails. The Better Auth tables are written by hand in `src/db/schema/auth.ts`; when a plugin adds fields, add them there.
  - No sign-up: `emailAndPassword.disableSignUp`, and `/sign-up/email`, `/sign-in/email` and `/is-username-available` are in `disabledPaths`. **Closed over HTTP** (`DISABLED_PATHS` in `src/auth/index.ts`, exact paths answer 404): those three, the JWT plugin's `/token`, every `/admin/*` endpoint of the admin plugin (over HTTP an admin could skip `/admin/users`' guards: the last admin, no deletions, revoking apps), `/update-user` (it would let users change their username), `/change-password` (the settings action limits attempts, below) and the email, social, password-reset-by-link and account-deletion endpoints Money doesn't use. `auth.api` calls from Server Actions skip the list, so the app still uses those endpoints itself; a new Better Auth endpoint that Money doesn't need goes on the list. Users are created by an admin on `/admin/users` (admin plugin) or with `pnpm user:create`; the first admin of a new copy on `/setup` (see [First admin](#first-admin)). Better Auth requires an email, so users get a random `…@users.money.invalid` address (`placeholderEmail` in `src/helpers/user.ts`) that is never shown.
  - Roles `admin`, `editor` and `viewer` (admin plugin `roles`: `admin` gets only what `/admin/users` calls, `adminRole`: create a user with a role, set a password, ban and unban, revoke sessions; `editor` and `viewer` get none; default `viewer`). Banned users can't sign in (checked after the password, so a wrong password never reveals the account) and count as signed out in `getSession`.
  - Sign-in rate limit: 5 attempts per IP per 5 minutes (`SIGN_IN_LIMIT`), stored in the `rate_limit` table so it holds across serverless instances. Rate limits only apply to HTTP calls to `/api/auth`, so the login form posts to `/api/auth/sign-in/username` (`signInWithUsername` in `src/helpers/sign-in.ts`), not to a Server Action. Changing the password is a Server Action (it also disconnects apps), so it counts its own attempts: 5 per user per 15 minutes (`PASSWORD_CHANGE_LIMIT`), in the same `rate_limit` table under a `money:` key (`takeAttempt`, `clearAttempts` in `src/db/attempts.ts`, counted before the check so parallel tries can't slip past; a success clears it).
  - `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in env (the secret is also the setup code of `/setup`). On Vercel `BETTER_AUTH_URL` may be unset: the app then accepts its own `VERCEL_URL` / `VERCEL_BRANCH_URL` hosts, and in production `VERCEL_PROJECT_PRODUCTION_URL` too. Calls to `auth.api` without request headers (`createFirstAdmin` on `/setup`, `getJwks` for the MCP endpoint) have no host to pick from and use `getAppUrl()` as Better Auth's `baseURL.fallback`.
  - The OAuth 2.1 provider for the Claude connector: `jwt`, `mcp` and `cimd` plugins (see [connector](connector.md)).

## Security headers

- **Security headers:** `SECURITY_HEADERS` in `next.config.ts` on every response: `Content-Security-Policy` `frame-ancestors 'none'; base-uri 'self'; object-src 'none'` and `X-Frame-Options: DENY` (no page may be framed, so the login and the consent page can't be clickjacked), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Permissions-Policy` without camera, microphone, geolocation or topics; `poweredByHeader` is off and Vercel adds HSTS. No `script-src` (Next.js and the theme and sidebar scripts are inline, and previews load Vercel's toolbar) and no `Cross-Origin-Opener-Policy` (Claude and ChatGPT watch the sign-in popup they open).
