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
  home: {
    greeting: "Hello {name}. The dashboard is coming here soon.",
  },
};

export default en;
