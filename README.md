# Money

A personal accounting app with a Persian (right-to-left) and English interface, built with Next.js. See `CLAUDE.md` for the full scope and decisions, and `docs/phases.md` for the build plan.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://money.localhost:3000](http://money.localhost:3000).

## Connect Claude

Money is also a remote MCP server, so Claude can record transactions and answer questions about the book. Each user connects their own Claude and signs in to Money; Claude then works with that user's role (viewers can only read).

1. In Money, open **Settings → Connect to Claude** (`/settings/connector`) and copy the connector URL: `https://<your domain>/mcp`.
2. In Claude, go to **Settings → Connectors → Add custom connector**. Name it (for example «پول» or "Money"), paste the URL into **Remote MCP server URL** and click **Add**. Leave the OAuth client ID and secret empty.
3. Click **Connect**. A Money window opens: sign in with your username and password, then click **Allow** on the permission page.
4. Ask Claude, for example: «این پیامک بانک رو ثبت کن» (with the SMS pasted), or "How much did I spend on restaurants this month?"

Connected apps are listed on the same settings page, where you can revoke one. An admin disabling a user disconnects their apps too.

How it works: Money is its own OAuth 2.1 authorization server (Better Auth's MCP plugin). Claude identifies itself with a Client ID Metadata Document, so there is nothing to register. Discovery metadata is at `/.well-known/oauth-protected-resource/mcp` and `/.well-known/oauth-authorization-server/api/auth`. Details are in `CLAUDE.md` (Claude connector).

- **Locally** the connector URL is `http://localhost:3000/mcp` (OAuth accepts plain HTTP only for `localhost`), while the app itself runs on `money.localhost`. claude.ai can't reach a local server; use an MCP client on the same machine (Claude Code, or the MCP Inspector with a client registered for it).
- **Preview deployments** use their branch URL: `https://<project>-git-<branch>-<team>.vercel.app/mcp`. Vercel's deployment protection must allow the request, or claude.ai can't reach it.

## Scripts

| Script                 | Description                |
| ---------------------- | -------------------------- |
| `pnpm dev`             | Start the dev server       |
| `pnpm build`           | Production build           |
| `pnpm start`           | Serve the production build |
| `pnpm lint`            | Run ESLint                 |
| `pnpm typecheck`       | Type check with TypeScript |
| `pnpm format`          | Format files with Prettier |
| `pnpm format:check`    | Check formatting           |
| `pnpm storybook`       | Start Storybook            |
| `pnpm build-storybook` | Build static Storybook     |
| `pnpm db:generate`     | Generate a SQL migration   |
| `pnpm db:migrate`      | Apply migrations           |
| `pnpm user:create`     | Create a user (prompts)    |
