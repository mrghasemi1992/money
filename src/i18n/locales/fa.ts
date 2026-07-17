import type { Dictionary } from '@/i18n/types';

export const fa: Dictionary = {
  brand: 'پول',
  theme: {
    light: 'روشن',
    dark: 'تیره',
    system: 'سیستم',
  },
  nav: {
    primaryLabel: 'ناوبری اصلی',
    dashboard: 'داشبورد',
    transactions: 'تراکنش‌ها',
    reports: 'گزارش‌ها',
    budgets: 'بودجه‌ها',
    addTransaction: 'افزودن تراکنش',
    collapseNavigation: 'بستن نوار کناری',
    expandNavigation: 'باز کردن نوار کناری',
    skipToContent: 'پرش به محتوا',
    language: 'زبان',
    theme: 'پوسته',
    route: 'مسیر',
    placeholderText: 'محتوای صفحه اینجا نمایش داده می‌شود',
  },
  emptyState: {
    title: 'هنوز تراکنشی ثبت نشده',
    body: 'یک حساب اضافه کنید یا صورتحساب وارد کنید — تراکنش‌ها اینجا، خط به خط، نمایش داده می‌شوند.',
    cta: 'افزودن تراکنش',
  },
  designSystem: {
    eyebrow: 'Settle',
    title: 'سیستم طراحی',
    lede: 'توکن‌ها و اجزای پایه برای یک اپ دفترکل محلی — مرجع یکتایی که تمام صفحات از آن ساخته می‌شوند.',
    color: {
      title: 'رنگ',
      neutralLabels: {
        bg: 'پس‌زمینه',
        surface: 'سطح',
        border: 'حاشیه',
        mutedText: 'متن کم‌رنگ',
        text: 'متن',
      },
      accentLabel: 'برنجی — تاکیدی',
      negativeLabel: 'زنگاری — منفی',
      description:
        'مبالغ مثبت رنگ اختصاصی ندارند — فقط رنگ متن اصلی به‌همراه پیشوند «+». نشان‌های دسته‌بندی هرگز از رنگ زنگاری استفاده نمی‌کنند، تا هیچ نشان دسته‌ای معنای «این یک ضرر است» را نگیرد.',
      testBadge: 'تست',
    },
    type: {
      title: 'تایپوگرافی',
      displayLabel: 'نمایش · 600 · 34/1.15',
      bodyLabel: 'متن · 400 · 16/1.55',
      numericLabel: 'عددی · 500 · tabular-nums',
      captionLabel: 'زیرنویس · 400 · 13/1.4',
      withoutTabular: 'بدون tabular-nums',
      withTabular: 'با tabular-nums',
    },
    spacing: {
      title: 'فاصله‌گذاری و شعاع',
    },
    elevation: {
      title: 'سایه‌اندازی',
    },
    button: {
      title: 'دکمه',
      primary: 'اصلی',
      secondary: 'ثانویه',
      ghost: 'شبح',
      destructive: 'مخرب',
      disabledSuffix: ' — غیرفعال',
    },
    input: {
      title: 'ورودی',
      accountName: 'نام حساب',
      accountPlaceholder: 'حساب جاری — اصلی',
      accountHint: 'در صورت‌حساب‌ها و خروجی‌ها نمایش داده می‌شود.',
      openingBalance: 'موجودی اولیه',
      openingError: 'یک عدد معتبر وارد کنید.',
      currency: 'واحد پول',
    },
    card: {
      title: 'کارت',
      defaultLabel: 'پیش‌فرض',
      interactiveLabel: 'تعاملی',
      cardTitle: 'اجاره ماهانه',
      cardBody: 'پرداخت خودکار در روز اول',
    },
    table: {
      title: 'ردیف جدول — تراکنش',
      descriptionBefore: 'ستون مبلغ از ',
      descriptionCode: 'text-align: end',
      descriptionAfter:
        ' استفاده می‌کند، نه چپ/راست — کلید زبان بالا را بزنید تا خودبه‌خود آینه شود.',
    },
    toggle: {
      title: 'کلید / سوییچ',
      offExample: 'نمونه خاموش',
      interactiveExample: 'نمونه تعاملی',
      disabledExample: 'نمونه غیرفعال',
      disabledCheckedExample: 'نمونه غیرفعال — انتخاب‌شده',
    },
    emptyStateTitle: 'حالت خالی',
  },
};
