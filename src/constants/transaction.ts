/**
 * Transaction types. Stored as text in `transactions.type`. `receivable` and `payable` (#47) are
 * a debt recorded on a person or lender (a `counterparty` account) without money moving through
 * the book's accounts, such as one from before the book: `receivable` raises what they owe the
 * book, `payable` what the book owes them. Like transfers, they are never income or expense.
 */
export const TRANSACTION_TYPES = [
  "expense",
  "income",
  "transfer",
  "receivable",
  "payable",
] as const;

/** The types that are income or expense: the only ones totals, budgets and reports count. */
export const INCOME_EXPENSE_TYPES = ["expense", "income"] as const;

/** A debt recorded on a counterparty without money moving (see TRANSACTION_TYPES). */
export const DEBT_TYPES = ["receivable", "payable"] as const;

/**
 * What the transaction form chooses between, in its order: the money types, and «طلب/بدهی»
 * (`debt`), which records a loan or a repayment with a person or lender (see DEBT_ACTIONS).
 */
export const TRANSACTION_FORM_KINDS = [
  "expense",
  "income",
  "transfer",
  "debt",
] as const;

/**
 * Where a transaction was recorded. Stored in `transactions.source`. «mcp» is Claude (the
 * first connector), «chatgpt» is ChatGPT through the same MCP endpoint.
 */
export const TRANSACTION_SOURCES = ["web", "mcp", "chatgpt", "csv"] as const;

/**
 * Descriptions that only say «don't know» (daily-transactions marked unknown transactions
 * with «؟»). They are saved as an empty description: what makes a transaction unknown is a
 * missing category, not its description.
 */
export const UNKNOWN_DESCRIPTION_MARKS: readonly string[] = ["؟", "?"];

/**
 * The one free-text field of a transaction. Lists show it on one line and cut long ones off
 * with an ellipsis; the detail shows all of it. Room for an old note merged into it (#133).
 */
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 300;

/** Between a description and a note merged into it (`withNote`, migration 0010). */
export const NOTE_SEPARATOR = " — ";

/** Tags per transaction, and characters per tag. */
export const TRANSACTION_TAGS_MAX = 10;
export const TRANSACTION_TAG_MAX_LENGTH = 30;

/** Rows per page of the transactions list; «نمایش بیشتر» loads the next page. */
export const TRANSACTION_PAGE_SIZE = 50;

/** Existing tags offered as suggestions in the form and the filter, most used first. */
export const TRANSACTION_TAG_SUGGESTIONS_MAX = 200;

/** Characters of a search on the transactions page. */
export const TRANSACTION_SEARCH_MAX_LENGTH = 100;

/**
 * What happened, in the form's «طلب/بدهی» kind, in its order: «قرض دادم», «قرض گرفتم», «پس گرفتم»
 * (they paid the book back), «پس دادم» (the book paid them back). With one of the book's accounts
 * it is saved as a transfer; without one (a debt from before, or no payment) as a receivable or
 * payable. See `debtEntry` in src/helpers/debt.ts.
 */
export const DEBT_ACTIONS = ["lend", "borrow", "collect", "repay"] as const;
