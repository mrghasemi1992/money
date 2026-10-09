# Updating your copy of Money

[فارسی](#fa)

Every person or family runs their own copy of Money: a fork of [mrghasemi1992/money](https://github.com/mrghasemi1992/money) on GitHub, deployed on Vercel with a Neon database. New versions come out as [releases](https://github.com/mrghasemi1992/money/releases).

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
- **Your copy isn't a fork?** A copy made with a "Deploy" button or by uploading the code has no link back, so it can't be synced. Move it once: fork the repository on GitHub, then in Vercel open the project → **Settings → Git**, disconnect the old repository and connect your fork. The project keeps its domain, environment variables and database.
- **Going back.** Vercel's **Instant Rollback** returns to the previous deployment. Database updates stay, and they are written so the previous version still works with them, unless the release notes say otherwise.

---

<a id="fa"></a>

<div dir="rtl" lang="fa">

## به‌روزرسانی نسخهٔ شما از پول

هر شخص یا خانواده نسخهٔ خودش را از پول اجرا می‌کند: یک fork از [mrghasemi1992/money](https://github.com/mrghasemi1992/money) در GitHub که روی Vercel با پایگاه دادهٔ Neon منتشر شده است. نسخه‌های تازه در بخش [releases](https://github.com/mrghasemi1992/money/releases) منتشر می‌شوند.

### کدام نسخه را دارید

در **تنظیمات ← دربارهٔ پول** نسخه (و روی Vercel، کامیت) نمایش داده می‌شود. مدیرها وقتی نسخهٔ تازه‌ای منتشر شده باشد، همان‌جا پیامی با پیوند به تغییرات آن می‌بینند.

### به‌روزرسانی

۱. یادداشت‌های انتشار را بخوانید. اگر بخشی با عنوان **⚠ Breaking changes** دارد، اول مراحل آن را انجام دهید.

۲. در GitHub، fork خود را باز کنید و روی **Sync fork ← Update branch** بزنید.

۳. همین. Vercel کامیت تازه را می‌بیند و در چند دقیقه:
نسخهٔ تازه را می‌سازد، پایگاه داده را به‌روز می‌کند (migrationهای این نسخه) و دامنهٔ شما را به نسخهٔ تازه می‌برد.
اگر ساخت یا به‌روزرسانی پایگاه داده شکست بخورد، انتشار متوقف می‌شود: نسخهٔ قبلی کار می‌کند و پایگاه داده دست نمی‌خورد. دلیلش در گزارش ساخت (build log) همان انتشار در Vercel است.

۴. **تنظیمات** را دوباره باز کنید: نسخه، نسخهٔ تازه است.

جا انداختن چند نسخه اشکالی ندارد: همهٔ به‌روزرسانی‌هایی که پایگاه داده هنوز نگرفته، به ترتیب و در یک تراکنش اجرا می‌شوند. اگر نسخه‌ای اول به نسخهٔ دیگری نیاز داشته باشد، در یادداشت‌هایش نوشته می‌شود.

### خوب است بدانید

- **داده‌های شما در مخزن نیست.** دفتر در پایگاه دادهٔ Neon است و رمزها در متغیرهای محیطی Vercel. همگام کردن fork فقط کد را عوض می‌کند.
- **فایل‌های fork خود را تغییر ندهید.** در این صورت «Sync fork» نمی‌تواند بی‌دردسر ادغام کند. اگر GitHub از تداخل (conflict) خبر داد، **Discard commits** را انتخاب کنید: fork شما به کد منتشرشده برمی‌گردد و داده‌ها و تنظیماتتان می‌مانند.
- **نسخهٔ شما fork نیست؟** نسخه‌ای که با دکمهٔ «Deploy» یا با بارگذاری کد ساخته شده، به مخزن اصلی پیوندی ندارد و همگام نمی‌شود. یک بار جابه‌جایش کنید: در GitHub مخزن را fork کنید، بعد در Vercel پروژه را باز کنید ← **Settings ← Git**، مخزن قبلی را جدا (Disconnect) و fork خود را وصل کنید. دامنه، متغیرهای محیطی و پایگاه دادهٔ پروژه سر جایشان می‌مانند.
- **برگشت به نسخهٔ قبل.** **Instant Rollback** در Vercel به انتشار قبلی برمی‌گردد. به‌روزرسانی‌های پایگاه داده می‌مانند و طوری نوشته می‌شوند که نسخهٔ قبلی هم با آن‌ها کار کند، مگر یادداشت‌های انتشار چیز دیگری بگویند.

</div>
