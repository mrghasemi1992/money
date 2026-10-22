# Updating your copy of Money

Every person or family runs their own copy of Money: a fork of [mrghasemi1992/money](https://github.com/mrghasemi1992/money) on GitHub, deployed on Vercel with a Neon database ([setting one up](self-hosting.md)). New versions come out as [releases](https://github.com/mrghasemi1992/money/releases).

## Which version you run

**Settings → About Money** shows the version (and, on Vercel, the commit). Admins also see a notice there when a newer release is out, with a link to its notes.

## Update

1. Read the release notes. If they have a **⚠ Breaking changes** section, follow its steps first.
2. On GitHub, open your fork and click **Sync fork → Update branch**.
3. That's all. Vercel sees the new commit and, in a few minutes:
   1. builds the new version,
   2. updates the database (the release's migrations),
   3. switches your domain to the new version.

   If the build or the database update fails, the deployment stops: the previous version keeps running and the database stays as it was. The reason is in the deployment's build log on Vercel.

4. Reload **Settings**: the version is the new one.

Skipping versions is fine: every update the database hasn't had yet runs in order, all in one transaction. A release that needs an earlier one first says so in its notes.

## Good to know

- **Your data isn't in the repository.** The book is in the Neon database, and the secrets are Vercel environment variables. Syncing the fork changes only the code.
- **Don't change files in your fork.** «Sync fork» then can't merge cleanly. If GitHub reports conflicts, choose **Discard commits**: your fork returns to the released code, and your data and settings stay.
- **Your copy isn't a fork?** A copy made with the "Deploy" button or by uploading the code has no link back, so it can't be synced. Move it once: fork the repository on GitHub, then in Vercel open the project → **Settings → Git**, disconnect the old repository and connect your fork. The project keeps its domain, environment variables and database. The steps are in [self-hosting.md](self-hosting.md#5-switch-to-a-fork-so-you-can-update).
- **Going back.** Vercel's **Instant Rollback** returns to the previous deployment. Database updates stay, and they are written so the previous version still works with them, unless the release notes say otherwise.
