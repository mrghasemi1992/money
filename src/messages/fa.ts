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
    undo: "واگرد",
    viewOnly: "فقط مشاهده",
    listSeparator: "، ",
    transactionCount:
      "{countNumber, plural, =0 {بدون تراکنش} other {{count} تراکنش}}",
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
    subtitle: "ورود به پول فقط با حسابی است که اینجا می‌سازید.",
    newUser: "کاربر جدید",
    search: "جستجوی نام یا نام کاربری",
    roleFilter: "نقش",
    statusFilter: "وضعیت",
    allRoles: "همه نقش‌ها",
    allStatuses: "همه وضعیت‌ها",
    status: {
      active: "فعال",
      disabled: "غیرفعال",
    },
    summary: "{count} کاربر، {active} فعال",
    columns: {
      user: "کاربر",
      username: "نام کاربری",
      role: "نقش",
      language: "زبان",
      status: "وضعیت",
      created: "تاریخ ساخت",
      actions: "گزینه‌ها",
    },
    you: "شما",
    createdOn: "ساخته‌شده در <date></date>",
    metaSeparator: "، ",
    menu: "گزینه‌های {name}",
    actions: {
      resetPassword: "بازنشانی رمز عبور",
      changeRole: "تغییر نقش",
      disable: "غیرفعال کردن",
      enable: "فعال کردن",
    },
    self: {
      password: "رمز خودتان را در تنظیمات عوض کنید.",
      role: "نقش خودتان را نمی‌توانید تغییر دهید.",
      disable: "حساب خودتان را نمی‌توانید غیرفعال کنید.",
    },
    lastAdmin: "دست‌کم یک مدیر فعال باید بماند.",
    failed: "انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
    empty: {
      title: "هنوز کاربر دیگری نساخته‌اید",
      description: "برای هر نفر یک حساب با نقش مناسب بسازید.",
    },
    noResults: {
      title: "کاربری پیدا نشد",
      description: "نام یا نام کاربری دیگری را جستجو کنید.",
      clear: "پاک کردن فیلترها",
    },
    roleDescriptions: {
      admin: "همه‌چیز، به‌علاوه مدیریت کاربران",
      editor: "دیدن و تغییر همه داده‌ها",
      viewer: "فقط دیدن",
    },
    form: {
      title: "کاربر جدید",
      name: "نام نمایشی",
      namePlaceholder: "مثلاً سارا رحیمی",
      username: "نام کاربری",
      usernameHint: "حروف لاتین، عدد، نقطه و زیرخط.",
      password: "رمز موقت",
      passwordHint:
        "این رمز را به کاربر بدهید. بعداً می‌تواند در تنظیمات عوضش کند.",
      generate: "ساختن رمز تازه",
      copy: "کپی رمز",
      role: "نقش",
      language: "زبان",
      languageHint:
        "تقویم پیش‌فرض را هم تعیین می‌کند: فارسی با تقویم شمسی، English با میلادی.",
      submit: "ساخت کاربر",
      errors: {
        nameMissing: "نام نمایشی را وارد کنید.",
        nameTooLong: "نام نمایشی باید حداکثر {max} نویسه باشد.",
        usernameMissing: "نام کاربری را وارد کنید.",
        usernameTooShort: "نام کاربری باید دست‌کم {min} نویسه باشد.",
        usernameTooLong: "نام کاربری باید حداکثر {max} نویسه باشد.",
        usernameInvalid:
          "نام کاربری فقط حروف لاتین، عدد، نقطه و زیرخط می‌پذیرد.",
        usernameTaken: "این نام کاربری قبلاً گرفته شده است.",
        passwordTooShort: "رمز موقت باید دست‌کم {min} نویسه باشد.",
        passwordTooLong: "رمز موقت باید حداکثر {max} نویسه باشد.",
      },
    },
    role: {
      title: "تغییر نقش",
      description: "نقش تازه {name} را انتخاب کنید.",
      submit: "ذخیره نقش",
    },
    demote: {
      title: "حذف دسترسی مدیر؟",
      description:
        "{name} دیگر نمی‌تواند کاربران را مدیریت کند و نقشش «{role}» می‌شود.",
      submit: "حذف دسترسی مدیر",
    },
    disable: {
      title: "غیرفعال کردن کاربر؟",
      description:
        "{name} (<username></username>) دیگر نمی‌تواند وارد شود و از همه دستگاه‌ها خارج می‌شود. حساب و داده‌هایش حذف نمی‌شود و هر وقت بخواهید می‌توانید دوباره فعالش کنید.",
      submit: "غیرفعال کردن کاربر",
    },
    reset: {
      title: "بازنشانی رمز عبور؟",
      description:
        "رمز فعلی {name} دیگر کار نمی‌کند، از همه دستگاه‌ها خارج می‌شود و یک رمز موقت تازه ساخته می‌شود.",
      submit: "بازنشانی رمز",
      shownTitle: "رمز موقت تازه",
      shownDescription: "این رمز را کپی کنید و به {name} بدهید.",
      once: "این رمز فقط همین یک بار نمایش داده می‌شود و بعد از بستن دیگر دیده نمی‌شود.",
      copy: "کپی رمز",
      copied: "کپی شد",
      done: "تمام شد",
    },
    toasts: {
      created: "حساب «{name}» ساخته شد",
      roleChanged: "نقش تغییر کرد",
      roleChangedDescription: "{name} اکنون {role} است.",
      disabled: "کاربر غیرفعال شد",
      enabled: "کاربر فعال شد",
      copied: "رمز کپی شد",
      copyFailed: "کپی نشد. رمز را انتخاب و دستی کپی کنید.",
    },
  },
  accounts: {
    title: "حساب‌ها",
    subtitle: "کارت‌های بانکی، پول نقد و هر جای دیگری که پولتان آنجاست",
    add: "افزودن حساب",
    list: "فهرست حساب‌ها",
    total: "موجودی کل",
    totalNote:
      "{archived, select, true {{count} حساب فعال، بدون حساب‌های بایگانی‌شده} other {{count} حساب فعال}}",
    types: {
      card: "کارت بانکی",
      cash: "نقدی",
      other: "سایر",
    },
    menu: "گزینه‌های {name}",
    actions: {
      edit: "ویرایش",
      moveUp: "انتقال به بالا",
      moveDown: "انتقال به پایین",
      archive: "بایگانی",
      restore: "بازگردانی",
      delete: "حذف",
    },
    dragHandle: "جابه‌جا کردن {name}",
    dragHint:
      "برای تغییر ترتیب، ردیف را از دستگیره بکشید. فرم ثبت تراکنش هم حساب‌ها را به همین ترتیب نشان می‌دهد.",
    moveHint:
      "ترتیب را از منوی هر حساب تغییر دهید. فرم ثبت تراکنش هم حساب‌ها را به همین ترتیب نشان می‌دهد.",
    archived: "بایگانی‌شده ({count})",
    archivedNote: "در فرم‌ها نمی‌آیند؛ تاریخچه‌شان می‌ماند.",
    form: {
      newTitle: "حساب جدید",
      editTitle: "ویرایش حساب",
      name: "نام",
      namePlaceholder: "مثلاً کارت بانک ملت",
      type: "نوع",
      opening: "موجودی اولیه",
      openingHint:
        "موجودی حساب در روزی که استفاده از پول را شروع می‌کنید. می‌تواند صفر یا منفی باشد.",
      openingHintEdit:
        "موجودی فعلی بر اساس این مبلغ و تراکنش‌های حساب دوباره حساب می‌شود.",
      submitNew: "افزودن حساب",
      submitEdit: "ذخیره تغییرات",
      errors: {
        nameMissing: "نام را وارد کنید.",
        nameTooLong: "نام حساب باید حداکثر {max} نویسه باشد.",
        nameTaken: "حسابی با این نام وجود دارد.",
      },
    },
    delete: {
      title: "حذف حساب؟",
      description: "«{name}» برای همیشه حذف می‌شود.",
      submit: "حذف حساب",
    },
    blocked: {
      title: "این حساب حذف نمی‌شود",
      description:
        "«{name}» {count} تراکنش دارد و حسابی که تراکنش دارد حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید و تاریخچه‌اش بماند.",
      archivedDescription:
        "«{name}» {count} تراکنش دارد و حسابی که تراکنش دارد حذف نمی‌شود. بایگانی‌شده می‌ماند تا تاریخچه‌اش حفظ شود.",
      submit: "بایگانی حساب",
    },
    empty: {
      title: "هنوز حسابی تعریف نکرده‌اید",
      description:
        "کارت بانکی، کیف پول نقدی یا هر حساب دیگری را اضافه کنید تا بتوانید تراکنش ثبت کنید.",
      viewerTitle: "هنوز حسابی تعریف نشده است",
      viewerDescription:
        "وقتی ویرایشگر یا مدیر حسابی بسازد، اینجا دیده می‌شود.",
    },
    error: "حساب‌ها بارگذاری نشد",
    failed: "انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
    inUse:
      "این حساب تراکنش دارد و حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید.",
    toasts: {
      added: "حساب افزوده شد",
      saved: "تغییرات ذخیره شد",
      archived: "«{name}» بایگانی شد",
      restored: "«{name}» بازگردانی شد",
      deleted: "«{name}» حذف شد",
    },
  },
  categories: {
    title: "دسته‌بندی‌ها",
    subtitle: "دسته‌ها و زیردسته‌هایی که به هر تراکنش می‌دهید",
    add: "افزودن دسته",
    type: "نوع دسته",
    list: "دسته‌های {type}",
    subcategoryCount: "{countNumber, plural, other {{count} زیردسته}}",
    addSubcategory: "زیردسته",
    addSubcategoryLabel: "افزودن زیردسته به {name}",
    menu: "گزینه‌های {name}",
    actions: {
      edit: "تغییر نام و رنگ",
      addSubcategory: "افزودن زیردسته",
      rename: "تغییر نام",
      archive: "بایگانی",
      restore: "بازگردانی",
      delete: "حذف",
    },
    archived: "بایگانی‌شده ({count})",
    archivedNote:
      "در فرم‌ها نمی‌آیند؛ تراکنش‌های قبلی‌شان در گزارش‌ها می‌ماند.",
    form: {
      newTitle:
        "{type, select, expense {دستهٔ هزینهٔ جدید} other {دستهٔ درآمد جدید}}",
      editTitle: "ویرایش دسته",
      newSubTitle: "زیردستهٔ جدید",
      editSubTitle: "تغییر نام زیردسته",
      underParent: "زیرمجموعهٔ «{name}»",
      name: "نام",
      namePlaceholder: "مثلاً خوراک",
      subPlaceholder: "مثلاً رستوران",
      color: "رنگ",
      colorHintEdit: "زیردسته‌ها هم همین رنگ را می‌گیرند.",
      colorFromParent: "زیردسته رنگ دستهٔ والد را می‌گیرد.",
      submitNew: "افزودن دسته",
      submitNewSub: "افزودن زیردسته",
      submitEdit: "ذخیره تغییرات",
      errors: {
        nameMissing: "نام را وارد کنید.",
        nameTooLong: "نام دسته باید حداکثر {max} نویسه باشد.",
        nameTaken: "دسته‌ای با این نام وجود دارد.",
      },
    },
    delete: {
      title: "حذف دسته؟",
      subTitle: "حذف زیردسته؟",
      description: "«{name}» برای همیشه حذف می‌شود.",
      withSubcategories:
        "«{name}» و {count} زیردسته‌اش برای همیشه حذف می‌شوند.",
      submit: "حذف دسته",
      subSubmit: "حذف زیردسته",
    },
    blocked: {
      title: "این دسته حذف نمی‌شود",
      subTitle: "این زیردسته حذف نمی‌شود",
      description:
        "«{name}» در {count} تراکنش به کار رفته و حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید و گزارش‌ها دست نخورد.",
      archivedDescription:
        "«{name}» در {count} تراکنش به کار رفته و حذف نمی‌شود. بایگانی‌شده می‌ماند تا گزارش‌ها دست نخورد.",
      submit: "بایگانی دسته",
      subSubmit: "بایگانی زیردسته",
    },
    empty: {
      title:
        "{type, select, expense {هنوز دستهٔ هزینه‌ای ندارید} other {هنوز دستهٔ درآمدی ندارید}}",
      description:
        "با یک ضربه از پیشنهادها شروع کنید یا دستهٔ خودتان را بسازید.",
      noStartersDescription: "دستهٔ خودتان را بسازید.",
      viewerTitle: "هنوز دسته‌ای تعریف نشده است",
      viewerDescription:
        "وقتی ویرایشگر یا مدیر دسته‌ای بسازد، اینجا دیده می‌شود.",
    },
    starters: {
      title: "پیشنهادها",
      addAll: "افزودن همه",
      addOwn: "ساخت دستهٔ دلخواه",
      add: "افزودن {name}",
      includes:
        "{countNumber, plural, =0 {بدون زیردسته} other {همراه با {count} زیردسته}}",
    },
    error: "دسته‌بندی‌ها بارگذاری نشد",
    failed: "انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
    inUse:
      "این دسته در تراکنش‌ها به کار رفته و حذف نمی‌شود. بایگانی‌اش کنید تا در فرم‌ها نیاید.",
    toasts: {
      added: "دسته افزوده شد",
      subAdded: "زیردسته افزوده شد",
      saved: "تغییرات ذخیره شد",
      archived: "«{name}» بایگانی شد",
      restored: "«{name}» بازگردانی شد",
      deleted: "«{name}» حذف شد",
      starterAdded: "«{name}» افزوده شد",
      startersAdded: "پیشنهادها افزوده شدند",
      startersRemoved: "پیشنهادها برداشته شدند",
    },
  },
  settings: {
    subtitle: "حساب‌ها، دسته‌بندی‌ها، پروفایل و نمایش",
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
    data: {
      title: "حساب‌ها و دسته‌بندی‌ها",
      accounts: "کارت‌ها، پول نقد و موجودی اولیهٔ هر کدام",
      categories: "دسته‌ها و زیردسته‌های هزینه و درآمد",
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
