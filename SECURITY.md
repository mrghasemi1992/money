# Security policy

Money keeps a household's financial records, so security reports are welcome and taken seriously.

## Reporting a vulnerability

Please report it privately, not in a public issue, pull request or discussion:

1. Open the repository's [**Security** tab](https://github.com/mrghasemi1992/money/security).
2. Click **Report a vulnerability** and describe the problem: what an attacker can do, the steps to reproduce it, and the version or commit you tested.

Only the maintainer sees the report. You can expect an answer within a week. Once a fix is released, the advisory is published with credit to you, unless you'd rather stay anonymous.

## Supported versions

Only the [latest release](https://github.com/mrghasemi1992/money/releases/latest) gets security fixes. Each copy of Money is a fork that updates with **Sync fork** ([docs/updating.md](docs/updating.md)), so the fix reaches a copy when its owner syncs. **Settings → About Money** shows admins when a newer release is out.

## Scope

In scope: the app in this repository. That includes sign-in and roles, the Claude and ChatGPT connector (OAuth and the MCP endpoint), CSV import and export, and the setup of a new copy.

Out of scope: Vercel, Neon, GitHub, Claude and ChatGPT themselves (report to them), problems that need an admin's own account or a copy's `BETTER_AUTH_SECRET`, and missing hardening without a way to exploit it.

Please don't test against a copy you don't own. Run your own (see [docs/self-hosting.md](docs/self-hosting.md)) or a local one.
