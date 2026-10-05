/*
 * English interface copy. Same keys as fa.ts (checked by the `Messages` type). Sentence case,
 * calm and short; see the copy rules in CLAUDE.md.
 */
import type { Messages } from "./fa";

const en: Messages = {
  metadata: {
    appName: "Money",
    description: "Personal accounting",
  },
  common: {
    close: "Close",
    cancel: "Cancel",
    optional: "(optional)",
    search: "Search",
    clear: "Clear",
    remove: "Remove",
    choose: "Choose",
    showOptions: "Show options",
    count: "{count} of {max}",
    today: "Today",
    yesterday: "Yesterday",
  },
  transactionType: {
    income: "Income",
    expense: "Expense",
    transfer: "Transfer",
  },
  role: {
    admin: "Admin",
    editor: "Editor",
    viewer: "Viewer",
  },
  categoryColor: {
    red: "Red",
    orange: "Orange",
    amber: "Amber",
    lime: "Lime",
    green: "Green",
    teal: "Teal",
    sky: "Sky blue",
    violet: "Violet",
    pink: "Pink",
    brown: "Brown",
    slate: "Gray",
  },
  calendar: {
    previousMonth: "Previous month",
    nextMonth: "Next month",
    pickDate: "Pick a date",
  },
  amountField: {
    equivalent: "Equals {amount}",
  },
  combobox: {
    placeholder: "Search categories",
    empty: "No category with this name.",
  },
  budget: {
    over: "{amount} over budget",
    near: "Near the limit, {amount} left",
    left: "{amount} left",
    values: "{value} of {max}",
    meter: "{percent}, {status}",
  },
  preferences: {
    language: "Language",
    calendar: "Calendar",
    calendars: {
      jalali: "Solar Hijri (Jalali)",
      gregorian: "Gregorian",
    },
    currency: "Currency",
    currencies: {
      IRR: "Iranian rial",
      USD: "US dollar",
      EUR: "Euro",
      GBP: "British pound",
    },
    rialUnit: "Show amounts in",
    rialUnits: {
      rial: "Rial",
      toman: "Toman",
    },
    theme: "Theme",
    themes: {
      light: "Light",
      dark: "Dark",
      system: "System",
    },
  },
  login: {
    title: "Sign in to Money",
    username: "Username",
    usernameMissing: "Enter your username.",
    password: "Password",
    passwordMissing: "Enter your password.",
    showPassword: "Show password",
    submit: "Sign in",
    note: "Only an admin can create accounts. Ask your admin for access.",
    retryIn: "Try again in",
    alerts: {
      wrong: "The username or password is incorrect.",
      disabled:
        "This account has been disabled. Contact your admin to turn it back on.",
      locked:
        "Sign-in failed several times in a row. To protect the account, sign-in is paused for a while.",
      failed: "Couldn’t sign in. Check your internet connection and try again.",
      success: "Signed in.",
    },
  },
  nav: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    budgets: "Budget",
    reports: "Reports",
    settings: "Settings",
    users: "User management",
  },
  shell: {
    skipToContent: "Skip to main content",
    menu: "Main menu",
    sections: "Sections",
    account: "Account",
    collapse: "Collapse menu",
    expand: "Expand menu",
    back: "Back",
    signOut: "Sign out",
  },
  addTransaction: {
    title: "Add transaction",
    short: "Add",
    placeholder:
      "The form for expenses, income and transfers is coming here soon.",
  },
  page: {
    loading: "Loading",
    placeholderTitle: "This page isn’t built yet",
    error: {
      title: "Something went wrong",
      description:
        "This page couldn’t load. Check your internet connection and try again.",
      retry: "Try again",
    },
    notFound: {
      eyebrow: "Error 404",
      title: "Page not found",
      description: "The page you’re looking for doesn’t exist or has moved.",
      backHome: "Back to dashboard",
    },
  },
  dashboard: {
    placeholder:
      "Account balances, the month at a glance and recent transactions will appear here.",
  },
  transactions: {
    placeholder: "The transaction list with search and filters will go here.",
  },
  budgets: {
    placeholder:
      "Each category’s monthly budget and how much of it is spent will appear here.",
  },
  reports: {
    placeholder: "Spending and income by category and by month will go here.",
  },
  users: {
    subtitle: "Only admins can create accounts.",
    placeholder:
      "The user list, each person’s role and new-account creation will go here.",
  },
  settings: {
    subtitle: "Profile, password and display",
    failed: "Couldn’t save. Check your internet connection and try again.",
    profile: {
      title: "Profile",
      subtitle: "The name shown across the app and in reports.",
      displayName: "Display name",
      displayNameMissing: "Enter a display name.",
      displayNameTooLong: "The display name can be at most {max} characters.",
      username: "Username",
      usernameHint: "Your username can’t be changed.",
      submit: "Save changes",
      saved: "Profile saved",
    },
    password: {
      title: "Change password",
      subtitle: "After changing it, sign in again on your other devices.",
      current: "Current password",
      currentMissing: "Enter your current password.",
      currentWrong: "The current password is incorrect.",
      new: "New password",
      newHint: "At least {min} characters.",
      newTooShort: "The new password must be at least {min} characters.",
      newTooLong: "The new password can be at most {max} characters.",
      newSame: "The new password is the same as the current one.",
      repeat: "Repeat new password",
      repeatMismatch: "The repeated password doesn’t match the new one.",
      submit: "Change password",
      changed: "Password changed",
    },
    display: {
      title: "Display",
      subtitle: "Language, calendar and appearance for your account.",
      tomanNote: "One toman equals ten rials.",
      themeNote: "On this device only.",
    },
    book: {
      title: "Book settings",
      subtitle: "Applies to everyone using this book.",
      locked:
        "The book’s currency can’t change once it holds an amount (a transaction, a budget or an opening balance).",
      open: "You can change it until the first amount is recorded.",
      changed: "Book currency changed",
    },
  },
};

export default en;
