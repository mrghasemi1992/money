# Run your own copy of Money

Every person or family runs their own copy of Money, on their own free accounts. Setting one up takes about 15 minutes and no terminal: everything happens in the browser.

**How it fits together.** Your copy is a **fork** of this repository on GitHub: a copy of the code that GitHub keeps linked to the original, so new versions reach you with one click. A **Vercel project** builds and runs your fork, and a **Neon database**, which Vercel creates for you, holds your book. You set it up in this order:

1. Fork the repository (step 2).
2. Make a secret (step 3).
3. Import the fork into Vercel, with the database and the secret (step 4).
4. Create your admin account (step 5).

## 1. What you need

- A [GitHub](https://github.com/signup) account. Your copy of the code lives there.
- A [Vercel](https://vercel.com/signup) account on the free **Hobby** plan. Sign up with your GitHub account. Vercel runs the app; the Hobby plan is for personal, noncommercial use, which is what Money's license allows too.
- The database comes from [Neon](https://neon.com), on its free plan. Vercel creates it for you in step 4; you don't need to sign up separately.

## 2. Fork the repository

1. Sign in to GitHub and open [github.com/mrghasemi1992/money/fork](https://github.com/mrghasemi1992/money/fork).
2. Keep the name `money`, leave **Copy the `main` branch only** ticked, and click **Create fork**.

If you forked it before, skip this step and use that fork.

## 3. Make a secret

Money needs one random secret to protect sign-ins. It is also the **setup code** you type once, in step 5, to create your admin account.

1. Open [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32). It shows 32 random letters and digits; every reload makes new ones.
2. Copy it and keep it somewhere safe, for example in your password manager. Don't share it.

## 4. Deploy on Vercel

1. Open [vercel.com/new](https://vercel.com/new) (in the dashboard: **Add New → Project**). Sign in with GitHub if it asks.
2. Under **Import Git Repository**, find your fork `money` and click **Import**. If it isn't listed, click **Adjust GitHub App Permissions**, allow Vercel to see the fork, then come back and import it.
3. On the **Configure Project** screen, keep the project name and the framework (Next.js) as they are, and set up two things before deploying.
4. **The database.** In the storage section of the screen, add **Neon**, then:
   - **Region:** keep the one Vercel suggests (Washington, D.C., US East), so the database sits next to the app.
   - **Plan:** Free.
   - **Environment variable prefix:** change it to `DATABASE`. Money reads `DATABASE_URL`, so any other prefix leaves the app without a database.
   - If the form shows **Create database branch for deployment**, tick only **Preview** and leave **Production** unticked, as [Neon recommends](https://neon.com/docs/guides/vercel-managed-integration#connecting-the-database-to-a-vercel-project): production should always use the database's main branch, where your book is.
   - Accept Neon's terms and create the database.
5. **The secret.** Open **Environment Variables** and add one:
   - **Key:** `BETTER_AUTH_SECRET`
   - **Value:** the secret from step 3
6. Click **Deploy** and wait two or three minutes. Vercel builds the app and creates the database tables.
7. When it says **Congratulations**, click **Continue to Dashboard**. Your address is under **Domains**, for example `money-abc123.vercel.app`.

## 5. Create your admin account

1. Open your address. Because the book has no users yet, Money opens **Set up Money**.
2. **Setup code:** paste the secret from step 3.
3. Choose your display name, a username and a password, and click **Create admin account**. You are signed in and land on the dashboard.

The page only works while the book has no users: once your account exists, it sends everyone to the sign-in page.

New versions come out as [releases](https://github.com/mrghasemi1992/money/releases). Updating is one click on your fork: see [updating.md](updating.md).

## 6. Next steps

- **Currency:** an IRR (rial) book is the default. For dollars, euros or pounds, change it in **Settings → Book settings** before you record any amounts. It can't change once the book holds amounts.
- **Accounts and categories:** the dashboard walks you through your accounts, categories and first transaction.
- **Family members:** add them in **User management** (`/admin/users`), each with their own username and role. Make a second admin too: Money can't email a forgotten password, so another admin is how a password gets reset.
- **Claude or ChatGPT:** connect them in **Settings → Claude** (`/settings/connector`).
- **Your own domain:** add it in Vercel → **Settings → Domains**, then open **Deployments** and **Redeploy** the latest one, so Money uses the new address. Connect Claude again afterwards, with the new address.

## If something goes wrong

- **The deployment failed with “DATABASE_URL is not set”.** The database wasn't connected, or its prefix isn't `DATABASE`. In Vercel open the project → **Storage**: connect the Neon database (or create one) with the prefix `DATABASE`, then **Deployments → Redeploy**. Under **Settings → Environment Variables** you should see `DATABASE_URL`.
- **“The setup code is incorrect.”** It must be exactly the `BETTER_AUTH_SECRET` from step 4. If you lost it, set a new one in Vercel → **Settings → Environment Variables** (edit `BETTER_AUTH_SECRET`), then **Redeploy** and use the new one. Changing it is harmless before anyone has signed in.
- **The build log shows `NeonDbError: relation "oauth_resource" does not exist`.** This is harmless. Versions up to 0.4.0 logged it on a new copy's first build, before the database tables were created. The deployment still succeeds, and the build creates the tables right after.
- **“Production” was ticked under “Create database branch for deployment”.** Open the database in Vercel → **Storage**, then **Open in Neon**, then **Branches**. If it lists only `main` (and branches starting with `preview/`), production uses `main` and there's nothing to do; a copy set up this way showed no extra branches after several deployments. If it lists other branches, don't change the connection: ask in the repository's [issues](https://github.com/mrghasemi1992/money/issues) first, since your latest data may be on one of them.
- **Preview deployments fail after a few pull requests.** Each preview gets a database branch named `preview/…`, and Neon's free plan allows 10. Delete the old ones under **Branches** in Neon; keep `main`. Most copies never make previews.
- **The build log says something else.** Open the failed deployment in Vercel → **Building**; the last red lines say why. You can ask for help in the repository's [issues](https://github.com/mrghasemi1992/money/issues).

## Set up with the old Deploy button?

Copies made before this guide used Vercel's Deploy button, which creates a repository (`money-setup`) that isn't a fork and can't receive updates. Switch it to a fork once: your app, database and settings stay as they are.

1. Fork the repository (step 2).
2. In Vercel, open your project → **Settings → Git**. Under **Connected Git Repository**, click **Disconnect**.
3. Click **Connect** (GitHub), choose your fork `money` and confirm. If the fork isn't listed, click **Adjust GitHub App Permissions**, allow Vercel to see the fork, then choose it.
4. Optional: delete the `money-setup` repository on GitHub (its **Settings → Danger Zone → Delete this repository**).
