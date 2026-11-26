<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Money

Read [CLAUDE.md](CLAUDE.md) first: it holds the rules for every change and points to the docs for each area (all listed in [docs/README.md](docs/README.md)). It is written for Claude Code but applies to any agent, with two notes for agents other than Claude Code:

- Its `@docs/development/conventions.md` line is a Claude Code import: read [docs/development/conventions.md](docs/development/conventions.md) yourself, since its rules are part of CLAUDE.md.
- Its "Claude Code setup" section (the plugins, MCP servers and preview servers in `.claude/` and `.mcp.json`) is for Claude Code only. Everything else applies to you, including asking before every commit, push or PR.
