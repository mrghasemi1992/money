# Run your own copy of Money

[فارسی](#fa)

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
- **The build log says something else.** Open the failed deployment in Vercel → **Building**; the last red lines say why. You can ask for help in the repository's [issues](https://github.com/mrghasemi1992/money/issues).

---

<a id="fa"></a>

<div dir="rtl" lang="fa">

## راه‌اندازی نسخهٔ خودتان از پول

هر شخص یا خانواده نسخهٔ خودش را از پول، روی حساب‌های رایگان خودش اجرا می‌کند. راه‌اندازی حدود ۱۵ دقیقه طول می‌کشد و ترمینال لازم ندارد: همه‌چیز در مرورگر انجام می‌شود.

### ۱. آنچه لازم دارید

- یک حساب [GitHub](https://github.com/signup). کد نسخهٔ شما آنجا نگه داشته می‌شود.
- یک حساب [Vercel](https://vercel.com/signup) با طرح رایگان **Hobby**. با حساب GitHub ثبت‌نام کنید. Vercel برنامه را اجرا می‌کند؛ طرح Hobby برای استفادهٔ شخصی و غیرتجاری است، که مجوز پول هم همین را اجازه می‌دهد.
- پایگاه داده از [Neon](https://neon.com) با طرح رایگان آن است. Vercel در مرحلهٔ ۳ آن را برایتان می‌سازد و ثبت‌نام جداگانه لازم نیست.

### ۲. ساختن رمز

پول برای محافظت از ورودها یک رمز تصادفی لازم دارد. همین رمز **کد راه‌اندازی** هم هست که یک بار، در مرحلهٔ ۴، برای ساختن حساب مدیر وارد می‌کنید.

۱. [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) را باز کنید. ۳۲ حرف و عدد تصادفی نشان می‌دهد و هر بار بارگذاری دوباره، رمز تازه‌ای می‌سازد.

۲. آن را کپی کنید و جای امنی نگه دارید، مثلاً در برنامهٔ مدیریت رمزهایتان. آن را به کسی ندهید.

### ۳. ساختن نسخه روی Vercel

۱. روی این دکمه بزنید:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmrghasemi1992%2Fmoney&project-name=money&repository-name=money-setup&env=BETTER_AUTH_SECRET&envDescription=A%20random%20secret%20of%20at%20least%2032%20characters.%20It%20is%20also%20the%20setup%20code%20for%20your%20first%20admin%20account%3A%20keep%20a%20copy.&envLink=https%3A%2F%2Fgithub.com%2Fmrghasemi1992%2Fmoney%2Fblob%2Fmain%2Fdocs%2Fself-hosting.md%232-make-a-secret&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%2C%22envVarPrefix%22%3A%22DATABASE%22%7D%5D)

۲. اگر خواست، با GitHub وارد Vercel شوید.

۳. **Create Git Repository:** نام `money-setup` را نگه دارید و **Create** را بزنید. این مخزن فقط برای همین انتشار اول است و در مرحلهٔ ۵ جایگزین می‌شود.

۴. **Add Products ← Neon:** روی **Add** بزنید، بعد:

- **Region:** همانی را که Vercel پیشنهاد می‌دهد نگه دارید (Washington, D.C., US East) تا پایگاه داده کنار برنامه باشد.
- **Plan:** Free.
- شرایط Neon را بپذیرید و **Create** را بزنید. اگر فرم پیشوند متغیرهای محیطی را نشان داد، همان `DATABASE` بماند.

۵. **Environment Variables:** رمز مرحلهٔ ۲ را در `BETTER_AUTH_SECRET` بچسبانید.

۶. **Deploy** را بزنید و دو سه دقیقه صبر کنید. Vercel برنامه را می‌سازد و پایگاه داده را آماده می‌کند.

۷. وقتی **Congratulations** را دیدید، **Continue to Dashboard** را بزنید. نشانی شما زیر **Domains** است، مثلاً `money-abc123.vercel.app`.

### ۴. ساختن حساب مدیر

۱. نشانی خود را باز کنید. چون دفتر هنوز کاربری ندارد، پول صفحهٔ **راه‌اندازی پول** را باز می‌کند.

۲. **کد راه‌اندازی:** رمز مرحلهٔ ۲ را بچسبانید.

۳. نام نمایشی، نام کاربری و رمز عبور را انتخاب کنید و **ساخت حساب مدیر** را بزنید. وارد می‌شوید و به داشبورد می‌روید.

این صفحه فقط تا وقتی دفتر کاربری ندارد کار می‌کند: بعد از ساخته شدن حساب شما، همه را به صفحهٔ ورود می‌فرستد.

### ۵. رفتن به fork، تا بتوانید به‌روزرسانی کنید

نسخه‌های تازهٔ پول در بخش [releases](https://github.com/mrghasemi1992/money/releases) منتشر می‌شوند. نسخهٔ شما آن‌ها را از راه یک **fork** می‌گیرد: نسخه‌ای از کد که GitHub آن را به مخزن اصلی پیوند می‌دهد. مخزنی که Vercel در مرحلهٔ ۳ ساخت چنین پیوندی ندارد، پس همین حالا یک بار جابه‌جا کنید:

۱. [github.com/mrghasemi1992/money/fork](https://github.com/mrghasemi1992/money/fork) را باز کنید، نام `money` را نگه دارید و **Create fork** را بزنید.

۲. در Vercel پروژهٔ خود را باز کنید ← **Settings ← Git**. زیر **Connected Git Repository** روی **Disconnect** بزنید.

۳. **Connect** (GitHub) را بزنید، fork خود یعنی `money` را انتخاب و تأیید کنید. اگر fork در فهرست نبود، **Adjust GitHub App Permissions** را بزنید، اجازهٔ دیدن fork را به Vercel بدهید و بعد انتخابش کنید.

۴. اختیاری: مخزن `money-setup` را در GitHub پاک کنید (در **Settings ← Danger Zone ← Delete this repository** همان مخزن). برنامه، پایگاه داده و تنظیمات شما در Vercel می‌مانند.

از این به بعد به‌روزرسانی با یک کلیک است: [updating.md](updating.md#fa) را ببینید.

### ۶. قدم‌های بعدی

- **ارز:** دفتر به‌طور پیش‌فرض ریالی است. برای دلار، یورو یا پوند، پیش از ثبت هر مبلغی در **تنظیمات ← تنظیمات دفتر** عوضش کنید. بعد از ثبت مبلغ دیگر عوض نمی‌شود.
- **حساب‌ها و دسته‌بندی‌ها:** داشبورد شما را قدم‌به‌قدم تا ساختن حساب‌ها، دسته‌بندی‌ها و اولین تراکنش می‌برد.
- **اعضای خانواده:** آن‌ها را در **مدیریت کاربران** (`/admin/users`) اضافه کنید، هر کدام با نام کاربری و نقش خودش. یک مدیر دوم هم بسازید: پول نمی‌تواند رمز فراموش‌شده را ایمیل کند، پس رمز را مدیر دیگری بازنشانی می‌کند.
- **Claude یا ChatGPT:** آن‌ها را در **تنظیمات ← Claude** (`/settings/connector`) وصل کنید.
- **دامنهٔ خودتان:** آن را در Vercel ← **Settings ← Domains** اضافه کنید، بعد در **Deployments** آخرین انتشار را **Redeploy** کنید تا پول نشانی تازه را به کار ببرد. بعد از آن Claude را با نشانی تازه دوباره وصل کنید.

### اگر مشکلی پیش آمد

- **انتشار با «DATABASE_URL is not set» شکست خورد.** پایگاه داده وصل نشده است. در Vercel پروژه را باز کنید ← **Storage**، یک پایگاه دادهٔ Neon با پیشوند `DATABASE` بسازید (یا یکی را **Connect** کنید)، بعد **Deployments ← Redeploy**.
- **«کد راه‌اندازی درست نیست.»** باید دقیقاً همان `BETTER_AUTH_SECRET` مرحلهٔ ۳ باشد. اگر گمش کرده‌اید، در Vercel ← **Settings ← Environment Variables** مقدار تازه‌ای برای `BETTER_AUTH_SECRET` بگذارید، **Redeploy** کنید و رمز تازه را به کار ببرید. پیش از اولین ورود، عوض کردنش بی‌خطر است.
- **گزارش ساخت چیز دیگری می‌گوید.** انتشار ناموفق را در Vercel باز کنید ← **Building**؛ آخرین خط‌های قرمز دلیلش را می‌گویند. می‌توانید در [issues](https://github.com/mrghasemi1992/money/issues) مخزن کمک بخواهید.

</div>
