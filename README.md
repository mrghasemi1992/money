# Money

A personal accounting app for a person or a family, in Persian (right to left) and English. Record income, expenses and transfers by hand, from a CSV file, or by telling Claude or ChatGPT, and see where the money goes.

## Features

- **One shared book** for the family: accounts with live balances, income and expense categories with subcategories, colors and icons.
- **Transactions:** income, expense and transfers between your own accounts, with descriptions, tags and filters; undo after adding or deleting.
- **Budgets:** a monthly limit per category, with progress and warnings near the limit.
- **Reports:** income, expense and net against the previous period, by category, by account and month by month, plus insights (biggest changes, savings rate, recurring spending, largest transactions, budget record). Every chart has a table view.
- **Dashboard:** balances, this month, budgets, top spending and recent transactions at a glance.
- **Claude and ChatGPT:** connect them to record transactions from a bank SMS or a sentence, and to ask questions about your spending.
- **CSV import and export**, with both calendars.
- **Persian and English**, Jalali or Gregorian calendar, rial or toman, light and dark themes, per user. Rial, dollar, euro or pound books.
- **Roles:** admin, editor and viewer. Invite only, no public sign-up.
- **Self-hosted** on free GitHub, Vercel and Neon accounts, with one-click updates.

## Run your own copy

Each person or family runs their own copy of Money: a fork of this repository on GitHub, deployed on free Vercel and Neon accounts. Setting one up takes about 15 minutes in the browser, with no terminal: [docs/self-hosting.md](docs/self-hosting.md).

**Settings → About Money** shows the version you run, and admins see when a newer [release](https://github.com/mrghasemi1992/money/releases) is out. Updating is one click on your fork: [docs/updating.md](docs/updating.md).

## Using Money

The user guide walks through every screen with annotated screenshots: accounts, categories, transactions, budgets, reports, CSV files, settings, user management, and connecting Claude or ChatGPT. In [English](docs/user-guide.md) and [فارسی](docs/user-guide.fa.md).

How the connector works, and how to test it locally or on a preview, is in [the connector doc](docs/development/features/connector.md).

## Documentation

Everything is in [docs/](docs/README.md), grouped by what you want to do:

- **Using Money:** the [user guide](docs/user-guide.md) ([فارسی](docs/user-guide.fa.md)).
- **Running a copy:** [self-hosting](docs/self-hosting.md) and [updating](docs/updating.md).
- **Developing Money**, for people and AI agents: start with [CONTRIBUTING.md](CONTRIBUTING.md), then [architecture](docs/development/architecture.md), [decisions](docs/development/decisions.md), [conventions](docs/development/conventions.md) and the [feature docs](docs/development/features/).
- **Maintaining:** [releases](docs/development/releases.md) and [local development](docs/development/local-development.md).

## Security

Please report vulnerabilities privately through the repository's **Security** tab, not in a public issue: see [SECURITY.md](SECURITY.md).

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
