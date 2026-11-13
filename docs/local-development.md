# Develop locally on a database branch

Local development never uses the real book. `pnpm dev`, `pnpm db:migrate`, `pnpm user:create` and anything else run on your machine read `.env.local`, which `vercel env pull` fills from the Vercel project's **Development** environment. Development points at a `dev` branch of the Neon database: a copy of production that you can change, break and reset. Production keeps the main branch, and every preview deployment still gets a branch of its own.

So a mistaken script, a migration you are trying out or a test that reaches the database changes the copy, not the book, and production's database password never lands on a development machine.

## Set it up once

1. **Make the branch.** In Vercel, open **Storage**, then the Neon database, then **Open in Neon**. Under **Branches**, create a branch named `dev` from `main`, with its current data (**Branch data and schema**, auto-delete **Never**).
   - **Give it its own password.** A child branch starts with its parent's role passwords, so `dev`'s connection string would carry production's password. Switch the branch menu at the top left to `dev`, open **Roles** and reset the role's password there. A reset applies to that branch only. Check that the menu says `dev` first: resetting it on `main` would cut production off until its variables were updated.
2. **Take Development off the integration.** The Neon integration gives its variables to every environment you connect it to, and it can't point one environment at another branch. In Vercel, open **Storage**, the database, **Projects**, your project, and choose **Remove Project Connection**. Then choose **Connect Project** for the same project and tick only **Preview** and **Production**. Set **Custom Prefix** to `DATABASE`, and under **Create database branch for deployment** tick **Preview**, as before.
   - Under **Settings → Environment Variables** the `DATABASE_*` variables now list Preview and Production only.
   - Redeploy the latest production deployment (**Deployments**, the latest production one, **⋯ → Redeploy**) and open the app once to make sure it still connects.
3. **Point Development at the branch.** In Neon, choose **Connect** with the `dev` branch selected and copy two connection strings: one with **Connection pooling** on, one with it off. In Vercel, under **Settings → Environment Variables**, add them for **Development** only: the pooled one as `DATABASE_URL`, the other as `DATABASE_URL_UNPOOLED`.
4. **Give Development its own secret.** In the project folder:

   ```bash
   vercel env rm BETTER_AUTH_SECRET development -y
   ```

   ```bash
   printf %s "$(openssl rand -base64 32)" | vercel env add BETTER_AUTH_SECRET development
   ```

5. **Clear the copied signing keys.** The branch copied production's keys for the Claude connector's tokens, and they are encrypted with production's secret. In Neon's **SQL Editor**, with the `dev` branch selected, run:

   ```sql
   delete from jwks;
   ```

   Better Auth makes a new key the first time the local app signs a token.

6. **Pull the variables:**

   ```bash
   vercel env pull .env.local
   ```

   The host in `DATABASE_URL` is now the `dev` branch's endpoint, not production's.

Sign in locally with your usual username and password: the branch copied the users. Local sessions from before the new secret are signed out.

## Fresh data

The branch keeps whatever you do to it. To start again from production's current data, open the `dev` branch in Neon and choose **Reset from parent**, then run `delete from jwks;` on it again (step 5). If the role's password comes back as production's after the reset, reset it again on `dev` and update the two Development variables (steps 1 and 3).

## Migrations

`pnpm db:migrate` migrates the `dev` branch. Each deployment migrates its own database: the main branch for production, its own branch for a preview (see [releases.md](releases.md)).
