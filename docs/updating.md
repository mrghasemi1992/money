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
- **Your copy isn't a fork?** A copy made with Vercel's Deploy button (as earlier versions of the guide did) or by uploading the code has no link back, so it can't be synced. Move it once: fork the repository on GitHub, then in Vercel open the project → **Settings → Git**, disconnect the old repository and connect your fork. The project keeps its domain, environment variables and database. The steps are in [self-hosting.md](self-hosting.md#set-up-with-the-old-deploy-button).

## If an update goes wrong

**The deployment failed.** Nothing changed: the previous version keeps running and the database stays as it was. Vercel marks it **Error** under **Deployments**, and **Settings → About Money** still shows the old version.

1. In Vercel, open your project → **Deployments**, then the failed deployment → **Building**. The last red lines say why.
2. Check the release notes: a **⚠ Breaking changes** step that wasn't done (for example a new environment variable) is the usual reason. Do it, then **Redeploy** the failed deployment.
3. Otherwise, open an [issue](https://github.com/mrghasemi1992/money/issues) with your version, the release you synced to and those last lines of the log. Leave out secrets, passwords and anything from your book.

**The new version runs, but something is wrong.**

1. Go back: in Vercel → **Deployments**, open the previous production deployment, and choose **Instant Rollback** in its **⋯** menu. Your domain serves the previous version within seconds.
2. Your data stays as the new version left it: database updates aren't undone, and they are written so the previous version still works with them, unless the release notes say otherwise.
3. Report it in an [issue](https://github.com/mrghasemi1992/money/issues), as above.
4. After a rollback, Vercel stops putting new deployments live by itself. When a fixed release is out, click **Sync fork**, then in **Deployments** open the new deployment and choose **Promote** (or **Undo Rollback** first), so updates go live automatically again.
