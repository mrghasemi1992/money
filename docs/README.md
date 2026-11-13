# Money's documentation

Pick the part for what you want to do.

## Run your own copy

For a person or family who wants their own Money. No programming needed.

- [Set up a copy](self-hosting.md): fork, deploy on Vercel with a Neon database, create your admin account. About 15 minutes.
- [Update a copy](updating.md): one click on GitHub, and what to do if an update goes wrong.

## Develop Money

For anyone who changes the code: the maintainer, a contributor or an AI agent. Read them in this order.

1. [CONTRIBUTING.md](../CONTRIBUTING.md): set up your machine, the scripts, the workflow, common tasks, and which doc to update for which change.
2. [Architecture](development/architecture.md): the parts, how a request moves through them, the data rules and model, routes, the folder map and a glossary.
3. [Decisions](development/decisions.md): the key decisions, why they were made and what they cost.
4. [Conventions](development/conventions.md): the rules for code, copy, styling, components and stories.
5. The doc of the area you work on:
   - [Users, roles and sign-in](development/features/users-and-auth.md)
   - [Accounts and categories](development/features/accounts-and-categories.md)
   - [Transactions](development/features/transactions.md)
   - [Budgets](development/features/budgets.md)
   - [Reports](development/features/reports.md)
   - [Dashboard](development/features/dashboard.md)
   - [CSV import and export](development/features/csv.md)
   - [Claude and ChatGPT connector](development/features/connector.md), with the MCP tool reference
   - [Languages, calendars and currency](development/features/languages-and-currency.md)
   - [Design system and app shell](development/features/design-system.md)

## Maintain the project

- [Releases, deployments and migrations](development/releases.md), and what to do if a release breaks copies.
- [Local development on a database branch](development/local-development.md).
- [Security policy](../SECURITY.md).
