# Run your own copy of Money

Every person or family runs their own copy of Money, on their own free accounts. Setting one up takes about 15 minutes and no terminal: everything happens in the browser.

## 1. What you need

- A [GitHub](https://github.com/signup) account. Your copy of the code lives there.
- A [Vercel](https://vercel.com/signup) account on the free **Hobby** plan. Sign up with your GitHub account. Vercel runs the app; the Hobby plan is for personal, noncommercial use, which is what Money's license allows too.
- The database comes from [Neon](https://neon.com), on its free plan. Vercel creates it for you in step 3; you don't need to sign up separately.

## 2. Make a secret

Money needs one random secret to protect sign-ins. It is also the **setup code** you type once, in step 4, to create your admin account.

1. Open [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32). It shows 32 random letters and digits; every reload makes new ones.
2. Copy it and keep it somewhere safe, for example in your password manager. Don't share it.

## 3. Deploy

1. Click this button:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmrghasemi1992%2Fmoney&project-name=money&repository-name=money-setup&env=BETTER_AUTH_SECRET&envDescription=A%20random%20secret%20of%20at%20least%2032%20characters.%20It%20is%20also%20the%20setup%20code%20for%20your%20first%20admin%20account%3A%20keep%20a%20copy.&envLink=https%3A%2F%2Fgithub.com%2Fmrghasemi1992%2Fmoney%2Fblob%2Fmain%2Fdocs%2Fself-hosting.md%232-make-a-secret&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%2C%22envVarPrefix%22%3A%22DATABASE%22%7D%5D)

2. Sign in to Vercel with GitHub if it asks.
3. **Create Git Repository:** keep the name `money-setup` and click **Create**. This repository is only for the first deployment; step 5 replaces it.
4. **Add Products → Neon:** click **Add**, then:
   - **Region:** keep the one Vercel suggests (Washington, D.C., US East), so the database sits next to the app.
   - **Plan:** Free.
   - Accept Neon's terms and click **Create**. Keep the environment variable prefix `DATABASE` if the form shows it.
5. **Environment Variables:** paste the secret from step 2 into `BETTER_AUTH_SECRET`.
6. Click **Deploy** and wait two or three minutes. Vercel builds the app and prepares the database.
7. When it says **Congratulations**, click **Continue to Dashboard**. Your address is under **Domains**, for example `money-abc123.vercel.app`.

## 4. Create your admin account

1. Open your address. Because the book has no users yet, Money opens **Set up Money**.
2. **Setup code:** paste the secret from step 2.
3. Choose your display name, a username and a password, and click **Create admin account**. You are signed in and land on the dashboard.

The page only works while the book has no users: once your account exists, it sends everyone to the sign-in page.

## 5. Switch to a fork, so you can update

New versions of Money come out as [releases](https://github.com/mrghasemi1992/money/releases). Your copy gets them through a **fork**, a copy of the code that GitHub keeps linked to the original. The repository Vercel made in step 3 has no such link, so switch once, right away:

1. Open [github.com/mrghasemi1992/money/fork](https://github.com/mrghasemi1992/money/fork), keep the name `money` and click **Create fork**.
2. In Vercel, open your project → **Settings → Git**. Under **Connected Git Repository**, click **Disconnect**.
3. Click **Connect** (GitHub), choose your fork `money` and confirm. If the fork isn't listed, click **Adjust GitHub App Permissions**, allow Vercel to see the fork, then choose it.
4. Optional: delete the `money-setup` repository on GitHub (its **Settings → Danger Zone → Delete this repository**). Your app, database and settings stay in Vercel.

From now on, updating is one click: see [updating.md](updating.md).

## 6. Next steps

- **Currency:** an IRR (rial) book is the default. For dollars, euros or pounds, change it in **Settings → Book settings** before you record any amounts. It can't change once the book holds amounts.
- **Accounts and categories:** the dashboard walks you through your accounts, categories and first transaction.
- **Family members:** add them in **User management** (`/admin/users`), each with their own username and role. Make a second admin too: Money can't email a forgotten password, so another admin is how a password gets reset.
- **Claude or ChatGPT:** connect them in **Settings → Claude** (`/settings/connector`).
- **Your own domain:** add it in Vercel → **Settings → Domains**, then open **Deployments** and **Redeploy** the latest one, so Money uses the new address. Connect Claude again afterwards, with the new address.

## If something goes wrong

- **The deployment failed with “DATABASE_URL is not set”.** The database wasn't connected. In Vercel open the project → **Storage**, create a Neon database (or **Connect** an existing one) with the prefix `DATABASE`, then **Deployments → Redeploy**.
- **“The setup code is incorrect.”** It must be exactly the `BETTER_AUTH_SECRET` from step 3. If you lost it, set a new one in Vercel → **Settings → Environment Variables** (edit `BETTER_AUTH_SECRET`), then **Redeploy** and use the new one. Changing it is harmless before anyone has signed in.
- **The build log shows `NeonDbError: relation "oauth_resource" does not exist`.** This is harmless. Versions up to 0.4.0 logged it on a new copy's first build, before the database tables were created. The deployment still succeeds, and the build creates the tables right after.
- **The build log says something else.** Open the failed deployment in Vercel → **Building**; the last red lines say why. You can ask for help in the repository's [issues](https://github.com/mrghasemi1992/money/issues).
