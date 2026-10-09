# Money

A personal accounting app with a Persian (right-to-left) and English interface, built with Next.js. See `CLAUDE.md` for the full scope and decisions, and `docs/phases.md` for the build plan.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://money.localhost:3000](http://money.localhost:3000).

## Connect Claude or ChatGPT

Money is also a remote MCP server, so Claude or ChatGPT can record transactions and answer questions about the book. Each user connects their own Claude and signs in to Money; Claude then works with that user's role (viewers can only read).

1. In Money, open **Settings → Connect to Claude** (`/settings/connector`) and copy the connector URL: `https://<your domain>/mcp`.
2. In Claude, go to **Settings → Connectors → Add custom connector**. Name it (for example «پول» or "Money"), paste the URL into **Remote MCP server URL** and click **Add**. Leave the OAuth client ID and secret empty.
3. Click **Connect**. A Money window opens: sign in with your username and password, then click **Allow** on the permission page.
4. Ask Claude, for example: «این پیامک بانک رو ثبت کن» (with the SMS pasted), or "How much did I spend on restaurants this month?"

To connect ChatGPT instead: in ChatGPT turn on **Developer mode** (**Settings → Apps → Advanced settings**; it depends on your plan and workspace, and some plans only allow read access), open **Plugins**, click **+**, choose **Add custom MCP server**, enter the same URL, set authentication to **OAuth** (leave the client ID and secret empty), accept the warning (**I understand and want to continue**) and click **Create as a plugin**; then sign in to Money and allow access. ChatGPT can only reach a public HTTPS URL, not `localhost`. The menus follow OpenAI’s [MCP docs](https://developers.openai.com/api/docs/mcp) and may change. ChatGPT identifies itself with its own Client ID Metadata Document (`https://chatgpt.com/oauth/client.json`), so nothing is registered here either.

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

## License

Copyright 2026 Mohammad Reza Ghasemi.

The source code is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

- **Noncommercial use is free.** You can use, copy, change and share the code for personal, study, research and other noncommercial purposes.
- **Credit is required.** Keep the `Required Notice:` lines from the [LICENSE](LICENSE) file in every copy, and credit Mohammad Reza Ghasemi as the author with a link to this repository.
- **Commercial use needs a paid license.** Companies and anyone using Money for commercial purposes must buy a separate license. Contact me through [GitHub](https://github.com/mrghasemi1992).

### Name and logo

The name "Money" («پول») and the Money logo are not covered by the license. They belong to Mohammad Reza Ghasemi and may not be used in copies or modified versions. If you publish your own version, use a different name and logo.

### Third-party content

Libraries and fonts used by this project keep their own licenses. Money is not affiliated with or endorsed by Anthropic; Claude is a trademark of Anthropic.
