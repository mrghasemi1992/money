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
  home: {
    greeting: "سلام {name}. داشبورد به‌زودی اینجا راه می‌افتد.",
  },
};

export default fa;

/** The shape every language's messages must have. */
export type Messages = typeof fa;
