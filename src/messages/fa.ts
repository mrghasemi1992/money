/*
 * Persian interface copy, the source language. en.ts must have exactly the same keys
 * (it is typed as `Messages`). Messages use ICU syntax: {name} for values.
 */
const fa = {
  metadata: {
    appName: "پول",
    description: "حسابداری شخصی",
  },
  common: {
    close: "بستن",
    cancel: "انصراف",
    optional: "(اختیاری)",
    search: "جستجو",
    clear: "پاک کردن",
    remove: "حذف",
    choose: "انتخاب کنید",
    showOptions: "نمایش گزینه‌ها",
    count: "{count} از {max}",
    today: "امروز",
    yesterday: "دیروز",
  },
  transactionType: {
    income: "درآمد",
    expense: "هزینه",
    transfer: "انتقال",
  },
  role: {
    admin: "مدیر",
    editor: "ویرایشگر",
    viewer: "بیننده",
  },
  categoryColor: {
    red: "قرمز",
    orange: "نارنجی",
    amber: "کهربایی",
    lime: "لیمویی",
    green: "سبز",
    teal: "سبزآبی",
    sky: "آبی آسمانی",
    violet: "بنفش",
    pink: "صورتی",
    brown: "قهوه‌ای",
    slate: "خاکستری",
  },
  calendar: {
    previousMonth: "ماه قبل",
    nextMonth: "ماه بعد",
    pickDate: "انتخاب تاریخ",
  },
  amountField: {
    equivalent: "معادل {amount}",
  },
  combobox: {
    placeholder: "جستجوی دسته‌بندی",
    empty: "دسته‌ای با این نام پیدا نشد.",
  },
  budget: {
    over: "{amount} بیش از بودجه",
    near: "نزدیک به سقف، {amount} مانده",
    left: "{amount} مانده",
    values: "{value} از {max}",
    meter: "{percent}، {status}",
  },
  preferences: {
    language: "زبان",
    calendar: "تقویم",
    calendars: {
      jalali: "شمسی",
      gregorian: "میلادی",
    },
    currency: "واحد پول",
    currencies: {
      IRR: "ریال ایران",
      USD: "دلار آمریکا",
      EUR: "یورو",
      GBP: "پوند بریتانیا",
    },
    rialUnit: "نمایش مبلغ‌ها",
    rialUnits: {
      rial: "ریال",
      toman: "تومان",
    },
    theme: "تم",
    themes: {
      light: "روشن",
      dark: "تیره",
      system: "سیستم",
    },
  },
  login: {
    title: "ورود به پول",
    username: "نام کاربری",
    usernameMissing: "نام کاربری را وارد کنید.",
    password: "رمز عبور",
    passwordMissing: "رمز عبور را وارد کنید.",
    showPassword: "نمایش رمز عبور",
    submit: "ورود",
    note: "ایجاد حساب کاربری فقط توسط مدیر امکان‌پذیر است؛ برای دسترسی با مدیر هماهنگ کنید.",
    retryIn: "دوباره امتحان کنید پس از",
    alerts: {
      wrong: "نام کاربری یا رمز عبور درست نیست.",
      disabled: "این حساب غیرفعال شده است. برای فعال‌سازی با مدیر تماس بگیرید.",
      locked:
        "چند بار پشت سر هم ورود ناموفق بود. برای امنیت حساب، ورود موقتاً بسته شده است.",
      failed:
        "ورود انجام نشد. اتصال اینترنت را بررسی کنید و دوباره امتحان کنید.",
      success: "وارد شدید.",
    },
  },
  nav: {
    dashboard: "داشبورد",
    transactions: "تراکنش‌ها",
    budgets: "بودجه",
    reports: "گزارش‌ها",
    settings: "تنظیمات",
    users: "مدیریت کاربران",
  },
  shell: {
    skipToContent: "رفتن به محتوای اصلی",
    menu: "منوی اصلی",
    sections: "بخش‌ها",
    account: "حساب کاربری",
    collapse: "جمع کردن منو",
    expand: "باز کردن منو",
    back: "بازگشت",
    signOut: "خروج",
  },
  addTransaction: {
    title: "افزودن تراکنش",
    short: "افزودن",
    placeholder: "فرم ثبت هزینه، درآمد و انتقال به‌زودی اینجا اضافه می‌شود.",
  },
  page: {
    loading: "در حال بارگذاری",
    placeholderTitle: "این صفحه هنوز ساخته نشده است",
    error: {
      title: "مشکلی پیش آمد",
      description:
        "اطلاعات این صفحه بارگذاری نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
      retry: "تلاش دوباره",
    },
    notFound: {
      eyebrow: "خطای ۴۰۴",
      title: "صفحه پیدا نشد",
      description: "صفحه‌ای که دنبالش هستید وجود ندارد یا جابه‌جا شده است.",
      backHome: "بازگشت به داشبورد",
    },
  },
  dashboard: {
    placeholder:
      "موجودی حساب‌ها، خلاصه‌ی ماه و آخرین تراکنش‌ها اینجا نمایش داده می‌شود.",
  },
  transactions: {
    placeholder: "فهرست تراکنش‌ها با جست‌وجو و فیلتر اینجا قرار می‌گیرد.",
  },
  budgets: {
    placeholder:
      "بودجه‌ی ماهانه‌ی هر دسته‌بندی و میزان مصرف آن اینجا نمایش داده می‌شود.",
  },
  reports: {
    placeholder:
      "گزارش هزینه و درآمد به تفکیک دسته‌بندی و ماه اینجا قرار می‌گیرد.",
  },
  users: {
    subtitle: "حساب‌ها فقط به دست مدیر ساخته می‌شوند.",
    placeholder:
      "فهرست کاربران، نقش هر کاربر و ساخت حساب جدید اینجا قرار می‌گیرد.",
  },
  settings: {
    subtitle: "پروفایل، رمز عبور و نمایش",
    failed: "ذخیره نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
    profile: {
      title: "پروفایل",
      subtitle: "نامی که در برنامه و گزارش‌ها نمایش داده می‌شود.",
      displayName: "نام نمایشی",
      displayNameMissing: "نام نمایشی را وارد کنید.",
      displayNameTooLong: "نام نمایشی باید حداکثر {max} نویسه باشد.",
      username: "نام کاربری",
      usernameHint: "نام کاربری قابل تغییر نیست.",
      submit: "ذخیره تغییرات",
      saved: "پروفایل ذخیره شد",
    },
    password: {
      title: "تغییر رمز عبور",
      subtitle: "پس از تغییر، در دستگاه‌های دیگر دوباره وارد شوید.",
      current: "رمز فعلی",
      currentMissing: "رمز فعلی را وارد کنید.",
      currentWrong: "رمز فعلی درست نیست.",
      new: "رمز جدید",
      newHint: "دست‌کم {min} نویسه.",
      newTooShort: "رمز جدید باید دست‌کم {min} نویسه باشد.",
      newTooLong: "رمز جدید باید حداکثر {max} نویسه باشد.",
      newSame: "رمز جدید با رمز فعلی یکی است.",
      repeat: "تکرار رمز جدید",
      repeatMismatch: "تکرار رمز با رمز جدید یکسان نیست.",
      submit: "تغییر رمز عبور",
      changed: "رمز عبور تغییر کرد",
    },
    display: {
      title: "نمایش",
      subtitle: "زبان، تقویم و ظاهر برنامه برای حساب شما.",
      tomanNote: "هر تومان برابر ده ریال است.",
      themeNote: "فقط روی همین دستگاه.",
    },
    book: {
      title: "تنظیمات دفتر",
      subtitle: "برای همه‌ی کاربران این دفتر اعمال می‌شود.",
      locked:
        "پس از ثبت اولین مبلغ (تراکنش، بودجه یا موجودی اولیه)، واحد پول دفتر قابل تغییر نیست.",
      open: "تا پیش از ثبت اولین مبلغ می‌توانید آن را تغییر دهید.",
      changed: "واحد پول دفتر تغییر کرد",
    },
  },
};

export default fa;

/** The shape every language's messages must have. */
export type Messages = typeof fa;
