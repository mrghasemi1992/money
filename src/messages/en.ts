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
    undo: "Undo",
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
    subtitle: "People can only sign in with an account you create here.",
    newUser: "New user",
    search: "Search name or username",
    roleFilter: "Role",
    statusFilter: "Status",
    allRoles: "All roles",
    allStatuses: "All statuses",
    status: {
      active: "Active",
      disabled: "Disabled",
    },
    summary:
      "{countNumber, plural, one {{count} user} other {{count} users}}, {active} active",
    columns: {
      user: "User",
      username: "Username",
      role: "Role",
      language: "Language",
      status: "Status",
      created: "Created",
      actions: "Options",
    },
    you: "You",
    createdOn: "Created <date></date>",
    metaSeparator: ", ",
    menu: "Options for {name}",
    actions: {
      resetPassword: "Reset password",
      changeRole: "Change role",
      disable: "Disable",
      enable: "Enable",
    },
    self: {
      password: "Change your own password in Settings.",
      role: "You can’t change your own role.",
      disable: "You can’t disable your own account.",
    },
    lastAdmin: "At least one active admin must remain.",
    failed: "That didn’t work. Check your internet connection and try again.",
    empty: {
      title: "No other users yet",
      description: "Create an account with the right role for each person.",
    },
    noResults: {
      title: "No users found",
      description: "Try a different name or username.",
      clear: "Clear filters",
    },
    roleDescriptions: {
      admin: "Everything, plus managing users",
      editor: "Read and change all data",
      viewer: "Read only",
    },
    form: {
      title: "New user",
      name: "Display name",
      namePlaceholder: "e.g. Sara Rahimi",
      username: "Username",
      usernameHint: "Latin letters, digits, dots and underscores.",
      password: "Temporary password",
      passwordHint:
        "Give this password to them. They can change it later in Settings.",
      generate: "Generate new password",
      copy: "Copy password",
      role: "Role",
      language: "Language",
      languageHint:
        "Also sets their default calendar: فارسی uses Jalali, English uses Gregorian.",
      submit: "Create user",
      errors: {
        nameMissing: "Enter a display name.",
        nameTooLong: "Use at most {max} characters for the display name.",
        usernameMissing: "Enter a username.",
        usernameTooShort: "Use at least {min} characters for the username.",
        usernameTooLong: "Use at most {max} characters for the username.",
        usernameInvalid:
          "Use only Latin letters, digits, dots and underscores in the username.",
        usernameTaken: "This username is already taken.",
        passwordTooShort: "Use at least {min} characters.",
        passwordTooLong: "Use at most {max} characters.",
      },
    },
    role: {
      title: "Change role",
      description: "Choose a new role for {name}.",
      submit: "Save role",
    },
    demote: {
      title: "Remove admin rights?",
      description:
        "{name} will no longer be able to manage users. Their role becomes {role}.",
      submit: "Remove admin rights",
    },
    disable: {
      title: "Disable user?",
      description:
        "{name} (<username></username>) won’t be able to sign in and will be signed out everywhere. Their account and data stay, and you can enable it again any time.",
      submit: "Disable user",
    },
    reset: {
      title: "Reset password?",
      description:
        "{name}’s current password will stop working, they’ll be signed out everywhere, and a new temporary password will be created.",
      submit: "Reset password",
      shownTitle: "New temporary password",
      shownDescription: "Copy it and give it to {name}.",
      once: "This password is shown only once. You won’t see it again after closing.",
      copy: "Copy password",
      copied: "Copied",
      done: "Done",
    },
    toasts: {
      created: "Account “{name}” created",
      roleChanged: "Role changed",
      roleChangedDescription: "{name} is now {role}.",
      disabled: "User disabled",
      enabled: "User enabled",
      copied: "Password copied",
      copyFailed: "Couldn’t copy. Select the password and copy it by hand.",
    },
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
