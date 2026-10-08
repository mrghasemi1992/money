# Persian interface copy: review sheet

Every user-facing string of Money (پول), a personal accounting app with a Persian (RTL, default) and an English (LTR) interface. 697 strings, grouped by screen. Each row shows the key, the current Persian, the current English, and where the string appears.

Source files: `src/messages/fa.ts` (Persian, the source) and `src/messages/en.ts`.

---

## Prompt for ChatGPT

> You are a senior Persian UX writer. Below is all the interface copy of «پول», a personal accounting web app (household budget book shared by a few people: income, expenses, transfers between own accounts, budgets, reports, and a connection to the Claude AI assistant). The Persian copy reads like a translation. Rewrite it so it sounds natural, clear and consistent for Iranian users, the way a well-made Persian app (e.g. a good Iranian banking or fintech app) would say it.
>
> **Keep exactly:**
>
> - The keys. Return the same keys.
> - Placeholders in braces: `{name}`, `{amount}`, `{count}`, … Every placeholder in the original must stay, with the same name. Their values are already formatted (Persian digits, units such as «ریال»).
> - ICU syntax: `{countNumber, plural, other {…}}`, `{type, select, income {…} transfer {…} other {…}}`. You may rewrite the text inside the inner braces, but keep the structure and the option names (`income`, `expense`, `transfer`, `other`, `=0`, `true`, `thousand`, …).
> - Tags such as `<b>…</b>`, `<chip>…</chip>`, `<date></date>`, `<amount></amount>`, `<username></username>`, `<path>`, `<sep></sep>`: keep them and their content position. Text inside `<chip>` is the English label of Claude’s own interface and must stay in English.
> - «Claude» written in Latin letters. No emoji.
> - Length: similar or shorter. Many strings sit on buttons, badges and phone screens.
>
> **Free to change:** wording, tone, word choice, terminology. Current rules (you may suggest better ones): polite plural (شما); buttons are verbs that name the outcome («ثبت هزینه», never «تأیید»); cancel is «انصراف»; labels are nouns without a colon; error messages are one specific sentence ending with a period, no exclamation mark; toasts confirm in the past tense; «واگرد» is the undo button in toasts.
>
> Rows marked “screen-reader” are read aloud by screen readers and not shown on screen: they still need natural Persian.
>
> The examples in `connector.examples` are what a user might type to Claude: keep them casual, spoken Persian.
>
> **Please return:**
>
> 1. A short glossary: one Persian term per concept (transaction, account, category, subcategory, tag, note, description, archive, restore, delete vs. remove, undo, net, balance, starting balance, budget limit, unknown transaction, book, role names, URL, connector, theme, character (for length limits), password, reset), with the term you chose and why.
> 2. A table of only the strings you changed: `key | new Persian | short reason`. Use the full key (e.g. `transactions.form.submit`).
> 3. Any strings where the English should change too, if the meaning shifts.

---

## Inconsistencies already noticed

- **Ezafe after «ه»:** both «دستهٔ هزینه» (with «ٔ») and «دسته‌ی دیگری», «بازه‌ی دیگری», «همه‌ی ماه‌ها», «ماهانه‌ی» (with «‌ی») are used.
- **Category:** «دسته» and «دسته‌بندی» are used for the same thing («بدون دسته» in the list, «بدون دسته‌بندی» in reports).
- **Unknown transactions:** «ناشناس», «شناسایی نشده» and «تراکنش ناشناس» are mixed.
- **Retry:** «تلاش دوباره», «دوباره تلاش کنید» and «دوباره امتحان کنید».
- **Added:** «ثبت شد», «افزوده شد» and «ساخته شد» for similar actions.
- **Delete vs. remove:** «حذف» is used for both (deleting a transaction for ever, removing a budget limit, removing a filter or tag).
- **Empty-state titles:** some end without a verb («در {month} تراکنشی ثبت نشده»), others with «است» («هنوز چیزی ثبت نشده است»).
- **This month:** «این ماه» and «ماه جاری».
- **Budget:** the menu says «بودجه», headings say «بودجه‌ها».
- `connector.apps.role.editor` and `connector.apps.role.admin` have the same text.
- Three keys appear unused in the code (`transactions.monthSwitcher`, `transactions.loadingMore`, `transactions.list.dayNet`); they can be skipped.

---

## The strings

## Shared and basics

### `metadata`

**Where:** App name and description: the browser tab title («تراکنش‌ها | پول»), the logo wordmark, and the Claude consent page.

| Key           | فارسی         | English             | Where / what                                                           |
| ------------- | ------------- | ------------------- | ---------------------------------------------------------------------- |
| `appName`     | پول           | Money               | Brand wordmark next to the logo and suffix of every browser tab title. |
| `description` | حسابداری شخصی | Personal accounting | HTML meta description (search engines, link previews).                 |

### `common`

**Where:** Shared words used by many components: dialog and sheet close buttons, cancel buttons, search fields, selects, tags, toasts.

| Key                | فارسی                                                            | English                                                                                              | Where / what                                                             |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `close`            | بستن                                                             | Close                                                                                                | Close (×) button of dialogs and sheets; screen-reader label.             |
| `cancel`           | انصراف                                                           | Cancel                                                                                               | Cancel button of every form and confirmation.                            |
| `optional`         | (اختیاری)                                                        | (optional)                                                                                           | Added after an optional field's label.                                   |
| `search`           | جستجو                                                            | Search                                                                                               | Default label of search fields.                                          |
| `clear`            | پاک کردن                                                         | Clear                                                                                                | × button inside a search field / date field to clear it.                 |
| `remove`           | حذف                                                              | Remove                                                                                               | × on a tag chip (screen-reader label).                                   |
| `choose`           | انتخاب کنید                                                      | Choose                                                                                               | Placeholder of a select with nothing chosen.                             |
| `showOptions`      | نمایش گزینه‌ها                                                   | Show options                                                                                         | Screen-reader label of the arrow button that opens a select / combobox.  |
| `count`            | `{count} از {max}`                                               | `{count} of {max}`                                                                                   | Character counter under text fields («۱۲ از ۲۰۰»).                       |
| `today`            | امروز                                                            | Today                                                                                                | Today, in day headings of lists and on the date picker's «today» button. |
| `yesterday`        | دیروز                                                            | Yesterday                                                                                            | Yesterday, in day headings of lists.                                     |
| `undo`             | واگرد                                                            | Undo                                                                                                 | Button in toasts after adding / deleting something.                      |
| `viewOnly`         | فقط مشاهده                                                       | View only                                                                                            | Badge in page headers for viewers (read-only role).                      |
| `listSeparator`    | ،                                                                | ,                                                                                                    | Separator when joining a list of names (not a sentence).                 |
| `transactionCount` | `{countNumber, plural, =0 {بدون تراکنش} other {{count} تراکنش}}` | `{countNumber, plural, =0 {No transactions} one {{count} transaction} other {{count} transactions}}` | Number of transactions of an account or category in lists.               |

### `transactionType`

**Where:** The three transaction types. Used as the type switch in the transaction form, in the transaction detail, in summaries (income / expense cards) and chart legends.

| Key        | فارسی  | English  | Where / what        |
| ---------- | ------ | -------- | ------------------- |
| `income`   | درآمد  | Income   | Option (see group). |
| `expense`  | هزینه  | Expense  | Option (see group). |
| `transfer` | انتقال | Transfer | Option (see group). |

### `role`

**Where:** User role names. Shown in the user menu, the user list, the new-user and change-role dialogs, and the Claude consent page.

| Key      | فارسی    | English | Where / what        |
| -------- | -------- | ------- | ------------------- |
| `admin`  | مدیر     | Admin   | Option (see group). |
| `editor` | ویرایشگر | Editor  | Option (see group). |
| `viewer` | بیننده   | Viewer  | Option (see group). |

### `categoryColor`

**Where:** Names of the category color swatches (the color picker in the category form). Only read aloud by screen readers and shown as tooltips; the swatch itself is the color.

| Key      | فارسی      | English  | Where / what        |
| -------- | ---------- | -------- | ------------------- |
| `red`    | قرمز       | Red      | Option (see group). |
| `orange` | نارنجی     | Orange   | Option (see group). |
| `amber`  | کهربایی    | Amber    | Option (see group). |
| `lime`   | لیمویی     | Lime     | Option (see group). |
| `green`  | سبز        | Green    | Option (see group). |
| `teal`   | سبزآبی     | Teal     | Option (see group). |
| `sky`    | آبی آسمانی | Sky blue | Option (see group). |
| `violet` | بنفش       | Violet   | Option (see group). |
| `pink`   | صورتی      | Pink     | Option (see group). |
| `brown`  | قهوه‌ای    | Brown    | Option (see group). |
| `slate`  | خاکستری    | Gray     | Option (see group). |

### `calendar`

**Where:** The date picker and month switcher (the «‹ مهر ۱۴۰۵ ›» control on transactions and budgets). Mostly icon-button labels for screen readers.

| Key             | فارسی        | English        | Where / what                                   |
| --------------- | ------------ | -------------- | ---------------------------------------------- |
| `previousMonth` | ماه قبل      | Previous month | Screen-reader label of the ‹ button.           |
| `nextMonth`     | ماه بعد      | Next month     | Screen-reader label of the › button.           |
| `pickDate`      | انتخاب تاریخ | Pick a date    | Screen-reader label of the date picker button. |

### `amountField`

**Where:** Amount input: a quiet line under the field showing the typed amount in words/units.

| Key          | فارسی            | English           | Where / what                                                   |
| ------------ | ---------------- | ----------------- | -------------------------------------------------------------- |
| `equivalent` | `معادل {amount}` | `Equals {amount}` | Under an amount field, e.g. the rial value when typing tomans. |

### `combobox`

**Where:** The searchable category picker (default texts).

| Key           | فارسی                        | English                     | Where / what                   |
| ------------- | ---------------------------- | --------------------------- | ------------------------------ |
| `placeholder` | جستجوی دسته‌بندی             | Search categories           | Placeholder of the search box. |
| `empty`       | دسته‌ای با این نام پیدا نشد. | No category with this name. | Search found nothing.          |

### `budget`

**Where:** The budget progress bar (dashboard, budgets page): status line under each bar.

| Key      | فارسی                          | English                         | Where / what                                              |
| -------- | ------------------------------ | ------------------------------- | --------------------------------------------------------- |
| `over`   | `{amount} بیش از بودجه`        | `{amount} over budget`          | Status under a budget bar when spending passed the limit. |
| `near`   | `نزدیک به سقف، {amount} مانده` | `Near the limit, {amount} left` | Status when 80%+ of the limit is used.                    |
| `left`   | `{amount} مانده`               | `{amount} left`                 | Status when under the limit.                              |
| `values` | `{value} از {max}`             | `{value} of {max}`              | Spent of limit, next to the bar («۲٬۰۰۰ از ۵٬۰۰۰»).       |
| `meter`  | `{percent}، {status}`          | `{percent}, {status}`           | Screen-reader text of the bar: percent + status.          |

## Preferences

### `preferences`

**Where:** Settings → Display section, the book currency section (admins), and the user menu's theme switch.

| Key        | فارسی | English  | Where / what                  |
| ---------- | ----- | -------- | ----------------------------- |
| `language` | زبان  | Language | Label of the language choice. |
| `calendar` | تقویم | Calendar | Label of the calendar choice. |

### `preferences.calendars`

**Where:** Calendar choice in Settings → Display.

| Key         | فارسی  | English              | Where / what        |
| ----------- | ------ | -------------------- | ------------------- |
| `jalali`    | شمسی   | Solar Hijri (Jalali) | Option (see group). |
| `gregorian` | میلادی | Gregorian            | Option (see group). |

### `preferences`

**Where:** Settings → Display section, the book currency section (admins), and the user menu's theme switch.

| Key        | فارسی    | English  | Where / what                       |
| ---------- | -------- | -------- | ---------------------------------- |
| `currency` | واحد پول | Currency | Label of the book currency choice. |

### `preferences.currencies`

**Where:** Book currency choice in Settings → Book settings (admins only).

| Key   | فارسی         | English       | Where / what        |
| ----- | ------------- | ------------- | ------------------- |
| `IRR` | ریال ایران    | Iranian rial  | Option (see group). |
| `USD` | دلار آمریکا   | US dollar     | Option (see group). |
| `EUR` | یورو          | Euro          | Option (see group). |
| `GBP` | پوند بریتانیا | British pound | Option (see group). |

### `preferences`

**Where:** Settings → Display section, the book currency section (admins), and the user menu's theme switch.

| Key        | فارسی         | English         | Where / what                      |
| ---------- | ------------- | --------------- | --------------------------------- |
| `rialUnit` | نمایش مبلغ‌ها | Show amounts in | Label of the rial / toman choice. |

### `preferences.rialUnits`

**Where:** Rial or toman choice in Settings → Display (IRR books only).

| Key     | فارسی | English | Where / what        |
| ------- | ----- | ------- | ------------------- |
| `rial`  | ریال  | Rial    | Option (see group). |
| `toman` | تومان | Toman   | Option (see group). |

### `preferences`

**Where:** Settings → Display section, the book currency section (admins), and the user menu's theme switch.

| Key     | فارسی | English | Where / what               |
| ------- | ----- | ------- | -------------------------- |
| `theme` | تم    | Theme   | Label of the theme choice. |

### `preferences.themes`

**Where:** Theme choice in Settings → Display and in the user menu.

| Key      | فارسی | English | Where / what                                        |
| -------- | ----- | ------- | --------------------------------------------------- |
| `light`  | روشن  | Light   | Option (see group).                                 |
| `dark`   | تیره  | Dark    | Option (see group).                                 |
| `system` | سیستم | System  | Follow the operating system's light / dark setting. |

## Sign-in

### `login`

**Where:** The sign-in page (/login).

| Key               | فارسی                                                                            | English                                                       | Where / what                                                |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| `title`           | ورود به پول                                                                      | Sign in to Money                                              | Heading of the sign-in card.                                |
| `username`        | نام کاربری                                                                       | Username                                                      | Field label.                                                |
| `usernameMissing` | نام کاربری را وارد کنید.                                                         | Enter your username.                                          | Error when username is empty.                               |
| `password`        | رمز عبور                                                                         | Password                                                      | Field label.                                                |
| `passwordMissing` | رمز عبور را وارد کنید.                                                           | Enter your password.                                          | Error when password is empty.                               |
| `showPassword`    | نمایش رمز عبور                                                                   | Show password                                                 | Eye button label in the password field.                     |
| `submit`          | ورود                                                                             | Sign in                                                       | Sign-in button.                                             |
| `note`            | ایجاد حساب کاربری فقط توسط مدیر امکان‌پذیر است؛ برای دسترسی با مدیر هماهنگ کنید. | Only an admin can create accounts. Ask your admin for access. | Note under the form: there is no sign-up.                   |
| `retryIn`         | دوباره امتحان کنید پس از                                                         | Try again in                                                  | Before a countdown when sign-in is rate-limited («… ۴:۵۹»). |

### `login.alerts`

**Where:** Alert box above the sign-in form after a failed or successful attempt.

| Key        | فارسی                                                                         | English                                                                                       | Where / what                          |
| ---------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- |
| `wrong`    | نام کاربری یا رمز عبور درست نیست.                                             | The username or password is incorrect.                                                        | Wrong username or password.           |
| `disabled` | این حساب غیرفعال شده است. برای فعال‌سازی با مدیر تماس بگیرید.                 | This account has been disabled. Contact your admin to turn it back on.                        | The account was disabled by an admin. |
| `locked`   | چند بار پشت سر هم ورود ناموفق بود. برای امنیت حساب، ورود موقتاً بسته شده است. | Sign-in failed several times in a row. To protect the account, sign-in is paused for a while. | After 5 failed attempts in 5 minutes. |
| `failed`   | ورود انجام نشد. اتصال اینترنت را بررسی کنید و دوباره امتحان کنید.             | Couldn’t sign in. Check your internet connection and try again.                               | Network or server error.              |
| `success`  | وارد شدید.                                                                    | Signed in.                                                                                    | Brief message before redirecting.     |

### `login.oauth`

**Where:** The sign-in page when Claude sent the user there to connect (OAuth).

| Key        | فارسی                                                                                            | English                                                                                                            | Where / what                                      |
| ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `subtitle` | `برای اتصال {client} ابتدا وارد شوید.`                                                           | `Sign in first to connect {client}.`                                                                               | Under the heading when Claude sent the user here. |
| `context`  | `{client} درخواست اتصال به حساب پول شما را دارد. بعد از ورود به صفحهٔ اجازهٔ دسترسی برمی‌گردید.` | `{client} is asking to connect to your Money account. You’ll come back to the permission screen after signing in.` | Explanation box: Claude asked to connect.         |
| `submit`   | ورود و ادامه                                                                                     | Sign in and continue                                                                                               | Sign-in button in this case.                      |

## App frame

### `nav`

**Where:** Section names: the desktop sidebar, the phone tab bar, the page title (h1) of each page and the browser tab title.

| Key            | فارسی          | English         | Where / what                                                     |
| -------------- | -------------- | --------------- | ---------------------------------------------------------------- |
| `dashboard`    | داشبورد        | Dashboard       | Section name.                                                    |
| `transactions` | تراکنش‌ها      | Transactions    | Section name.                                                    |
| `budgets`      | بودجه          | Budget          | Note: singular «بودجه» in the menu, plural «بودجه‌ها» elsewhere. |
| `reports`      | گزارش‌ها       | Reports         | Section name.                                                    |
| `settings`     | تنظیمات        | Settings        | Section name.                                                    |
| `users`        | مدیریت کاربران | User management | Admins only.                                                     |

### `shell`

**Where:** The app frame: sidebar, phone top bar and tab bar, user menu. Several are screen-reader-only labels.

| Key             | فارسی               | English              | Where / what                                         |
| --------------- | ------------------- | -------------------- | ---------------------------------------------------- |
| `skipToContent` | رفتن به محتوای اصلی | Skip to main content | Keyboard-only link at the top of every page.         |
| `menu`          | منوی اصلی           | Main menu            | Screen-reader label of the main navigation.          |
| `sections`      | بخش‌ها              | Sections             | Screen-reader label of the section list.             |
| `account`       | حساب کاربری         | Account              | Label of the user menu button (avatar).              |
| `collapse`      | جمع کردن منو        | Collapse menu        | Button that collapses the sidebar into an icon rail. |
| `expand`        | باز کردن منو        | Expand menu          | Button that expands the sidebar again.               |
| `back`          | بازگشت              | Back                 | Back button in the phone top bar on subpages.        |
| `signOut`       | خروج                | Sign out             | Sign-out item in the user menu.                      |

### `addTransaction`

**Where:** The «add transaction» button in page headers (desktop) and the floating + button on the phone tab bar.

| Key     | فارسی         | English         | Where / what                          |
| ------- | ------------- | --------------- | ------------------------------------- |
| `title` | افزودن تراکنش | Add transaction | Header button and the form's trigger. |
| `short` | افزودن        | Add             | Short version on narrow buttons.      |

### `page`

**Where:** Generic page states.

| Key       | فارسی           | English | Where / what                                       |
| --------- | --------------- | ------- | -------------------------------------------------- |
| `loading` | در حال بارگذاری | Loading | Screen-reader text while a page skeleton is shown. |

### `page.error`

**Where:** Full-page error state when a page fails to load (with a retry button).

| Key           | فارسی                                                                          | English                                                                | Where / what  |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------- |
| `title`       | مشکلی پیش آمد                                                                  | Something went wrong                                                   | Heading.      |
| `description` | اطلاعات این صفحه بارگذاری نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. | This page couldn’t load. Check your internet connection and try again. | Body text.    |
| `retry`       | تلاش دوباره                                                                    | Try again                                                              | Retry button. |

### `page.notFound`

**Where:** The 404 page for unknown addresses.

| Key           | فارسی                                                  | English                                                 | Where / what                      |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------- | --------------------------------- |
| `eyebrow`     | خطای ۴۰۴                                               | Error 404                                               | Small line above the 404 heading. |
| `title`       | صفحه پیدا نشد                                          | Page not found                                          | Heading.                          |
| `description` | صفحه‌ای که دنبالش هستید وجود ندارد یا جابه‌جا شده است. | The page you’re looking for doesn’t exist or has moved. | Body text.                        |
| `backHome`    | بازگشت به داشبورد                                      | Back to dashboard                                       | Button on the 404 page.           |

## Dashboard

### `dashboard`

**Where:** The dashboard (/), the home page.

| Key        | فارسی               | English           | Where / what                                                                     |
| ---------- | ------------------- | ----------------- | -------------------------------------------------------------------------------- |
| `greeting` | `سلام، {name}`      | `Hello, {name}`   | Page heading of the dashboard with the user's first name; today's date under it. |
| `welcome`  | `خوش آمدید، {name}` | `Welcome, {name}` | Heading of the first-run dashboard (empty book).                                 |
| `all`      | همه                 | All               | Generic «see all» link label.                                                    |

### `dashboard.unknown`

**Where:** Notice at the top of the dashboard when the book has transactions with no description («؟»).

| Key           | فارسی                                                                                     | English                                                                                                                     | Where / what                                      |
| ------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `title`       | `{countNumber, plural, other {{count} تراکنش ناشناس دارید}}`                              | `{countNumber, plural, one {You have {count} unidentified transaction} other {You have {count} unidentified transactions}}` | Notice heading with the count.                    |
| `description` | هنوز معلوم نیست این تراکنش‌ها بابت چه بوده‌اند. شناسایی‌شان کنید تا گزارش‌ها دقیق بمانند. | It isn’t clear yet what they were for. Identify them to keep your reports accurate.                                         | Body text.                                        |
| `action`      | بررسی تراکنش‌ها                                                                           | Review transactions                                                                                                         | Button linking to the filtered transactions list. |

### `dashboard.balances`

**Where:** The big blue card on the dashboard: total of all accounts plus a tile per account.

| Key        | فارسی                                         | English                                                                 | Where / what                                     |
| ---------- | --------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| `title`    | موجودی همه حساب‌ها                            | Total balance, all accounts                                             | Label above the big total.                       |
| `count`    | `{countNumber, plural, other {{count} حساب}}` | `{countNumber, plural, one {{count} account} other {{count} accounts}}` | Number of accounts under the total.              |
| `accounts` | موجودی هر حساب                                | Balance of each account                                                 | Screen-reader label of the row of account tiles. |

### `dashboard.month`

**Where:** Dashboard card with this month's income, expense and net.

| Key        | فارسی               | English            | Where / what          |
| ---------- | ------------------- | ------------------ | --------------------- |
| `title`    | این ماه             | This month         | Heading.              |
| `subtitle` | `{month}، تا امروز` | `{month}, to date` | Month name, to date.  |
| `net`      | خالص                | Net                | Income minus expense. |

### `dashboard.recent`

**Where:** Dashboard card with the last 8 transactions.

| Key     | فارسی           | English             | Where / what           |
| ------- | --------------- | ------------------- | ---------------------- |
| `title` | تراکنش‌های اخیر | Recent transactions | Heading.               |
| `all`   | همه تراکنش‌ها   | All transactions    | Link to /transactions. |

### `dashboard.budgets`

**Where:** Dashboard card with the 4 budgets closest to (or over) their limit.

| Key        | فارسی                                       | English                       | Where / what                                 |
| ---------- | ------------------------------------------- | ----------------------------- | -------------------------------------------- |
| `title`    | بودجه‌ها                                    | Budgets                       | Heading.                                     |
| `subtitle` | نزدیک یا بیش از سقف                         | Closest to their limit        | Under the card title.                        |
| `all`      | همه بودجه‌ها                                | All budgets                   | Link to /budgets.                            |
| `empty`    | هنوز برای هیچ دسته‌ای بودجه تعیین نشده است. | No category has a budget yet. | When no budget exists.                       |
| `set`      | تعیین بودجه                                 | Set a budget                  | Button (writers only) when no budget exists. |

### `dashboard.spending`

**Where:** Dashboard card with this month's top spending categories (one stacked bar + list).

| Key           | فارسی                               | English                                        | Where / what                               |
| ------------- | ----------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| `title`       | بیشترین هزینه‌ها                    | Top spending                                   | Heading.                                   |
| `report`      | گزارش کامل                          | Full report                                    | Link to the month's report.                |
| `reportLabel` | `گزارش کامل {month}`                | `Full report for {month}`                      | Screen-reader version of that link.        |
| `chart`       | `سهم هر دسته از هزینه‌های {month}`  | `Each category’s share of spending in {month}` | Screen-reader label of the stacked bar.    |
| `other`       | سایر                                | Other                                          | The 5th slice: everything after the top 4. |
| `total`       | جمع هزینه‌ها                        | Total expenses                                 | Label of the month's total expense.        |
| `empty`       | این ماه هنوز هزینه‌ای ثبت نشده است. | No expenses recorded this month yet.           | When there are no expenses this month.     |

### `dashboard.setup`

**Where:** First-run dashboard for an empty book: a 4-step setup checklist (editors and admins).

| Key        | فارسی                           | English                                  | Where / what                        |
| ---------- | ------------------------------- | ---------------------------------------- | ----------------------------------- |
| `title`    | دفترتان را راه بیندازید         | Set up your book                         | Heading.                            |
| `subtitle` | چهار قدم تا اولین گزارش ماهانه. | Four steps to your first monthly report. | Under the checklist heading.        |
| `progress` | `{done} از {total} انجام شده`   | `{done} of {total} done`                 | Progress line («۲ از ۴ انجام شده»). |
| `done`     | انجام شد                        | Done                                     | Badge on a completed step.          |

### `dashboard.setup.steps.accounts`

**Where:** Setup step 1: add accounts (links to Settings → Accounts).

| Key           | فارسی                                                               | English                                                   | Where / what |
| ------------- | ------------------------------------------------------------------- | --------------------------------------------------------- | ------------ |
| `title`       | حساب‌ها را اضافه کنید                                               | Add your accounts                                         | Heading.     |
| `description` | حساب‌های بانکی، کارت و کیف پول نقدی را با موجودی امروزشان ثبت کنید. | Bank accounts, cards and cash, each with today’s balance. | Body text.   |
| `action`      | افزودن حساب                                                         | Add account                                               | Step button. |

### `dashboard.setup.steps.categories`

**Where:** Setup step 2: add categories (links to Settings → Categories).

| Key           | فارسی                                                        | English                                                     | Where / what |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | ------------ |
| `title`       | دسته‌بندی‌ها را تنظیم کنید                                   | Set up categories                                           | Heading.     |
| `description` | دسته‌های هزینه و درآمد را بسازید تا گزارش‌ها معنا پیدا کنند. | Create expense and income categories so reports make sense. | Body text.   |
| `action`      | افزودن دسته‌بندی                                             | Add category                                                | Step button. |

### `dashboard.setup.steps.transaction`

**Where:** Setup step 3: record the first transaction (opens the add form).

| Key            | فارسی                               | English                           | Where / what                                    |
| -------------- | ----------------------------------- | --------------------------------- | ----------------------------------------------- |
| `title`        | اولین تراکنش را ثبت کنید            | Record a first transaction        | Heading.                                        |
| `description`  | یک هزینه یا درآمد اخیر را ثبت کنید. | Enter a recent expense or income. | Body text.                                      |
| `action`       | ثبت تراکنش                          | Add transaction                   | Step button.                                    |
| `needsAccount` | اول یک حساب اضافه کنید.             | Add an account first.             | Why step 3 is blocked before an account exists. |

### `dashboard.setup.steps.claude`

**Where:** Setup step 4: connect Claude (links to Settings → Claude connector).

| Key           | فارسی                                                      | English                                            | Where / what |
| ------------- | ---------------------------------------------------------- | -------------------------------------------------- | ------------ |
| `title`       | Claude را وصل کنید                                         | Connect Claude                                     | Heading.     |
| `description` | به Claude بگویید چه خرج کرده‌اید؛ تراکنش اینجا ثبت می‌شود. | Tell Claude what you spent and it’s recorded here. | Body text.   |
| `action`      | اتصال Claude                                               | Connect Claude                                     | Step button. |

### `dashboard.viewer`

**Where:** First-run dashboard for a viewer (read-only user) when the book is empty.

| Key           | فارسی                                                                                    | English                                                                             | Where / what |
| ------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| `title`       | هنوز چیزی ثبت نشده است                                                                   | Nothing has been recorded yet                                                       | Heading.     |
| `description` | وقتی ویرایشگر یا مدیر این دفتر حساب و تراکنشی ثبت کند، خلاصه‌اش اینجا نمایش داده می‌شود. | When an editor or admin adds accounts and transactions, a summary will appear here. | Body text.   |

## Transactions

### `transactions`

**Where:** The transactions page (/transactions).

| Key             | فارسی                                                            | English                                                                                              | Where / what                                     |
| --------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `net`           | خالص                                                             | Net                                                                                                  | Net of the period in the summary.                |
| `monthSwitcher` | ماه                                                              | Month                                                                                                | Appears unused in the code (no reference found). |
| `count`         | `{countNumber, plural, =0 {بدون تراکنش} other {{count} تراکنش}}` | `{countNumber, plural, =0 {No transactions} one {{count} transaction} other {{count} transactions}}` | Count of transactions in the period summary.     |
| `loadMore`      | نمایش بیشتر                                                      | Show more                                                                                            | Button at the end of the list (50 per page).     |
| `loadingMore`   | در حال بارگذاری تراکنش‌های بیشتر                                 | Loading more transactions                                                                            | Appears unused in the code (no reference found). |

### `transactions.filters`

**Where:** The filter bar and filter panel on the transactions page.

| Key             | فارسی                                 | English                                     | Where / what                                                       |
| --------------- | ------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `button`        | فیلترها                               | Filters                                     | Button that opens the filter panel.                                |
| `buttonCount`   | `فیلترها ({count})`                   | `Filters ({count})`                         | Same with the number of active filters.                            |
| `panel`         | فیلترهای تراکنش                       | Transaction filters                         | Title of the filter panel (sheet on phones).                       |
| `search`        | جستجو در توضیح، یادداشت، دسته و برچسب | Search description, note, category and tags | Placeholder of the search field.                                   |
| `from`          | از تاریخ                              | From                                        | Field label in the filter panel.                                   |
| `to`            | تا تاریخ                              | To                                          | Field label in the filter panel.                                   |
| `anyDate`       | هر تاریخی                             | Any date                                    | Placeholder of the date fields.                                    |
| `type`          | نوع                                   | Type                                        | Field label in the filter panel.                                   |
| `account`       | حساب                                  | Account                                     | Field label in the filter panel.                                   |
| `category`      | دسته‌بندی                             | Category                                    | Field label in the filter panel.                                   |
| `tag`           | برچسب                                 | Tag                                         | Field label in the filter panel.                                   |
| `unknownOnly`   | فقط تراکنش‌های ناشناس                 | Unknown transactions only                   | Checkbox: show only transactions with no description.              |
| `allAccounts`   | همه حساب‌ها                           | All accounts                                | The «all» option of a filter.                                      |
| `allCategories` | همه دسته‌ها                           | All categories                              | The «all» option of a filter.                                      |
| `allOfCategory` | همه                                   | All                                         | Option «all» inside a category (category + all its subcategories). |
| `allTags`       | همه برچسب‌ها                          | All tags                                    | The «all» option of a filter.                                      |
| `clearAll`      | پاک کردن همه                          | Clear all                                   | Removes every filter.                                              |
| `remove`        | حذف فیلتر                             | Remove filter                               | Screen-reader label of a chip's ×.                                 |

### `transactions.filters.chips`

**Where:** Removable chips under the filter bar showing each active filter.

| Key        | فارسی            | English            | Where / what                       |
| ---------- | ---------------- | ------------------ | ---------------------------------- |
| `range`    | `{from} تا {to}` | `{from} – {to}`    | Filter chip.                       |
| `from`     | `از {date}`      | `From {date}`      | Filter chip.                       |
| `to`       | `تا {date}`      | `Until {date}`     | Filter chip.                       |
| `account`  | `حساب: {name}`   | `Account: {name}`  | Filter chip.                       |
| `category` | `دسته: {name}`   | `Category: {name}` | Filter chip.                       |
| `tag`      | `برچسب: {name}`  | `Tag: {name}`      | Filter chip.                       |
| `search`   | `«{text}»`       | `“{text}”`         | Chip of the search text.           |
| `unknown`  | ناشناس           | Unknown            | Chip of the «unknown only» filter. |

### `transactions.list`

**Where:** The transaction list (grouped by day), also the dashboard's recent list. Column headers appear on wide screens.

| Key                  | فارسی                       | English                     | Where / what                                                          |
| -------------------- | --------------------------- | --------------------------- | --------------------------------------------------------------------- |
| `label`              | تراکنش‌ها                   | Transactions                | Screen-reader label of the list.                                      |
| `description`        | توضیح                       | Description                 | Body text.                                                            |
| `category`           | دسته‌بندی                   | Category                    | Column header / row text.                                             |
| `categoryAndAccount` | دسته‌بندی و حساب            | Category & account          | Column header on medium widths.                                       |
| `account`            | حساب                        | Account                     | Column header / row text.                                             |
| `amount`             | مبلغ                        | Amount                      | Column header / row text.                                             |
| `unknown`            | ناشناس                      | Unknown                     | Small badge next to «؟» on a row without description.                 |
| `unknownDescription` | تراکنش ناشناس               | Unknown transaction         | Screen-reader text for «؟».                                           |
| `noCategory`         | بدون دسته                   | No category                 | In place of the category chip.                                        |
| `claudeTip`          | ثبت‌شده با Claude           | Added by Claude             | Tooltip of the Claude badge on rows added through Claude.             |
| `route`              | `{from} ← {to}`             | `{from} → {to}`             | A transfer's route: «رسالت ← بلو». Arrow points in reading direction. |
| `edit`               | ویرایش                      | Edit                        | Column header / row text.                                             |
| `delete`             | حذف                         | Delete                      | Column header / row text.                                             |
| `dayHeading`         | `<b>{relative}</b>، {date}` | `<b>{relative}</b>, {date}` | Day heading: <b> part is «امروز» / «دیروز» / weekday, then the date.  |
| `dayNet`             | خالص روز                    | Day’s net                   | Appears unused in the code (no reference found).                      |

### `transactions.empty`

**Where:** Empty states of the transactions list.

| Key                      | فارسی                                                     | English                                                     | Where / what                            |
| ------------------------ | --------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| `monthTitle`             | `در {month} تراکنشی ثبت نشده`                             | `No transactions in {month}`                                | No transactions in the selected month.  |
| `monthDescription`       | تراکنش‌های این ماه اینجا نمایش داده می‌شوند.              | Transactions for this month will appear here.               | Body text.                              |
| `rangeTitle`             | در این بازه تراکنشی ثبت نشده                              | No transactions in this date range                          | No transactions in a custom date range. |
| `rangeDescription`       | بازه‌ی دیگری انتخاب کنید یا آن را پاک کنید.               | Pick another range or clear it.                             | Body text.                              |
| `noResultsTitle`         | تراکنشی با این فیلترها پیدا نشد                           | No transactions match these filters                         | Filters match nothing.                  |
| `noResultsDescription`   | فیلترها را تغییر دهید یا پاک کنید.                        | Change or clear the filters.                                | Body text.                              |
| `clearFilters`           | پاک کردن فیلترها                                          | Clear filters                                               | Button that clears the filters.         |
| `firstTitle`             | هنوز تراکنشی ثبت نشده                                     | No transactions yet                                         | Book has no transactions at all.        |
| `firstDescription`       | اولین هزینه یا درآمدتان را ثبت کنید.                      | Add your first expense or income.                           | Body text.                              |
| `firstViewerDescription` | وقتی ویرایشگر یا مدیر تراکنشی ثبت کند، اینجا دیده می‌شود. | Transactions appear here once an editor or admin adds them. | Same, for viewers.                      |

### `transactions.form`

**Where:** The add / edit transaction form (dialog on desktop, bottom sheet on phones).

| Key                      | فارسی                                                                                               | English                                                                                                      | Where / what                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `newTitle`               | تراکنش جدید                                                                                         | New transaction                                                                                              | Dialog title when adding.                                |
| `editTitle`              | ویرایش تراکنش                                                                                       | Edit transaction                                                                                             | Dialog title when editing.                               |
| `type`                   | نوع                                                                                                 | Type                                                                                                         | Field label.                                             |
| `amount`                 | مبلغ                                                                                                | Amount                                                                                                       | Field label.                                             |
| `date`                   | تاریخ                                                                                               | Date                                                                                                         | Field label.                                             |
| `account`                | حساب                                                                                                | Account                                                                                                      | Account (income / expense).                              |
| `fromAccount`            | از حساب                                                                                             | From account                                                                                                 | Source account (transfer).                               |
| `toAccount`              | به حساب                                                                                             | To account                                                                                                   | Destination account (transfer).                          |
| `chooseAccount`          | انتخاب حساب                                                                                         | Choose account                                                                                               | Placeholder of the account select.                       |
| `category`               | دسته‌بندی                                                                                           | Category                                                                                                     | Field label.                                             |
| `categoryPlaceholder`    | جستجوی دسته‌بندی                                                                                    | Search categories                                                                                            | Placeholder of the category search.                      |
| `categoryEmpty`          | دسته‌ای با این نام پیدا نشد.                                                                        | No category with that name.                                                                                  | Category search found nothing.                           |
| `wholeCategory`          | بدون زیردسته                                                                                        | No subcategory                                                                                               | Option to pick a category itself, without a subcategory. |
| `noCategories`           | هنوز دسته‌ای از این نوع ندارید. در تنظیمات، دسته‌بندی‌ها را اضافه کنید.                             | There are no categories of this type yet. Add some in Settings, under Categories.                            | No categories of this type exist yet.                    |
| `noAccounts`             | هنوز حسابی ندارید. اول در تنظیمات یک حساب اضافه کنید.                                               | There are no accounts yet. Add one in Settings first.                                                        | No accounts exist yet.                                   |
| `description`            | توضیح                                                                                               | Description                                                                                                  | Body text.                                               |
| `descriptionPlaceholder` | `{type, select, income {مثلاً حقوق مهر} transfer {مثلاً پس‌انداز ماهانه} other {مثلاً خرید هفتگی}}` | `{type, select, income {e.g. October salary} transfer {e.g. Monthly savings} other {e.g. Weekly groceries}}` | Example text in the description field, by type.          |
| `descriptionHint`        | اگر نمی‌دانید بابت چه بوده، خالی بگذارید تا «؟» ثبت شود.                                            | Not sure what it was? Leave it empty and it’s saved as “؟”.                                                  | Hint under the description field.                        |
| `tags`                   | برچسب‌ها                                                                                            | Tags                                                                                                         | Field label.                                             |
| `tagPlaceholder`         | بنویسید و Enter بزنید                                                                               | Type and press Enter                                                                                         | Placeholder of the tag input.                            |
| `tagSuggestions`         | برچسب‌های موجود                                                                                     | Existing tags                                                                                                | Heading of tag suggestions.                              |
| `tagAdd`                 | `افزودن «{tag}»`                                                                                    | `Add “{tag}”`                                                                                                | Option to create a new tag.                              |
| `note`                   | یادداشت                                                                                             | Note                                                                                                         | Field label.                                             |
| `addNote`                | افزودن یادداشت                                                                                      | Add a note                                                                                                   | Link that opens the collapsed note field.                |
| `submit`                 | `{type, select, income {ثبت درآمد} transfer {ثبت انتقال} other {ثبت هزینه}}`                        | `{type, select, income {Add income} transfer {Add transfer} other {Add expense}}`                            | Main button, by type.                                    |
| `submitAnother`          | ثبت و افزودن بعدی                                                                                   | Save and add another                                                                                         | Second button: save and keep the form open.              |
| `submitAnotherShort`     | ثبت و بعدی                                                                                          | Save & new                                                                                                   | Same, short version on phones.                           |
| `submitEdit`             | ذخیره تغییرات                                                                                       | Save changes                                                                                                 | Main button when editing.                                |
| `delete`                 | حذف                                                                                                 | Delete                                                                                                       | Delete button in the edit form.                          |
| `deleteTransaction`      | حذف تراکنش                                                                                          | Delete transaction                                                                                           | Screen-reader / longer label of that button.             |

### `transactions.form.errors`

**Where:** Error messages under fields of the transaction form.

| Key                    | فارسی                                                           | English                                                              | Where / what                                        |
| ---------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `amountMissing`        | مبلغ را وارد کنید.                                              | Enter an amount.                                                     | Error when the field is empty.                      |
| `amountTooLarge`       | این مبلغ بیش از اندازه بزرگ است.                                | This amount is too large.                                            | Error when the number is too large.                 |
| `dateMissing`          | تاریخ را انتخاب کنید.                                           | Choose a date.                                                       | Error when the field is empty.                      |
| `dateFuture`           | تاریخ نمی‌تواند در آینده باشد.                                  | The date can’t be in the future.                                     | Error message.                                      |
| `accountMissing`       | حساب را انتخاب کنید.                                            | Choose an account.                                                   | Error when the field is empty.                      |
| `accountUnavailable`   | این حساب بایگانی یا حذف شده است. حساب دیگری انتخاب کنید.        | This account was archived or deleted. Choose another one.            | Error when the chosen item was archived or deleted. |
| `toAccountMissing`     | حساب مقصد را انتخاب کنید.                                       | Choose the destination account.                                      | Error when the field is empty.                      |
| `toAccountUnavailable` | حساب مقصد بایگانی یا حذف شده است. حساب دیگری انتخاب کنید.       | The destination account was archived or deleted. Choose another one. | Error when the chosen item was archived or deleted. |
| `sameAccount`          | حساب مبدأ و مقصد یکی است.                                       | From and to accounts are the same.                                   | Transfer from and to the same account.              |
| `categoryMissing`      | یک دسته‌بندی انتخاب کنید.                                       | Choose a category.                                                   | Error when the field is empty.                      |
| `categoryUnavailable`  | این دسته‌بندی بایگانی یا حذف شده است. دسته‌ی دیگری انتخاب کنید. | This category was archived or deleted. Choose another one.           | Error when the chosen item was archived or deleted. |
| `descriptionTooLong`   | `توضیح باید حداکثر {description} نویسه باشد.`                   | `A description can be at most {description} characters.`             | Error when the text is too long.                    |
| `noteTooLong`          | `یادداشت باید حداکثر {note} نویسه باشد.`                        | `A note can be at most {note} characters.`                           | Error when the text is too long.                    |
| `tagTooLong`           | `هر برچسب باید حداکثر {tag} نویسه باشد.`                        | `A tag can be at most {tag} characters.`                             | Error when the text is too long.                    |
| `tooManyTags`          | `حداکثر {tags} برچسب می‌توانید اضافه کنید.`                     | `You can add at most {tags} tags.`                                   | Error message.                                      |

### `transactions.detail`

**Where:** The transaction detail panel, opened by clicking a row.

| Key             | فارسی                                                         | English                                                       | Where / what                                               |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `title`         | جزئیات تراکنش                                                 | Transaction details                                           | Heading.                                                   |
| `type`          | نوع                                                           | Type                                                          | Label in the detail panel.                                 |
| `date`          | تاریخ                                                         | Date                                                          | Label in the detail panel.                                 |
| `account`       | حساب                                                          | Account                                                       | Label in the detail panel.                                 |
| `fromAccount`   | از حساب                                                       | From account                                                  | Label in the detail panel.                                 |
| `toAccount`     | به حساب                                                       | To account                                                    | Label in the detail panel.                                 |
| `category`      | دسته‌بندی                                                     | Category                                                      | Label in the detail panel.                                 |
| `tags`          | برچسب‌ها                                                      | Tags                                                          | Label in the detail panel.                                 |
| `note`          | یادداشت                                                       | Note                                                          | Label in the detail panel.                                 |
| `addedBy`       | `ثبت توسط {name}`                                             | `Added by {name}`                                             | Who added it.                                              |
| `addedByClaude` | `ثبت توسط {name} با Claude`                                   | `Added by {name} via Claude`                                  | Added through Claude by this user.                         |
| `lastEdited`    | `آخرین ویرایش: {name}`                                        | `Last edited by {name}`                                       | Shown when someone else edited it last.                    |
| `unknownTitle`  | این تراکنش شناسایی نشده                                       | This transaction is unidentified                              | Notice in the detail of a transaction with no description. |
| `unknownEdit`   | توضیح و دسته‌بندی را اضافه کنید تا در گزارش‌ها درست حساب شود. | Add a description and category so reports count it correctly. | Notice body for writers.                                   |
| `unknownView`   | هنوز توضیح و دسته‌بندی ندارد.                                 | It has no description or category yet.                        | Notice body for viewers.                                   |
| `edit`          | ویرایش                                                        | Edit                                                          | Label in the detail panel.                                 |
| `delete`        | حذف                                                           | Delete                                                        | Label in the detail panel.                                 |

### `transactions.delete`

**Where:** Confirmation dialog before deleting a transaction.

| Key           | فارسی                                                     | English                                                     | Where / what          |
| ------------- | --------------------------------------------------------- | ----------------------------------------------------------- | --------------------- |
| `title`       | حذف تراکنش؟                                               | Delete transaction?                                         | Heading.              |
| `description` | `«{description}» به مبلغ {amount} برای همیشه حذف می‌شود.` | `“{description}” for {amount} will be permanently deleted.` | Body text.            |
| `submit`      | حذف تراکنش                                                | Delete transaction                                          | Main (action) button. |

### `transactions.toasts`

**Where:** Toast notifications after transaction changes (add and delete toasts have an «واگرد» button).

| Key        | فارسی               | English              | Where / what               |
| ---------- | ------------------- | -------------------- | -------------------------- |
| `added`    | تراکنش ثبت شد       | Transaction added    | Toast.                     |
| `saved`    | تغییرات ذخیره شد    | Changes saved        | Toast.                     |
| `deleted`  | تراکنش حذف شد       | Transaction deleted  | Toast.                     |
| `restored` | تراکنش برگردانده شد | Transaction restored | After «واگرد» on a delete. |

### `transactions`

**Where:** The transactions page (/transactions).

| Key      | فارسی                                                      | English                                                      | Where / what                                            |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `error`  | تراکنش‌ها بارگذاری نشد                                     | Couldn’t load transactions                                   | Heading of the error state when the list fails to load. |
| `failed` | انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. | Couldn’t save. Check your internet connection and try again. | Error toast when saving / deleting fails.               |

## Budgets

### `budgets.period`

**Where:** Line under the month switcher on the budgets page.

| Key       | فارسی                                                                  | English                                                                            | Where / what                               |
| --------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `current` | `{passedNumber, plural, other {{passed} روز گذشته}}، {left} روز مانده` | `{passedNumber, plural, one {{passed} day} other {{passed} days}} in, {left} left` | Days passed and left in the current month. |
| `past`    | این ماه به پایان رسیده                                                 | This month has ended                                                               | When a past month is selected.             |
| `future`  | این ماه هنوز شروع نشده                                                 | This month hasn’t started                                                          | When a future month is selected.           |

### `budgets`

**Where:** The budgets page (/budgets).

| Key         | فارسی       | English    | Where / what                              |
| ----------- | ----------- | ---------- | ----------------------------------------- |
| `thisMonth` | ماه جاری    | This month | Button that returns to the current month. |
| `add`       | تعیین بودجه | Set budget | Header button.                            |

### `budgets.summary`

**Where:** Summary card at the top of the budgets page (spent / total budget / remaining, one bar with a line for today).

| Key         | فارسی                           | English                              | Where / what                                  |
| ----------- | ------------------------------- | ------------------------------------ | --------------------------------------------- |
| `spentIn`   | `خرج شده در {month}`            | `Spent in {month}`                   | Label of the month's spending.                |
| `total`     | کل بودجه                        | Total budget                         | Label: sum of all budgets.                    |
| `remaining` | مانده                           | Remaining                            | Label: what is left.                          |
| `over`      | بیش از بودجه                    | Over budget                          | Label when spending is over the total budget. |
| `used`      | `{percent} از کل بودجه خرج شده` | `{percent} of total budget spent`    | Line under the summary bar.                   |
| `pace`      | `امروز، {percent} از ماه گذشته` | `Today: {percent} through the month` | Label of the «today» line on the bar.         |

### `budgets.list`

**Where:** The list of budgets (table on wide screens, cards on phones).

| Key        | فارسی                        | English                        | Where / what                                             |
| ---------- | ---------------------------- | ------------------------------ | -------------------------------------------------------- |
| `label`    | بودجه‌ها                     | Budgets                        | Screen-reader label of the list.                         |
| `category` | دسته‌بندی                    | Category                       | Column header / row text.                                |
| `used`     | مصرف                         | Used                           | Column header: percent used.                             |
| `spent`    | خرج شده از سقف               | Spent of limit                 | Column header: spent of limit.                           |
| `status`   | وضعیت                        | Status                         | Column header / row text.                                |
| `ofLimit`  | `از {max}`                   | `of {max}`                     | After the spent amount («از ۵٬۰۰۰٬۰۰۰ ریال»).            |
| `open`     | `تراکنش‌های {name}، {month}` | `{name} transactions, {month}` | Screen-reader label of a row's link to its transactions. |
| `edit`     | `ویرایش بودجه {name}`        | `Edit {name} budget`           | Screen-reader label of the edit button.                  |
| `archived` | بایگانی‌شده                  | Archived                       | Badge for a budget whose category is archived.           |

### `budgets.unbudgeted`

**Where:** Section under the budget list: expense categories that have no budget.

| Key          | فارسی                     | English                             | Where / what                                             |
| ------------ | ------------------------- | ----------------------------------- | -------------------------------------------------------- |
| `title`      | دسته‌های هزینه بدون بودجه | Expense categories without a budget | Heading.                                                 |
| `subtitle`   | `خرج شده در {month}`      | `Spent in {month}`                  | Line under the heading.                                  |
| `noSpending` | بدون خرج                  | No spending                         | In place of the amount when nothing was spent.           |
| `add`        | `تعیین بودجه برای {name}` | `Set budget for {name}`             | Screen-reader label of the «set budget» button on a row. |

### `budgets.empty`

**Where:** Empty states of the budgets page.

| Key                 | فارسی                                                                                | English                                                                                | Where / what                             |
| ------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| `title`             | هنوز بودجه‌ای تعیین نکرده‌اید                                                        | You haven’t set any budgets yet                                                        | Heading.                                 |
| `description`       | برای هر دسته‌ی هزینه یک سقف ماهانه بگذارید؛ هر ماه تکرار می‌شود.                     | Set a monthly limit for an expense category. It repeats every month.                   | Body text.                               |
| `viewerTitle`       | هنوز بودجه‌ای برای این دفتر تعیین نشده                                               | No budgets in this book yet                                                            | Heading for viewers (read-only role).    |
| `viewerDescription` | وقتی ویرایشگر یا مدیر بودجه‌ای تعیین کند، اینجا دیده می‌شود.                         | When an editor or admin sets a budget, it will show up here.                           | Body text.                               |
| `noCategories`      | بودجه برای دسته‌های هزینه تعیین می‌شود. اول در تنظیمات دسته‌های هزینه را اضافه کنید. | Budgets are set for expense categories. Add your expense categories in Settings first. | No expense categories exist yet.         |
| `addCategories`     | افزودن دسته‌بندی                                                                     | Add categories                                                                         | Button linking to Settings → Categories. |

### `budgets.form`

**Where:** Set / edit budget form (dialog or sheet).

| Key                   | فارسی                                                         | English                                                          | Where / what                                                |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| `newTitle`            | بودجه جدید                                                    | New budget                                                       | Dialog title when adding.                                   |
| `editTitle`           | `بودجه {name}`                                                | `{name} budget`                                                  | Dialog title when editing («بودجه خوراک»).                  |
| `description`         | سقف خرج ماهانه؛ هر ماه تکرار می‌شود.                          | A monthly spending limit. It repeats every month.                | Line under the dialog title.                                |
| `category`            | دسته‌بندی                                                     | Category                                                         | Field label.                                                |
| `categoryPlaceholder` | انتخاب دسته‌بندی                                              | Choose a category                                                | Placeholder of the category select.                         |
| `amount`              | سقف ماهانه                                                    | Monthly limit                                                    | Field label.                                                |
| `subcategories`       | `هزینه‌های زیردسته‌ها ({names}) هم در این بودجه حساب می‌شود.` | `Spending in subcategories ({names}) counts toward this budget.` | Note naming the subcategories that count toward the budget. |
| `submit`              | ذخیره بودجه                                                   | Save budget                                                      | Main (action) button.                                       |
| `remove`              | حذف بودجه                                                     | Remove budget                                                    | Button in the edit form; opens a confirmation.              |

### `budgets.form.errors`

**Where:** Errors under fields of the budget form.

| Key                   | فارسی                                                           | English                                                    | Where / what                                        |
| --------------------- | --------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `categoryMissing`     | دسته‌بندی را انتخاب کنید.                                       | Choose a category.                                         | Error when the field is empty.                      |
| `categoryUnavailable` | این دسته‌بندی بایگانی یا حذف شده است. دسته‌ی دیگری انتخاب کنید. | This category was archived or deleted. Choose another one. | Error when the chosen item was archived or deleted. |
| `amountMissing`       | مبلغ را وارد کنید.                                              | Enter an amount.                                           | Error when the field is empty.                      |
| `amountTooLarge`      | این مبلغ بیش از اندازه بزرگ است.                                | This amount is too large.                                  | Error when the number is too large.                 |

### `budgets.remove`

**Where:** Confirmation dialog before removing a budget.

| Key           | فارسی                                                                           | English                                                                                    | Where / what          |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------- |
| `title`       | `حذف بودجه {name}؟`                                                             | `Remove {name} budget?`                                                                    | Heading.              |
| `description` | `سقف ماهانه‌ی {amount} از همه‌ی ماه‌ها برداشته می‌شود. تراکنش‌ها حذف نمی‌شوند.` | `The monthly limit of {amount} is removed from every month. Transactions are not deleted.` | Body text.            |
| `submit`      | حذف بودجه                                                                       | Remove budget                                                                              | Main (action) button. |

### `budgets.toasts`

**Where:** Toasts after budget changes.

| Key        | فارسی                       | English                  | Where / what |
| ---------- | --------------------------- | ------------------------ | ------------ |
| `added`    | `بودجه {name} تعیین شد`     | `{name} budget set`      | Toast.       |
| `saved`    | `بودجه {name} ذخیره شد`     | `{name} budget saved`    | Toast.       |
| `removed`  | `بودجه {name} حذف شد`       | `{name} budget removed`  | Toast.       |
| `restored` | `بودجه {name} برگردانده شد` | `{name} budget restored` | Toast.       |

### `budgets`

**Where:** The budgets page (/budgets).

| Key       | فارسی                                                      | English                                                      | Where / what                                                   |
| --------- | ---------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| `error`   | بودجه‌ها بارگذاری نشد                                      | Couldn’t load budgets                                        | Heading of the page error state.                               |
| `failed`  | انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. | Couldn’t save. Check your internet connection and try again. | Error when saving fails.                                       |
| `missing` | این بودجه دیگر وجود ندارد. صفحه را دوباره بارگذاری کنید.   | This budget no longer exists. Reload the page.               | Error when the budget was removed meanwhile (by someone else). |

## Charts

### `chart`

**Where:** Charts on the reports page and dashboard. Many are screen-reader texts.

| Key     | فارسی                                                                                               | English                                                                                                        | Where / what                                          |
| ------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `view`  | نمایش نمودار یا جدول                                                                                | Show chart or table                                                                                            | Screen-reader label of the chart / table switch.      |
| `chart` | نمودار                                                                                              | Chart                                                                                                          | Option of the chart / table switch.                   |
| `table` | جدول                                                                                                | Table                                                                                                          | Option of the chart / table switch.                   |
| `net`   | خالص                                                                                                | Net                                                                                                            | Legend: the net line.                                 |
| `axis`  | `محور عمودی: {scale, select, thousand {هزار } million {میلیون } billion {میلیارد } other {}}{unit}` | `Axis: {scale, select, thousand {thousands of } million {millions of } billion {billions of } other {}}{unit}` | Caption under the column chart naming the axis scale. |

### `chart.units`

**Where:** Unit name in the chart axis caption («محور عمودی: میلیون ریال»).

| Key     | فارسی | English | Where / what        |
| ------- | ----- | ------- | ------------------- |
| `rial`  | ریال  | rials   | Option (see group). |
| `toman` | تومان | tomans  | Option (see group). |
| `USD`   | دلار  | dollars | Option (see group). |
| `EUR`   | یورو  | euros   | Option (see group). |
| `GBP`   | پوند  | pounds  | Option (see group). |

### `chart`

**Where:** Charts on the reports page and dashboard. Many are screen-reader texts.

| Key       | فارسی                                                  | English                                                   | Where / what                              |
| --------- | ------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------- |
| `column`  | `{label}: درآمد {income}، هزینه {expense}، خالص {net}` | `{label}: income {income}, expenses {expense}, net {net}` | Screen-reader text of one month's column. |
| `share`   | `{percent} از کل`                                      | `{percent} of total`                                      | Share of the total on a bar row.          |
| `shareOf` | `{percent} از {name}`                                  | `{percent} of {name}`                                     | A subcategory's share of its parent.      |

## Reports

### `reports`

**Where:** The reports page (/reports).

| Key      | فارسی      | English       | Where / what                              |
| -------- | ---------- | ------------- | ----------------------------------------- |
| `period` | دوره گزارش | Report period | Screen-reader label of the period switch. |

### `reports.periods`

**Where:** Period switch (segmented control) at the top of the reports page, wide screens.

| Key      | فارسی       | English      | Where / what        |
| -------- | ----------- | ------------ | ------------------- |
| `month`  | ماه         | Month        | Option (see group). |
| `3m`     | ۳ ماه       | 3 months     | Option (see group). |
| `6m`     | ۶ ماه       | 6 months     | Option (see group). |
| `12m`    | ۱۲ ماه      | 12 months    | Option (see group). |
| `custom` | بازه دلخواه | Custom range | Option (see group). |

### `reports.periodsShort`

**Where:** Same period switch, short labels on phones.

| Key      | فارسی  | English | Where / what        |
| -------- | ------ | ------- | ------------------- |
| `month`  | ماه    | Month   | Option (see group). |
| `3m`     | ۳ ماه  | 3M      | Option (see group). |
| `6m`     | ۶ ماه  | 6M      | Option (see group). |
| `12m`    | ۱۲ ماه | 12M     | Option (see group). |
| `custom` | دلخواه | Custom  | Option (see group). |

### `reports`

**Where:** The reports page (/reports).

| Key         | فارسی                   | English                  | Where / what                                         |
| ----------- | ----------------------- | ------------------------ | ---------------------------------------------------- |
| `range`     | `{from} تا {to}`        | `{from} – {to}`          | A custom range in the page subtitle.                 |
| `compare`   | `در مقایسه با {period}` | `Compared with {period}` | Line naming the previous period used for comparison. |
| `rangeFrom` | شروع بازه               | Start of the range       | Label of the custom range's start date.              |
| `rangeTo`   | پایان بازه              | End of the range         | Label of the custom range's end date.                |

### `reports.summary`

**Where:** The three cards at the top of reports (income, expense, net) with the change against the previous period.

| Key        | فارسی                         | English                              | Where / what                                      |
| ---------- | ----------------------------- | ------------------------------------ | ------------------------------------------------- |
| `income`   | درآمد                         | Income                               | Card title.                                       |
| `expense`  | هزینه                         | Expenses                             | Card title.                                       |
| `net`      | خالص                          | Net                                  | Card title.                                       |
| `previous` | `دوره قبل: <amount></amount>` | `Previous period: <amount></amount>` | Previous period's amount under each card.         |
| `more`     | `{amount} بیشتر`              | `{amount} more`                      | Badge: change against the previous period (more). |
| `less`     | `{amount} کمتر`               | `{amount} less`                      | Badge: change (less).                             |
| `same`     | بدون تغییر                    | No change                            | Badge: no change.                                 |

### `reports`

**Where:** The reports page (/reports).

| Key     | فارسی           | English           | Where / what               |
| ------- | --------------- | ----------------- | -------------------------- |
| `total` | `جمع: {amount}` | `Total: {amount}` | Total under a report card. |

### `reports.categories`

**Where:** Report cards «expense by category» and «income by category» (click a row to open its subcategories).

| Key             | فارسی                                   | English                                     | Where / what                                         |
| --------------- | --------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `expenseTitle`  | هزینه به تفکیک دسته                     | Expenses by category                        | Card title.                                          |
| `incomeTitle`   | درآمد به تفکیک دسته                     | Income by category                          | Card title.                                          |
| `hint`          | برای دیدن زیردسته‌ها روی هر دسته بزنید. | Select a category to see its subcategories. | Hint under the card title.                           |
| `uncategorized` | بدون دسته‌بندی                          | Uncategorized                               | Row for transactions without a category.             |
| `direct`        | بدون زیردسته                            | No subcategory                              | Sub-row for amounts recorded on the category itself. |
| `category`      | دسته‌بندی                               | Category                                    | Column header in the table view.                     |

### `reports.none`

**Where:** Empty text inside a report card.

| Key       | فارسی                          | English                     | Where / what                |
| --------- | ------------------------------ | --------------------------- | --------------------------- |
| `income`  | در این دوره درآمدی ثبت نشده.   | No income in this period.   | Empty text inside the card. |
| `expense` | در این دوره هزینه‌ای ثبت نشده. | No expenses in this period. | Empty text inside the card. |

### `reports.accounts`

**Where:** Report card «spending by account».

| Key       | فارسی               | English             | Where / what                     |
| --------- | ------------------- | ------------------- | -------------------------------- |
| `title`   | هزینه به تفکیک حساب | Spending by account | Heading.                         |
| `account` | حساب                | Account             | Column header in the table view. |

### `reports.table`

**Where:** Column headers of the table view of report cards (each chart can switch to a table).

| Key      | فارسی     | English        | Where / what                     |
| -------- | --------- | -------------- | -------------------------------- |
| `amount` | مبلغ      | Amount         | Column header in the table view. |
| `share`  | سهم از کل | Share of total | Column header in the table view. |

### `reports.monthly`

**Where:** Report card «month by month» (column chart of income / expense with a net line).

| Key          | فارسی                                         | English                                                        | Where / what                                                |
| ------------ | --------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| `title`      | ماه به ماه                                    | Month by month                                                 | Heading.                                                    |
| `trend`      | `شش ماه منتهی به {month}`                     | `Six months to {month}`                                        | Subtitle when one month is selected (the month + 5 before). |
| `month`      | ماه                                           | Month                                                          | Column header in the table view.                            |
| `soFar`      | `{month}، تا امروز`                           | `{month}, so far`                                              | The current, unfinished month.                              |
| `soFarTable` | `{month} (تا امروز)`                          | `{month} (so far)`                                             | Same, in the table view.                                    |
| `summary`    | نمودار ستونی درآمد و هزینه هر ماه، با خط خالص | Column chart of income and expenses per month, with a net line | Screen-reader description of the chart.                     |

### `reports.empty`

**Where:** Empty state of the whole reports page (no income or expense in the period).

| Key                 | فارسی                                                      | English                                                    | Where / what                       |
| ------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| `title`             | در این دوره درآمد یا هزینه‌ای ثبت نشده                     | No income or expenses in this period                       | Heading.                           |
| `description`       | دوره دیگری انتخاب کنید یا تراکنش‌های این دوره را ثبت کنید. | Pick another period, or record this period’s transactions. | For writers (offers the add form). |
| `viewerDescription` | دوره دیگری انتخاب کنید.                                    | Pick another period.                                       | For viewers.                       |

### `reports`

**Where:** The reports page (/reports).

| Key     | فارسی                 | English               | Where / what                     |
| ------- | --------------------- | --------------------- | -------------------------------- |
| `error` | گزارش‌ها بارگذاری نشد | Couldn’t load reports | Heading of the page error state. |

## User management

### `users`

**Where:** User management page (/admin/users, admins only).

| Key            | فارسی                                           | English                                                  | Where / what                       |
| -------------- | ----------------------------------------------- | -------------------------------------------------------- | ---------------------------------- |
| `subtitle`     | ورود به پول فقط با حسابی است که اینجا می‌سازید. | People can only sign in with an account you create here. | Page subtitle.                     |
| `newUser`      | کاربر جدید                                      | New user                                                 | Header button.                     |
| `search`       | جستجوی نام یا نام کاربری                        | Search name or username                                  | Placeholder of the search field.   |
| `roleFilter`   | نقش                                             | Role                                                     | Label of the role filter.          |
| `statusFilter` | وضعیت                                           | Status                                                   | Label of the status filter.        |
| `allRoles`     | همه نقش‌ها                                      | All roles                                                | «All» option of the role filter.   |
| `allStatuses`  | همه وضعیت‌ها                                    | All statuses                                             | «All» option of the status filter. |

### `users.status`

**Where:** User status badge and status filter.

| Key        | فارسی   | English  | Where / what        |
| ---------- | ------- | -------- | ------------------- |
| `active`   | فعال    | Active   | Option (see group). |
| `disabled` | غیرفعال | Disabled | Option (see group). |

### `users`

**Where:** User management page (/admin/users, admins only).

| Key       | فارسی                          | English                                                                            | Where / what               |
| --------- | ------------------------------ | ---------------------------------------------------------------------------------- | -------------------------- |
| `summary` | `{count} کاربر، {active} فعال` | `{countNumber, plural, one {{count} user} other {{count} users}}, {active} active` | Count line above the list. |

### `users.columns`

**Where:** Column headers of the users table.

| Key        | فارسی      | English  | Where / what   |
| ---------- | ---------- | -------- | -------------- |
| `user`     | کاربر      | User     | Column header. |
| `username` | نام کاربری | Username | Column header. |
| `role`     | نقش        | Role     | Column header. |
| `language` | زبان       | Language | Column header. |
| `status`   | وضعیت      | Status   | Column header. |
| `created`  | تاریخ ساخت | Created  | Column header. |
| `actions`  | گزینه‌ها   | Options  | Column header. |

### `users`

**Where:** User management page (/admin/users, admins only).

| Key             | فارسی                        | English                 | Where / what                               |
| --------------- | ---------------------------- | ----------------------- | ------------------------------------------ |
| `you`           | شما                          | You                     | Badge on the admin's own row.              |
| `createdOn`     | `ساخته‌شده در <date></date>` | `Created <date></date>` | Creation date on phone cards.              |
| `metaSeparator` | ،                            | ,                       | Separator between details on phone cards.  |
| `menu`          | `گزینه‌های {name}`           | `Options for {name}`    | Screen-reader label of a row's «…» button. |

### `users.actions`

**Where:** Items of each user's «…» menu.

| Key             | فارسی             | English        | Where / what |
| --------------- | ----------------- | -------------- | ------------ |
| `resetPassword` | بازنشانی رمز عبور | Reset password | Menu item.   |
| `changeRole`    | تغییر نقش         | Change role    | Menu item.   |
| `disable`       | غیرفعال کردن      | Disable        | Menu item.   |
| `enable`        | فعال کردن         | Enable         | Menu item.   |

### `users.self`

**Where:** Why an action is disabled on the admin's own row (shown as a note under the disabled menu item).

| Key        | فارسی                                   | English                               | Where / what                                       |
| ---------- | --------------------------------------- | ------------------------------------- | -------------------------------------------------- |
| `password` | رمز خودتان را در تنظیمات عوض کنید.      | Change your own password in Settings. | Reset password is disabled on the admin’s own row. |
| `role`     | نقش خودتان را نمی‌توانید تغییر دهید.    | You can’t change your own role.       | Change role is disabled on the admin’s own row.    |
| `disable`  | حساب خودتان را نمی‌توانید غیرفعال کنید. | You can’t disable your own account.   | Disable is disabled on the admin’s own row.        |

### `users`

**Where:** User management page (/admin/users, admins only).

| Key         | فارسی                                                      | English                                                         | Where / what                                       |
| ----------- | ---------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------- |
| `lastAdmin` | دست‌کم یک مدیر فعال باید بماند.                            | At least one active admin must remain.                          | Error when the action would leave no active admin. |
| `failed`    | انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. | That didn’t work. Check your internet connection and try again. | Error toast when an action fails.                  |

### `users.empty`

**Where:** Empty state when the admin is the only user.

| Key           | فارسی                                    | English                                                | Where / what |
| ------------- | ---------------------------------------- | ------------------------------------------------------ | ------------ |
| `title`       | هنوز کاربر دیگری نساخته‌اید              | No other users yet                                     | Heading.     |
| `description` | برای هر نفر یک حساب با نقش مناسب بسازید. | Create an account with the right role for each person. | Body text.   |

### `users.noResults`

**Where:** Empty state when search / filters match no user.

| Key           | فارسی                                  | English                           | Where / what                           |
| ------------- | -------------------------------------- | --------------------------------- | -------------------------------------- |
| `title`       | کاربری پیدا نشد                        | No users found                    | Heading.                               |
| `description` | نام یا نام کاربری دیگری را جستجو کنید. | Try a different name or username. | Body text.                             |
| `clear`       | پاک کردن فیلترها                       | Clear filters                     | Button that clears search and filters. |

### `users.roleDescriptions`

**Where:** One-line description under each role option (new-user and change-role dialogs).

| Key      | فارسی                            | English                         | Where / what        |
| -------- | -------------------------------- | ------------------------------- | ------------------- |
| `admin`  | همه‌چیز، به‌علاوه مدیریت کاربران | Everything, plus managing users | Option (see group). |
| `editor` | دیدن و تغییر همه داده‌ها         | Read and change all data        | Option (see group). |
| `viewer` | فقط دیدن                         | Read only                       | Option (see group). |

### `users.form`

**Where:** New user dialog.

| Key               | فارسی                                                                     | English                                                                      | Where / what                             |
| ----------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| `title`           | کاربر جدید                                                                | New user                                                                     | Heading.                                 |
| `name`            | نام نمایشی                                                                | Display name                                                                 | Field label.                             |
| `namePlaceholder` | مثلاً سارا رحیمی                                                          | e.g. Sara Rahimi                                                             | Example name.                            |
| `username`        | نام کاربری                                                                | Username                                                                     | Field label.                             |
| `usernameHint`    | حروف لاتین، عدد، نقطه و زیرخط.                                            | Latin letters, digits, dots and underscores.                                 | Allowed characters.                      |
| `password`        | رمز موقت                                                                  | Temporary password                                                           | Field label.                             |
| `passwordHint`    | این رمز را به کاربر بدهید. بعداً می‌تواند در تنظیمات عوضش کند.            | Give this password to them. They can change it later in Settings.            | Hint under the temporary password.       |
| `generate`        | ساختن رمز تازه                                                            | Generate new password                                                        | Button that makes a new random password. |
| `copy`            | کپی رمز                                                                   | Copy password                                                                | Copy button of the password field.       |
| `role`            | نقش                                                                       | Role                                                                         | Field label.                             |
| `language`        | زبان                                                                      | Language                                                                     | Field label.                             |
| `languageHint`    | تقویم پیش‌فرض را هم تعیین می‌کند: فارسی با تقویم شمسی، English با میلادی. | Also sets their default calendar: فارسی uses Jalali, English uses Gregorian. | Hint under the language choice.          |
| `submit`          | ساخت کاربر                                                                | Create user                                                                  | Main (action) button.                    |

### `users.form.errors`

**Where:** Errors under fields of the new-user form.

| Key                | فارسی                                                  | English                                                               | Where / what                         |
| ------------------ | ------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------ |
| `nameMissing`      | نام نمایشی را وارد کنید.                               | Enter a display name.                                                 | Error when the field is empty.       |
| `nameTooLong`      | `نام نمایشی باید حداکثر {max} نویسه باشد.`             | `Use at most {max} characters for the display name.`                  | Error when the text is too long.     |
| `usernameMissing`  | نام کاربری را وارد کنید.                               | Enter a username.                                                     | Error when the field is empty.       |
| `usernameTooShort` | `نام کاربری باید دست‌کم {min} نویسه باشد.`             | `Use at least {min} characters for the username.`                     | Error when the text is too short.    |
| `usernameTooLong`  | `نام کاربری باید حداکثر {max} نویسه باشد.`             | `Use at most {max} characters for the username.`                      | Error when the text is too long.     |
| `usernameInvalid`  | نام کاربری فقط حروف لاتین، عدد، نقطه و زیرخط می‌پذیرد. | Use only Latin letters, digits, dots and underscores in the username. | Error message.                       |
| `usernameTaken`    | این نام کاربری قبلاً گرفته شده است.                    | This username is already taken.                                       | Error when the name is already used. |
| `passwordTooShort` | `رمز موقت باید دست‌کم {min} نویسه باشد.`               | `Use at least {min} characters.`                                      | Error when the text is too short.    |
| `passwordTooLong`  | `رمز موقت باید حداکثر {max} نویسه باشد.`               | `Use at most {max} characters.`                                       | Error when the text is too long.     |

### `users.role`

**Where:** Change role dialog.

| Key           | فارسی                             | English                         | Where / what          |
| ------------- | --------------------------------- | ------------------------------- | --------------------- |
| `title`       | تغییر نقش                         | Change role                     | Heading.              |
| `description` | `نقش تازه {name} را انتخاب کنید.` | `Choose a new role for {name}.` | Body text.            |
| `submit`      | ذخیره نقش                         | Save role                       | Main (action) button. |

### `users.demote`

**Where:** Confirmation when removing admin rights from an admin.

| Key           | فارسی                                                                 | English                                                                     | Where / what          |
| ------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------- |
| `title`       | حذف دسترسی مدیر؟                                                      | Remove admin rights?                                                        | Heading.              |
| `description` | `{name} دیگر نمی‌تواند کاربران را مدیریت کند و نقشش «{role}» می‌شود.` | `{name} will no longer be able to manage users. Their role becomes {role}.` | Body text.            |
| `submit`      | حذف دسترسی مدیر                                                       | Remove admin rights                                                         | Main (action) button. |

### `users.disable`

**Where:** Confirmation before disabling a user.

| Key           | فارسی                                                                                                                                                               | English                                                                                                                                                         | Where / what          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `title`       | غیرفعال کردن کاربر؟                                                                                                                                                 | Disable user?                                                                                                                                                   | Heading.              |
| `description` | `{name} (<username></username>) دیگر نمی‌تواند وارد شود و از همه دستگاه‌ها خارج می‌شود. حساب و داده‌هایش حذف نمی‌شود و هر وقت بخواهید می‌توانید دوباره فعالش کنید.` | `{name} (<username></username>) won’t be able to sign in and will be signed out everywhere. Their account and data stay, and you can enable it again any time.` | Body text.            |
| `submit`      | غیرفعال کردن کاربر                                                                                                                                                  | Disable user                                                                                                                                                    | Main (action) button. |

### `users.reset`

**Where:** Reset password dialog: first a confirmation, then the new temporary password shown once.

| Key                | فارسی                                                                                             | English                                                                                                                        | Where / what                               |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `title`            | بازنشانی رمز عبور؟                                                                                | Reset password?                                                                                                                | Heading.                                   |
| `description`      | `رمز فعلی {name} دیگر کار نمی‌کند، از همه دستگاه‌ها خارج می‌شود و یک رمز موقت تازه ساخته می‌شود.` | `{name}’s current password will stop working, they’ll be signed out everywhere, and a new temporary password will be created.` | Body text.                                 |
| `submit`           | بازنشانی رمز                                                                                      | Reset password                                                                                                                 | Main (action) button.                      |
| `shownTitle`       | رمز موقت تازه                                                                                     | New temporary password                                                                                                         | Title of the second step (password shown). |
| `shownDescription` | `این رمز را کپی کنید و به {name} بدهید.`                                                          | `Copy it and give it to {name}.`                                                                                               | Under that title.                          |
| `once`             | این رمز فقط همین یک بار نمایش داده می‌شود و بعد از بستن دیگر دیده نمی‌شود.                        | This password is shown only once. You won’t see it again after closing.                                                        | Warning: shown only once.                  |
| `copy`             | کپی رمز                                                                                           | Copy password                                                                                                                  | Copy button.                               |
| `copied`           | کپی شد                                                                                            | Copied                                                                                                                         | Button text right after copying.           |
| `done`             | تمام شد                                                                                           | Done                                                                                                                           | Button that closes the dialog.             |

### `users.toasts`

**Where:** Toasts on the user management page.

| Key                      | فارسی                                   | English                                                 | Where / what                   |
| ------------------------ | --------------------------------------- | ------------------------------------------------------- | ------------------------------ |
| `created`                | `حساب «{name}» ساخته شد`                | `Account “{name}” created`                              | Toast.                         |
| `roleChanged`            | نقش تغییر کرد                           | Role changed                                            | Toast.                         |
| `roleChangedDescription` | `{name} اکنون {role} است.`              | `{name} is now {role}.`                                 | Second line of the role toast. |
| `disabled`               | کاربر غیرفعال شد                        | User disabled                                           | Toast.                         |
| `enabled`                | کاربر فعال شد                           | User enabled                                            | Toast.                         |
| `copied`                 | رمز کپی شد                              | Password copied                                         | Toast.                         |
| `copyFailed`             | کپی نشد. رمز را انتخاب و دستی کپی کنید. | Couldn’t copy. Select the password and copy it by hand. | When the clipboard is blocked. |

## Accounts

### `accounts`

**Where:** Settings → Accounts (/settings/accounts).

| Key         | فارسی                                                                                               | English                                                                                                                                       | Where / what                              |
| ----------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `title`     | حساب‌ها                                                                                             | Accounts                                                                                                                                      | Heading.                                  |
| `subtitle`  | کارت‌های بانکی، پول نقد و هر جای دیگری که پولتان آنجاست                                             | Bank cards, cash and anywhere else your money sits                                                                                            | Page subtitle.                            |
| `add`       | افزودن حساب                                                                                         | Add account                                                                                                                                   | Header button.                            |
| `list`      | فهرست حساب‌ها                                                                                       | Accounts                                                                                                                                      | Screen-reader label of the list.          |
| `total`     | موجودی کل                                                                                           | Total balance                                                                                                                                 | Total of active accounts, above the list. |
| `totalNote` | `{archived, select, true {{count} حساب فعال، بدون حساب‌های بایگانی‌شده} other {{count} حساب فعال}}` | `{countNumber, plural, one {{count} active account} other {{count} active accounts}}{archived, select, true {, excluding archived} other {}}` | Line under the total.                     |

### `accounts.types`

**Where:** Account type options (icon + label) in the account form and list.

| Key     | فارسی      | English   | Where / what        |
| ------- | ---------- | --------- | ------------------- |
| `card`  | کارت بانکی | Bank card | Option (see group). |
| `cash`  | نقدی       | Cash      | Option (see group). |
| `other` | سایر       | Other     | Option (see group). |

### `accounts`

**Where:** Settings → Accounts (/settings/accounts).

| Key    | فارسی              | English              | Where / what                               |
| ------ | ------------------ | -------------------- | ------------------------------------------ |
| `menu` | `گزینه‌های {name}` | `Options for {name}` | Screen-reader label of a row's «…» button. |

### `accounts.actions`

**Where:** Items of each account's «…» menu.

| Key        | فارسی           | English   | Where / what |
| ---------- | --------------- | --------- | ------------ |
| `edit`     | ویرایش          | Edit      | Menu item.   |
| `moveUp`   | انتقال به بالا  | Move up   | Menu item.   |
| `moveDown` | انتقال به پایین | Move down | Menu item.   |
| `archive`  | بایگانی         | Archive   | Menu item.   |
| `restore`  | بازگردانی       | Restore   | Menu item.   |
| `delete`   | حذف             | Delete    | Menu item.   |

### `accounts`

**Where:** Settings → Accounts (/settings/accounts).

| Key            | فارسی                                                                                               | English                                                                                     | Where / what                             |
| -------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `dragHandle`   | `جابه‌جا کردن {name}`                                                                               | `Move {name}`                                                                               | Screen-reader label of the drag handle.  |
| `dragHint`     | برای تغییر ترتیب، ردیف را از دستگیره بکشید. فرم ثبت تراکنش هم حساب‌ها را به همین ترتیب نشان می‌دهد. | Drag a row by its handle to reorder. The transaction form lists accounts in the same order. | Hint under the list on desktop.          |
| `moveHint`     | ترتیب را از منوی هر حساب تغییر دهید. فرم ثبت تراکنش هم حساب‌ها را به همین ترتیب نشان می‌دهد.        | Reorder from each account’s menu. The transaction form lists accounts in the same order.    | Hint under the list on phones.           |
| `archived`     | `بایگانی‌شده ({count})`                                                                             | `Archived ({count})`                                                                        | Toggle that opens the archived accounts. |
| `archivedNote` | در فرم‌ها نمی‌آیند؛ تاریخچه‌شان می‌ماند.                                                            | Hidden from forms; their history is kept.                                                   | Note inside the archived section.        |

### `accounts.form`

**Where:** Add / edit account form (dialog or sheet).

| Key               | فارسی                                                                             | English                                                                              | Where / what                       |
| ----------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| `newTitle`        | حساب جدید                                                                         | New account                                                                          | Dialog title when adding.          |
| `editTitle`       | ویرایش حساب                                                                       | Edit account                                                                         | Dialog title when editing.         |
| `name`            | نام                                                                               | Name                                                                                 | Field label.                       |
| `namePlaceholder` | مثلاً کارت بانک ملت                                                               | e.g. Mellat Bank card                                                                | Example name.                      |
| `type`            | نوع                                                                               | Type                                                                                 | Field label.                       |
| `opening`         | موجودی اولیه                                                                      | Starting balance                                                                     | Field label: the balance at start. |
| `openingHint`     | موجودی حساب در روزی که استفاده از پول را شروع می‌کنید. می‌تواند صفر یا منفی باشد. | The balance on the day you start using Money. Can be zero or negative.               | Hint when adding.                  |
| `openingHintEdit` | موجودی فعلی بر اساس این مبلغ و تراکنش‌های حساب دوباره حساب می‌شود.                | The current balance is recalculated from this amount and the account’s transactions. | Hint when editing.                 |
| `submitNew`       | افزودن حساب                                                                       | Add account                                                                          | Main button when adding.           |
| `submitEdit`      | ذخیره تغییرات                                                                     | Save changes                                                                         | Main button when editing.          |

### `accounts.form.errors`

**Where:** Errors under fields of the account form.

| Key           | فارسی                                    | English                                            | Where / what                         |
| ------------- | ---------------------------------------- | -------------------------------------------------- | ------------------------------------ |
| `nameMissing` | نام را وارد کنید.                        | Enter a name.                                      | Error when the field is empty.       |
| `nameTooLong` | `نام حساب باید حداکثر {max} نویسه باشد.` | `An account name can be at most {max} characters.` | Error when the text is too long.     |
| `nameTaken`   | حسابی با این نام وجود دارد.              | An account with this name already exists.          | Error when the name is already used. |

### `accounts.delete`

**Where:** Confirmation before deleting an unused account.

| Key           | فارسی                             | English                                 | Where / what          |
| ------------- | --------------------------------- | --------------------------------------- | --------------------- |
| `title`       | حذف حساب؟                         | Delete account?                         | Heading.              |
| `description` | `«{name}» برای همیشه حذف می‌شود.` | `“{name}” will be permanently deleted.` | Body text.            |
| `submit`      | حذف حساب                          | Delete account                          | Main (action) button. |

### `accounts.blocked`

**Where:** Dialog shown instead of delete when the account has transactions (offers to archive).

| Key                   | فارسی                                                                                                                     | English                                                                                                                                      | Where / what                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `title`               | این حساب حذف نمی‌شود                                                                                                      | This account can’t be deleted                                                                                                                | Heading.                                    |
| `description`         | `«{name}» {count} تراکنش دارد و حسابی که تراکنش دارد حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید و تاریخچه‌اش بماند.` | `“{name}” has {count} transactions, and accounts with transactions can’t be deleted. Archive it to hide it from forms and keep its history.` | Body text.                                  |
| `archivedDescription` | `«{name}» {count} تراکنش دارد و حسابی که تراکنش دارد حذف نمی‌شود. بایگانی‌شده می‌ماند تا تاریخچه‌اش حفظ شود.`             | `“{name}” has {count} transactions, and accounts with transactions can’t be deleted. It stays archived so its history is kept.`              | Same, when the account is already archived. |
| `submit`              | بایگانی حساب                                                                                                              | Archive account                                                                                                                              | Main (action) button.                       |

### `accounts.empty`

**Where:** Empty state of the accounts page.

| Key                 | فارسی                                                                               | English                                                                                      | Where / what |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------ |
| `title`             | هنوز حسابی تعریف نکرده‌اید                                                          | No accounts yet                                                                              | Heading.     |
| `description`       | کارت بانکی، کیف پول نقدی یا هر حساب دیگری را اضافه کنید تا بتوانید تراکنش ثبت کنید. | Add a bank card, a cash wallet or any other account so you can start recording transactions. | Body text.   |
| `viewerTitle`       | هنوز حسابی تعریف نشده است                                                           | No accounts have been set up                                                                 | For viewers. |
| `viewerDescription` | وقتی ویرایشگر یا مدیر حسابی بسازد، اینجا دیده می‌شود.                               | Accounts appear here once an editor or admin adds them.                                      | Body text.   |

### `accounts`

**Where:** Settings → Accounts (/settings/accounts).

| Key      | فارسی                                                                   | English                                                                                  | Where / what                                                    |
| -------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `error`  | حساب‌ها بارگذاری نشد                                                    | Couldn’t load accounts                                                                   | Heading of the page error state.                                |
| `failed` | انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.              | Couldn’t save. Check your internet connection and try again.                             | Error when saving fails.                                        |
| `inUse`  | این حساب تراکنش دارد و حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید. | This account has transactions, so it can’t be deleted. Archive it to hide it from forms. | Error when deleting an account that got transactions meanwhile. |

### `accounts.toasts`

**Where:** Toasts on the accounts page.

| Key        | فارسی                   | English             | Where / what |
| ---------- | ----------------------- | ------------------- | ------------ |
| `added`    | حساب افزوده شد          | Account added       | Toast.       |
| `saved`    | تغییرات ذخیره شد        | Changes saved       | Toast.       |
| `archived` | `«{name}» بایگانی شد`   | `“{name}” archived` | Toast.       |
| `restored` | `«{name}» بازگردانی شد` | `“{name}” restored` | Toast.       |
| `deleted`  | `«{name}» حذف شد`       | `“{name}” deleted`  | Toast.       |

## Categories

### `categories`

**Where:** Settings → Categories (/settings/categories), with an expense / income switch.

| Key                   | فارسی                                            | English                                                                          | Where / what                                        |
| --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| `title`               | دسته‌بندی‌ها                                     | Categories                                                                       | Heading.                                            |
| `subtitle`            | دسته‌ها و زیردسته‌هایی که به هر تراکنش می‌دهید   | The categories and subcategories you give each transaction                       | Page subtitle.                                      |
| `add`                 | افزودن دسته                                      | Add category                                                                     | Header button.                                      |
| `type`                | نوع دسته                                         | Category type                                                                    | Screen-reader label of the expense / income switch. |
| `list`                | `دسته‌های {type}`                                | `{type} categories`                                                              | Screen-reader label of the list («دسته‌های هزینه»). |
| `subcategoryCount`    | `{countNumber, plural, other {{count} زیردسته}}` | `{countNumber, plural, one {{count} subcategory} other {{count} subcategories}}` | Number of subcategories on a category row.          |
| `addSubcategory`      | زیردسته                                          | Subcategory                                                                      | Small button on a category row.                     |
| `addSubcategoryLabel` | `افزودن زیردسته به {name}`                       | `Add a subcategory to {name}`                                                    | Screen-reader label of that button.                 |
| `menu`                | `گزینه‌های {name}`                               | `Options for {name}`                                                             | Screen-reader label of a row's «…» button.          |

### `categories.actions`

**Where:** Items of each category's «…» menu.

| Key              | فارسی           | English            | Where / what                                       |
| ---------------- | --------------- | ------------------ | -------------------------------------------------- |
| `edit`           | تغییر نام و رنگ | Rename and recolor | Menu item for a top-level category.                |
| `addSubcategory` | افزودن زیردسته  | Add subcategory    | Menu item.                                         |
| `rename`         | تغییر نام       | Rename             | Menu item for a subcategory (no color of its own). |
| `archive`        | بایگانی         | Archive            | Menu item.                                         |
| `restore`        | بازگردانی       | Restore            | Menu item.                                         |
| `delete`         | حذف             | Delete             | Menu item.                                         |

### `categories`

**Where:** Settings → Categories (/settings/categories), with an expense / income switch.

| Key            | فارسی                                                        | English                                               | Where / what                               |
| -------------- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------ |
| `archived`     | `بایگانی‌شده ({count})`                                      | `Archived ({count})`                                  | Toggle that opens the archived categories. |
| `archivedNote` | در فرم‌ها نمی‌آیند؛ تراکنش‌های قبلی‌شان در گزارش‌ها می‌ماند. | Hidden from forms; past transactions stay in reports. | Note inside the archived section.          |

### `categories.form`

**Where:** Add / edit category and subcategory form.

| Key               | فارسی                                                                  | English                                                                      | Where / what                                            |
| ----------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| `newTitle`        | `{type, select, expense {دستهٔ هزینهٔ جدید} other {دستهٔ درآمد جدید}}` | `{type, select, expense {New expense category} other {New income category}}` | Dialog title when adding, by type.                      |
| `editTitle`       | ویرایش دسته                                                            | Edit category                                                                | Dialog title when editing.                              |
| `newSubTitle`     | زیردستهٔ جدید                                                          | New subcategory                                                              | Dialog title when adding.                               |
| `editSubTitle`    | تغییر نام زیردسته                                                      | Rename subcategory                                                           | Dialog title when editing.                              |
| `underParent`     | `زیرمجموعهٔ «{name}»`                                                  | `Under “{name}”`                                                             | Line under the subcategory form's title.                |
| `name`            | نام                                                                    | Name                                                                         | Field label.                                            |
| `namePlaceholder` | مثلاً خوراک                                                            | e.g. Food                                                                    | Example category name.                                  |
| `subPlaceholder`  | مثلاً رستوران                                                          | e.g. Restaurants                                                             | Example subcategory name.                               |
| `color`           | رنگ                                                                    | Color                                                                        | Field label.                                            |
| `colorHintEdit`   | زیردسته‌ها هم همین رنگ را می‌گیرند.                                    | Subcategories take the same color.                                           | Hint under the color picker when editing.               |
| `colorFromParent` | زیردسته رنگ دستهٔ والد را می‌گیرد.                                     | Subcategories use their parent’s color.                                      | Note in the subcategory form instead of a color picker. |
| `submitNew`       | افزودن دسته                                                            | Add category                                                                 | Main (action) button.                                   |
| `submitNewSub`    | افزودن زیردسته                                                         | Add subcategory                                                              | Main (action) button.                                   |
| `submitEdit`      | ذخیره تغییرات                                                          | Save changes                                                                 | Main (action) button.                                   |

### `categories.form.errors`

**Where:** Errors under fields of the category form.

| Key           | فارسی                                    | English                                            | Where / what                         |
| ------------- | ---------------------------------------- | -------------------------------------------------- | ------------------------------------ |
| `nameMissing` | نام را وارد کنید.                        | Enter a name.                                      | Error when the field is empty.       |
| `nameTooLong` | `نام دسته باید حداکثر {max} نویسه باشد.` | `A category name can be at most {max} characters.` | Error when the text is too long.     |
| `nameTaken`   | دسته‌ای با این نام وجود دارد.            | A category with this name already exists.          | Error when the name is already used. |

### `categories.delete`

**Where:** Confirmation before deleting an unused category or subcategory.

| Key                 | فارسی                                                   | English                                                               | Where / what                         |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| `title`             | حذف دسته؟                                               | Delete category?                                                      | Heading.                             |
| `subTitle`          | حذف زیردسته؟                                            | Delete subcategory?                                                   | Heading (subcategory version).       |
| `description`       | `«{name}» برای همیشه حذف می‌شود.`                       | `“{name}” will be permanently deleted.`                               | Body text.                           |
| `withSubcategories` | `«{name}» و {count} زیردسته‌اش برای همیشه حذف می‌شوند.` | `“{name}” and its {count} subcategories will be permanently deleted.` | When the category has subcategories. |
| `submit`            | حذف دسته                                                | Delete category                                                       | Main (action) button.                |
| `subSubmit`         | حذف زیردسته                                             | Delete subcategory                                                    | Main button (subcategory version).   |

### `categories.blocked`

**Where:** Dialog shown instead of delete when the category is used by transactions (offers to archive).

| Key                   | فارسی                                                                                                            | English                                                                                                                           | Where / what                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `title`               | این دسته حذف نمی‌شود                                                                                             | This category can’t be deleted                                                                                                    | Heading.                           |
| `subTitle`            | این زیردسته حذف نمی‌شود                                                                                          | This subcategory can’t be deleted                                                                                                 | Heading (subcategory version).     |
| `description`         | `«{name}» در {count} تراکنش به کار رفته و حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید و گزارش‌ها دست نخورد.` | `“{name}” is used by {count} transactions, so it can’t be deleted. Archive it to hide it from forms and leave reports untouched.` | Body text.                         |
| `archivedDescription` | `«{name}» در {count} تراکنش به کار رفته و حذف نمی‌شود. بایگانی‌شده می‌ماند تا گزارش‌ها دست نخورد.`               | `“{name}” is used by {count} transactions, so it can’t be deleted. It stays archived so reports stay untouched.`                  | Same, when already archived.       |
| `submit`              | بایگانی دسته                                                                                                     | Archive category                                                                                                                  | Main (action) button.              |
| `subSubmit`           | بایگانی زیردسته                                                                                                  | Archive subcategory                                                                                                               | Main button (subcategory version). |

### `categories.empty`

**Where:** Empty state of a category type (expense or income).

| Key                     | فارسی                                                                                   | English                                                                                | Where / what                             |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| `title`                 | `{type, select, expense {هنوز دستهٔ هزینه‌ای ندارید} other {هنوز دستهٔ درآمدی ندارید}}` | `{type, select, expense {No expense categories yet} other {No income categories yet}}` | Heading.                                 |
| `description`           | با یک ضربه از پیشنهادها شروع کنید یا دستهٔ خودتان را بسازید.                            | Start from a suggestion with one tap, or make your own.                                | When suggestions are available.          |
| `noStartersDescription` | دستهٔ خودتان را بسازید.                                                                 | Make your own category.                                                                | When all suggestions were already added. |
| `viewerTitle`           | هنوز دسته‌ای تعریف نشده است                                                             | No categories have been set up                                                         | Heading for viewers (read-only role).    |
| `viewerDescription`     | وقتی ویرایشگر یا مدیر دسته‌ای بسازد، اینجا دیده می‌شود.                                 | Categories appear here once an editor or admin adds them.                              | Body text.                               |

### `categories.starters`

**Where:** Suggested starter categories, shown while a type has no categories.

| Key        | فارسی                                                                       | English                                                                                                                  | Where / what                                        |
| ---------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `title`    | پیشنهادها                                                                   | Suggestions                                                                                                              | Heading.                                            |
| `addAll`   | افزودن همه                                                                  | Add all                                                                                                                  | Adds every suggestion.                              |
| `addOwn`   | ساخت دستهٔ دلخواه                                                           | Create your own                                                                                                          | Opens the empty category form.                      |
| `add`      | `افزودن {name}`                                                             | `Add {name}`                                                                                                             | Screen-reader label of one suggestion's add button. |
| `includes` | `{countNumber, plural, =0 {بدون زیردسته} other {همراه با {count} زیردسته}}` | `{countNumber, plural, =0 {No subcategories} one {Includes {count} subcategory} other {Includes {count} subcategories}}` | Line under a suggestion.                            |

### `categories`

**Where:** Settings → Categories (/settings/categories), with an expense / income switch.

| Key      | فارسی                                                                                | English                                                                                          | Where / what                                                    |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `error`  | دسته‌بندی‌ها بارگذاری نشد                                                            | Couldn’t load categories                                                                         | Heading of the page error state.                                |
| `failed` | انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.                           | Couldn’t save. Check your internet connection and try again.                                     | Error when saving fails.                                        |
| `inUse`  | این دسته در تراکنش‌ها به کار رفته و حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید. | This category is used by transactions, so it can’t be deleted. Archive it to hide it from forms. | Error when deleting a category that got transactions meanwhile. |

### `categories.toasts`

**Where:** Toasts on the categories page.

| Key               | فارسی                   | English             | Where / what                |
| ----------------- | ----------------------- | ------------------- | --------------------------- |
| `added`           | دسته افزوده شد          | Category added      | Toast.                      |
| `subAdded`        | زیردسته افزوده شد       | Subcategory added   | Toast.                      |
| `saved`           | تغییرات ذخیره شد        | Changes saved       | Toast.                      |
| `archived`        | `«{name}» بایگانی شد`   | `“{name}” archived` | Toast.                      |
| `restored`        | `«{name}» بازگردانی شد` | `“{name}” restored` | Toast.                      |
| `deleted`         | `«{name}» حذف شد`       | `“{name}” deleted`  | Toast.                      |
| `starterAdded`    | `«{name}» افزوده شد`    | `“{name}” added`    | Toast.                      |
| `startersAdded`   | پیشنهادها افزوده شدند   | Suggestions added   | Toast.                      |
| `startersRemoved` | پیشنهادها برداشته شدند  | Suggestions removed | After «واگرد» on «add all». |

## Claude connector

### `connector`

**Where:** Settings → Claude connector (/settings/connector) and the Claude consent page.

| Key        | فارسی                                                             | English                                                                  | Where / what                           |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------- |
| `title`    | اتصال به Claude                                                   | Connect to Claude                                                        | Page title (h1) and the settings link. |
| `subtitle` | با گفت‌وگو با Claude تراکنش ثبت کنید و دربارهٔ خرج‌هایتان بپرسید. | Record transactions and ask about your spending by chatting with Claude. | Page subtitle.                         |
| `error`    | برنامه‌های متصل بارگذاری نشد                                      | Couldn’t load connected apps                                             | Heading of the error state.            |

### `connector.url`

**Where:** Card with the connector URL to copy into Claude.

| Key         | فارسی                                                                                            | English                                                                                             | Where / what                            |
| ----------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `title`     | نشانی اتصال                                                                                      | Connector URL                                                                                       | Heading.                                |
| `subtitle`  | این نشانی را در Claude به‌عنوان کانکتور سفارشی اضافه کنید.                                       | Add this URL to Claude as a custom connector.                                                       | Under the card title.                   |
| `hint`      | ورود و اجازهٔ دسترسی بعد از افزودن، در خود پول انجام می‌شود. رمز عبورتان به Claude داده نمی‌شود. | Sign-in and permission happen in Money after you add it. Your password is never shared with Claude. | Under the URL.                          |
| `copy`      | کپی                                                                                              | Copy                                                                                                | Copy button.                            |
| `copied`    | کپی شد                                                                                           | Copied                                                                                              | Button text right after copying.        |
| `copyLabel` | کپی نشانی اتصال                                                                                  | Copy the connector URL                                                                              | Screen-reader label of the copy button. |

### `connector.steps`

**Where:** Numbered steps for adding the connector in Claude. <chip> marks English UI labels of Claude itself (keep them in English).

| Key     | فارسی                                                                                                               | English                                                                                                    | Where / what |
| ------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------ |
| `title` | افزودن در Claude                                                                                                    | Add it in Claude                                                                                           | Heading.     |
| `one`   | `در Claude به <path><chip>Settings</chip><sep></sep><chip>Connectors</chip></path> بروید.`                          | `In Claude, go to <path><chip>Settings</chip><sep></sep><chip>Connectors</chip></path>.`                   | Step 1.      |
| `two`   | `روی <chip>Add custom connector</chip> بزنید.`                                                                      | `Click <chip>Add custom connector</chip>.`                                                                 | Step 2.      |
| `three` | `نامی مثل «پول» بنویسید، نشانی بالا را در <chip>Remote MCP server URL</chip> بچسبانید و <chip>Add</chip> را بزنید.` | `Name it “Money”, paste the URL above into <chip>Remote MCP server URL</chip> and click <chip>Add</chip>.` | Step 3.      |
| `four`  | `روی <chip>Connect</chip> بزنید، وارد پول شوید و اجازهٔ دسترسی بدهید.`                                              | `Click <chip>Connect</chip>, sign in to Money and allow access.`                                           | Step 4.      |

### `connector.apps`

**Where:** List of connected apps (Claude) with revoke.

| Key                | فارسی                                                       | English                                               | Where / what                   |
| ------------------ | ----------------------------------------------------------- | ----------------------------------------------------- | ------------------------------ |
| `title`            | برنامه‌های متصل                                             | Connected apps                                        | Heading.                       |
| `subtitle`         | برنامه‌هایی که الان به حساب شما دسترسی دارند.               | Apps that currently have access to your account.      | Line under the heading.        |
| `connected`        | `متصل‌شده در <date></date>`                                 | `Connected <date></date>`                             | When it was connected.         |
| `lastUsed`         | `آخرین استفاده: <date></date>`                              | `Last used <date></date>`                             | Last time Claude used it.      |
| `neverUsed`        | هنوز استفاده نشده                                           | Not used yet                                          | Instead of the last-used date. |
| `read`             | فقط خواندن                                                  | Read only                                             | Badge for viewers.             |
| `write`            | خواندن و ثبت                                                | Read & write                                          | Badge for editors and admins.  |
| `revoke`           | قطع دسترسی                                                  | Revoke access                                         | Button on a connected app.     |
| `emptyTitle`       | هنوز برنامه‌ای متصل نیست                                    | No apps connected yet                                 | Empty state.                   |
| `emptyDescription` | نشانی بالا را در Claude اضافه کنید تا اینجا نمایش داده شود. | Add the URL above in Claude and it will show up here. | Empty state body.              |

### `connector.apps.role`

**Where:** Line under a connected app explaining what it may do, by the user's role.

| Key      | فارسی                                                                                                              | English                                                                                                     | Where / what        |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------- |
| `viewer` | Claude با نقش شما (بیننده) کار می‌کند: فقط می‌تواند تراکنش‌ها را بخواند.                                           | Claude works with your role (Viewer): it can only read transactions.                                        | Option (see group). |
| `editor` | Claude با نقش شما (ویرایشگر) کار می‌کند: تراکنش‌ها را می‌خواند، ثبت و ویرایش می‌کند و فقط وقتی بخواهید حذف می‌کند. | Claude works with your role (Editor): it reads, adds and edits transactions, and deletes only when you ask. | Option (see group). |
| `admin`  | Claude با نقش شما (مدیر) کار می‌کند: تراکنش‌ها را می‌خواند، ثبت و ویرایش می‌کند و فقط وقتی بخواهید حذف می‌کند.     | Claude works with your role (Admin): it reads, adds and edits transactions, and deletes only when you ask.  | Option (see group). |

### `connector.revoke`

**Where:** Confirmation before revoking Claude's access.

| Key           | فارسی                                                                                                                                             | English                                                                                                                                                     | Where / what          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `title`       | `قطع دسترسی {name}؟`                                                                                                                              | `Revoke {name}’s access?`                                                                                                                                   | Heading.              |
| `description` | دیگر نمی‌تواند تراکنش‌های شما را ببیند یا ثبت کند. تراکنش‌هایی که تا امروز ثبت کرده سر جایشان می‌مانند. برای استفادهٔ دوباره باید از نو وصل شوید. | It will no longer be able to read or record your transactions. Transactions it already added stay where they are. To use it again you’ll need to reconnect. | Body text.            |
| `done`        | `دسترسی {name} قطع شد`                                                                                                                            | `{name} access revoked`                                                                                                                                     | Toast after revoking. |
| `failed`      | دسترسی قطع نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.                                                                                   | Couldn’t revoke access. Check your internet connection and try again.                                                                                       | Error toast.          |

### `connector.examples`

**Where:** Example prompts to say to Claude (two tabs: record / ask). These are written as casual spoken Persian on purpose, like a user would type.

| Key           | فارسی                                              | English                                                | Where / what                                                |
| ------------- | -------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `title`       | به Claude بگویید                                   | Things to say to Claude                                | Example prompt.                                             |
| `subtitle`    | چند نمونه برای شروع. به زبان خودتان بنویسید.       | A few ideas to start. Write it your own way.           | Example prompt.                                             |
| `record`      | ثبت                                                | Record                                                 | Tab: examples of recording.                                 |
| `ask`         | پرسیدن                                             | Ask                                                    | Tab: examples of questions.                                 |
| `sms`         | «این پیامک بانک رو ثبت کن»                         | “Log this bank SMS”                                    | Example prompt.                                             |
| `smsHint`     | متن پیامک را هم در همان پیام بچسبانید.             | Paste the message text in the same chat.               | Note under the SMS example.                                 |
| `groceries`   | «دیروز ۸۵۰ هزار تومن خرید هفتگی کردم، از کارت ملت» | “Spent 850k toman on groceries yesterday, Mellat card” | Example prompt.                                             |
| `transfer`    | «۲ میلیون از ملت به حساب نقدی منتقل کن»            | “Move 2 million from Mellat to Cash”                   | Example prompt.                                             |
| `restaurants` | «این ماه چقدر خرج رستوران کردم؟»                   | “How much did I spend on restaurants this month?”      | Example prompt.                                             |
| `unknown`     | «تراکنش‌های ناشناس این ماه رو نشونم بده»           | “Show me this month’s unknown transactions”            | Example prompt.                                             |
| `compare`     | «خرج‌های مهر رو با شهریور مقایسه کن»               | “Compare this month’s spending with last month”        | Example prompt.                                             |
| `badgeBefore` | تراکنش‌هایی که Claude ثبت می‌کند با نشان           | Transactions Claude records carry a                    | Sentence split around the Claude badge icon: «… [badge] …». |
| `badgeAfter`  | در فهرست دیده می‌شوند.                             | badge in your lists.                                   | Second half of that sentence.                               |

### `connector.consent`

**Where:** The OAuth consent page (/oauth/consent) where the user allows Claude to access their book. Outside the app frame.

| Key                  | فارسی                                                                      | English                                                                           | Where / what                                         |
| -------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `title`              | `{client} می‌خواهد به حساب پول شما دسترسی داشته باشد`                      | `{client} wants to access your Money account`                                     | Page heading.                                        |
| `switchAccount`      | تغییر حساب                                                                 | Switch account                                                                    | Signs out and back in as another user.               |
| `canDo`              | `{client} می‌تواند:`                                                       | `{client} will be able to:`                                                       | Heading of the permission list.                      |
| `yourRole`           | `نقش شما: {role}`                                                          | `Your role: {role}`                                                               | Badge with the user's role.                          |
| `read`               | خواندن تراکنش‌ها                                                           | Read transactions                                                                 | Permission item.                                     |
| `readDescription`    | برای پاسخ به پرسش‌هایی مثل «این ماه چقدر خرج کردم؟»                        | To answer questions like “How much did I spend this month?”                       | Line under the permission.                           |
| `write`              | ثبت و ویرایش تراکنش‌ها                                                     | Add and edit transactions                                                         | Permission item (editors and admins).                |
| `writeDescription`   | هر چه ثبت کند با نشان Claude در فهرست دیده می‌شود.                         | Everything it records shows a Claude badge in your lists.                         | Line under the permission.                           |
| `delete`             | حذف تراکنش، وقتی خودتان بخواهید                                            | Delete transactions when you ask                                                  | Permission item (editors and admins).                |
| `deleteDescription`  | Claude بدون درخواست شما چیزی حذف نمی‌کند.                                  | Claude never deletes anything without your request.                               | Line under the permission.                           |
| `viewerNote`         | `نقش شما «بیننده» است؛ {client} نمی‌تواند تراکنشی ثبت، ویرایش یا حذف کند.` | `Your role is Viewer, so {client} can’t add, edit or delete transactions.`        | Note for viewers instead of the write permissions.   |
| `redirect`           | `پس از پاسخ، به {host} برمی‌گردید.`                                        | `After you answer, you’ll return to {host}.`                                      | Where the browser goes after answering.              |
| `deny`               | رد کردن                                                                    | Deny                                                                              | Secondary button.                                    |
| `allow`              | اجازه دادن                                                                 | Allow                                                                             | Primary button.                                      |
| `footNote`           | هر وقت بخواهید، از تنظیمات ‹ اتصال به Claude دسترسی را قطع کنید.           | You can revoke access anytime in Settings › Connect to Claude.                    | Note at the bottom. «‹» is the breadcrumb separator. |
| `doneTitle`          | دسترسی داده شد                                                             | Access allowed                                                                    | After allowing.                                      |
| `doneDescription`    | `در حال بازگشت به {client}… اگر این پنجره بسته نشد، خودتان ببندید.`        | `Returning to {client}… If this window doesn’t close, you can close it.`          | Body text.                                           |
| `deniedTitle`        | دسترسی داده نشد                                                            | Access denied                                                                     | After denying.                                       |
| `deniedDescription`  | `{client} به حساب پول شما وصل نشد. می‌توانید این پنجره را ببندید.`         | `{client} wasn’t connected to your Money account. You can close this window.`     | Body text.                                           |
| `back`               | `بازگشت به {client}`                                                       | `Back to {client}`                                                                | Button back to Claude.                               |
| `failed`             | پاسخ شما ثبت نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.          | Your answer wasn’t saved. Check your internet connection and try again.           | Error when the answer couldn't be sent.              |
| `invalidTitle`       | این درخواست دیگر معتبر نیست                                                | This request is no longer valid                                                   | When the signed request expired or is broken.        |
| `invalidDescription` | درخواست اتصال منقضی شده یا ناقص است. از Claude دوباره «Connect» را بزنید.  | The connection request expired or is incomplete. Click “Connect” in Claude again. | Body text.                                           |

## Settings

### `settings`

**Where:** Settings page (/settings).

| Key        | فارسی                                                      | English                                                      | Where / what                         |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `subtitle` | حساب‌ها، دسته‌بندی‌ها، پروفایل و نمایش                     | Accounts, categories, profile and display                    | Page subtitle.                       |
| `failed`   | ذخیره نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. | Couldn’t save. Check your internet connection and try again. | Error when saving any setting fails. |

### `settings.profile`

**Where:** Settings → Profile section.

| Key                  | فارسی                                           | English                                             | Where / what                        |
| -------------------- | ----------------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| `title`              | پروفایل                                         | Profile                                             | Heading.                            |
| `subtitle`           | نامی که در برنامه و گزارش‌ها نمایش داده می‌شود. | The name shown across the app and in reports.       | Line under the heading.             |
| `displayName`        | نام نمایشی                                      | Display name                                        | Field label.                        |
| `displayNameMissing` | نام نمایشی را وارد کنید.                        | Enter a display name.                               | Error when the field is empty.      |
| `displayNameTooLong` | `نام نمایشی باید حداکثر {max} نویسه باشد.`      | `The display name can be at most {max} characters.` | Error when the text is too long.    |
| `username`           | نام کاربری                                      | Username                                            | Field label.                        |
| `usernameHint`       | نام کاربری قابل تغییر نیست.                     | Your username can’t be changed.                     | Under the read-only username field. |
| `submit`             | ذخیره تغییرات                                   | Save changes                                        | Main (action) button.               |
| `saved`              | پروفایل ذخیره شد                                | Profile saved                                       | Toast.                              |

### `settings.password`

**Where:** Settings → Change password section.

| Key              | فارسی                                             | English                                                 | Where / what                      |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| `title`          | تغییر رمز عبور                                    | Change password                                         | Heading.                          |
| `subtitle`       | پس از تغییر، در دستگاه‌های دیگر دوباره وارد شوید. | After changing it, sign in again on your other devices. | Under the section title.          |
| `current`        | رمز فعلی                                          | Current password                                        | Field label.                      |
| `currentMissing` | رمز فعلی را وارد کنید.                            | Enter your current password.                            | Error when the field is empty.    |
| `currentWrong`   | رمز فعلی درست نیست.                               | The current password is incorrect.                      | Error message.                    |
| `new`            | رمز جدید                                          | New password                                            | Field label.                      |
| `newHint`        | `دست‌کم {min} نویسه.`                             | `At least {min} characters.`                            | Hint under the new password.      |
| `newTooShort`    | `رمز جدید باید دست‌کم {min} نویسه باشد.`          | `The new password must be at least {min} characters.`   | Error when the text is too short. |
| `newTooLong`     | `رمز جدید باید حداکثر {max} نویسه باشد.`          | `The new password can be at most {max} characters.`     | Error when the text is too long.  |
| `newSame`        | رمز جدید با رمز فعلی یکی است.                     | The new password is the same as the current one.        | Error message.                    |
| `repeat`         | تکرار رمز جدید                                    | Repeat new password                                     | Field label.                      |
| `repeatMismatch` | تکرار رمز با رمز جدید یکسان نیست.                 | The repeated password doesn’t match the new one.        | Error message.                    |
| `submit`         | تغییر رمز عبور                                    | Change password                                         | Main (action) button.             |
| `changed`        | رمز عبور تغییر کرد                                | Password changed                                        | Toast.                            |

### `settings.display`

**Where:** Settings → Display section (language, calendar, rial/toman, theme).

| Key         | فارسی                                    | English                                             | Where / what                        |
| ----------- | ---------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| `title`     | نمایش                                    | Display                                             | Heading.                            |
| `subtitle`  | زبان، تقویم و ظاهر برنامه برای حساب شما. | Language, calendar and appearance for your account. | Line under the heading.             |
| `tomanNote` | هر تومان برابر ده ریال است.              | One toman equals ten rials.                         | Hint under the rial / toman choice. |
| `themeNote` | فقط روی همین دستگاه.                     | On this device only.                                | Hint under the theme choice.        |

### `settings.data`

**Where:** Settings: link cards to Accounts and Categories.

| Key          | فارسی                                    | English                                               | Where / what                        |
| ------------ | ---------------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| `title`      | حساب‌ها و دسته‌بندی‌ها                   | Accounts and categories                               | Heading.                            |
| `accounts`   | کارت‌ها، پول نقد و موجودی اولیهٔ هر کدام | Cards, cash and the starting balance of each          | Description of the Accounts link.   |
| `categories` | دسته‌ها و زیردسته‌های هزینه و درآمد      | Expense and income categories and their subcategories | Description of the Categories link. |

### `settings.claude`

**Where:** Settings: link card to the Claude connector page.

| Key         | فارسی                                       | English                                                | Where / what                              |
| ----------- | ------------------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| `title`     | Claude                                      | Claude                                                 | Heading.                                  |
| `connector` | ثبت تراکنش و پرسش دربارهٔ خرج‌ها با گفت‌وگو | Record transactions and ask about spending by chatting | Description of the Claude connector link. |

### `settings.book`

**Where:** Settings → Book settings (admins only): the book's currency.

| Key        | فارسی                                                                                | English                                                                                                   | Where / what                            |
| ---------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `title`    | تنظیمات دفتر                                                                         | Book settings                                                                                             | Heading.                                |
| `subtitle` | برای همه‌ی کاربران این دفتر اعمال می‌شود.                                            | Applies to everyone using this book.                                                                      | Under the section title.                |
| `locked`   | پس از ثبت اولین مبلغ (تراکنش، بودجه یا موجودی اولیه)، واحد پول دفتر قابل تغییر نیست. | The book’s currency can’t change once it holds an amount (a transaction, a budget or an opening balance). | When the currency can no longer change. |
| `open`     | تا پیش از ثبت اولین مبلغ می‌توانید آن را تغییر دهید.                                 | You can change it until the first amount is recorded.                                                     | When it still can.                      |
| `changed`  | واحد پول دفتر تغییر کرد                                                              | Book currency changed                                                                                     | Toast.                                  |
