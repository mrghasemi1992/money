import "server-only";

import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
  MCP_ADD_MAX,
  MCP_LIST_DEFAULT,
  MCP_LIST_MAX,
} from "@/constants/connector";
import {
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_NOTE_MAX_LENGTH,
  TRANSACTION_SEARCH_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_TAGS_MAX,
  TRANSACTION_TYPES,
} from "@/constants/transaction";
import { WEEKDAY_NAMES } from "@/constants/calendar";
import { listAccounts } from "@/db/accounts";
import { listCategories } from "@/db/categories";
import {
  checkTransactionReferences,
  createTransactions,
  deleteTransactions,
  findSimilarTransactions,
  getTransactionInput,
  listAccountOptions,
  listTransactions,
  type StoredTransaction,
  transactionTotals,
  updateTransaction,
} from "@/db/transactions";
import { getUserStatus } from "@/db/users";
import {
  CONNECTOR_DATE_FORMATS,
  formatConnectorDate,
  fromMinorUnits,
  parseConnectorDate,
  toMinorUnits,
} from "@/helpers/connector";
import { maskIdentifier } from "@/helpers/account-identifier";
import { canWrite } from "@/helpers/role";
import { assistantName } from "@/helpers/transaction-source";
import {
  isUnknownTransaction,
  type TransactionError,
  transactionErrors,
  transactionSchema,
} from "@/helpers/transaction";
import type { CategoryTree } from "@/types/category";
import type { McpUser } from "@/types/connector";
import type { Currency } from "@/types/currency";
import type { TransactionSource } from "@/types/transaction";
import type {
  AccountOption,
  Transaction,
  TransactionFilters,
  TransactionInput,
} from "@/types/transaction";
import { isoWeekday, todayIso } from "@/utils/iso-date";

/*
 * The Claude connector's tools, modeled on daily-transactions. They use the same queries and
 * rules as the web UI (src/db, transactionSchema, checkTransactionReferences). Dates and
 * amounts are converted at this boundary (src/helpers/connector.ts). Texts here are for
 * Claude, not shown to users, so they are English and not in the messages.
 */

/** Who is acting and how the book looks to them, for one MCP request. */
export type McpContext = {
  user: McpUser;
  currency: Currency;
  /** The user's time zone: what their browser last reported, otherwise Asia/Tehran. */
  timeZone: string;
  /** What rows added in this request are recorded as: Claude or ChatGPT, by the token's client. */
  source: TransactionSource;
};

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function json(value: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 1) }],
  };
}

function failure(message: string, details?: unknown): ToolResult {
  return {
    ...json(
      details === undefined
        ? { error: message }
        : { error: message, ...details },
    ),
    isError: true,
  };
}

/** Why a transaction can't be saved, for Claude. */
const ERRORS: Record<TransactionError, string> = {
  amountMissing: "amount must be a positive number.",
  amountTooLarge: "amount is too large.",
  dateMissing: "date is missing or isn't a real date.",
  dateFuture: "date is in the future (see today).",
  accountMissing: "account_id is missing.",
  accountUnavailable:
    "account_id isn't an active account of the book (see list_accounts).",
  toAccountMissing: "a transfer needs to_account_id.",
  toAccountUnavailable:
    "to_account_id isn't an active account of the book (see list_accounts).",
  sameAccount: "a transfer's account_id and to_account_id must differ.",
  categoryMissing: "category_id is missing.",
  categoryUnavailable:
    "category_id isn't an active category of the transaction's type (see list_categories).",
  descriptionTooLong: `description is longer than ${TRANSACTION_DESCRIPTION_MAX_LENGTH} characters.`,
  noteTooLong: `note is longer than ${TRANSACTION_NOTE_MAX_LENGTH} characters.`,
  tagTooLong: `a tag is longer than ${TRANSACTION_TAG_MAX_LENGTH} characters.`,
  tooManyTags: `at most ${TRANSACTION_TAGS_MAX} tags.`,
};

const RULES = { categoryRequired: false };

/** Re-reads the user's role: writing needs editor or admin at the moment of the call. */
async function requireWrite(ctx: McpContext): Promise<ToolResult | null> {
  const status = await getUserStatus(ctx.user.id);
  if (status && !status.disabled && canWrite(status.role)) return null;
  return failure(
    "The user's role is viewer: they can read the book but not change it. An admin can give them the editor role.",
  );
}

/** The user's today (ISO). */
function today(ctx: McpContext): string {
  return todayIso(ctx.timeZone);
}

/** Names of accounts and categories, to show ids with their names. */
type Names = {
  account: (id: string | null) => string | null;
  category: (id: string | null) => string | null;
};

function namesOf(accounts: AccountOption[], categories: CategoryTree): Names {
  const accountNames = new Map(
    accounts.map((account) => [account.id, account.name]),
  );
  const categoryNames = new Map<string, string>();
  for (const category of [...categories.expense, ...categories.income]) {
    categoryNames.set(category.id, category.name);
    for (const sub of category.subcategories) {
      categoryNames.set(sub.id, `${category.name} › ${sub.name}`);
    }
  }
  return {
    account: (id) => (id ? (accountNames.get(id) ?? null) : null),
    category: (id) => (id ? (categoryNames.get(id) ?? null) : null),
  };
}

async function loadNames(): Promise<Names> {
  const [accounts, categories] = await Promise.all([
    listAccountOptions(),
    listCategories(),
  ]);
  return namesOf(accounts, categories);
}

/** A transaction as the tools return it: dates in the user's calendar, amounts in the main unit. */
function view(
  row: StoredTransaction | Transaction,
  ctx: McpContext,
  names: Names | null,
) {
  const listed = "account" in row ? row : null;
  const category = listed?.category
    ? listed.category.parentName
      ? `${listed.category.parentName} › ${listed.category.name}`
      : listed.category.name
    : (names?.category(row.categoryId) ?? null);
  return {
    id: row.id,
    date: formatConnectorDate(row.date, ctx.user.calendar),
    type: row.type,
    amount: fromMinorUnits(row.amount, ctx.currency),
    account_id: row.accountId,
    account: listed?.account.name ?? names?.account(row.accountId) ?? null,
    ...(row.type === "transfer"
      ? {
          to_account_id: row.toAccountId,
          to_account:
            listed?.toAccount?.name ?? names?.account(row.toAccountId) ?? null,
        }
      : {
          category_id: row.categoryId,
          category,
          ...(isUnknownTransaction(row) ? { unknown: true } : {}),
        }),
    description: row.description,
    ...(row.note ? { note: row.note } : {}),
    tags: row.tags,
    ...(listed
      ? {
          added_by: listed.createdBy.name,
          added_with_assistant: assistantName(listed.source) !== null,
        }
      : {}),
  };
}

const dateInput = z
  .string()
  .max(20)
  .describe(
    "Date: Jalali YYYY/MM/DD (e.g. 1405/07/16) or Gregorian YYYY-MM-DD (e.g. 2026-10-08)",
  );

const typeInput = z.enum(TRANSACTION_TYPES);

const amountInput = z
  .number()
  .positive()
  .describe(
    "Amount in the book's currency (see today): rials for IRR (toman × 10); dollars, euros or pounds with at most two decimals",
  );

const tagsInput = z
  .array(z.string().max(TRANSACTION_TAG_MAX_LENGTH))
  .max(TRANSACTION_TAGS_MAX)
  .describe("Labels, e.g. whose transaction it is");

const newTransactionInput = z.object({
  type: typeInput.describe(
    '"expense" (money spent), "income" (money received) or "transfer" (between two of the book\'s accounts)',
  ),
  date: dateInput,
  amount: amountInput,
  account_id: z
    .uuid()
    .describe("The account (for a transfer: the one money leaves)"),
  to_account_id: z
    .uuid()
    .optional()
    .describe("Transfers only: the account money goes to"),
  category_id: z
    .uuid()
    .optional()
    .describe(
      "Income and expense only: a category or subcategory of the same type; leave out when unknown",
    ),
  description: z
    .string()
    .max(TRANSACTION_DESCRIPTION_MAX_LENGTH)
    .optional()
    .describe(
      "Optional short label in the user's language, e.g. the shop; shown under the category",
    ),
  note: z.string().max(TRANSACTION_NOTE_MAX_LENGTH).optional(),
  tags: tagsInput.optional(),
});

type Checked = { data: TransactionInput } | { errors: string[] };

/**
 * Converts one transaction from Claude's units, then checks it with the web form's rules and
 * the accounts and category in the database. `current` is the stored transaction when editing.
 */
async function checkTransaction(
  raw: {
    type: TransactionInput["type"];
    date: string | null;
    amount: number | null;
    accountId: string;
    toAccountId: string | null;
    categoryId: string | null;
    description: string;
    note: string;
    tags: string[];
  },
  ctx: McpContext,
  current?: TransactionInput,
): Promise<Checked> {
  const errors: string[] = [];
  if (raw.date === null) {
    errors.push(
      "date isn't a real date: use Jalali YYYY/MM/DD or Gregorian YYYY-MM-DD.",
    );
  }
  if (raw.amount === null) {
    errors.push(
      ctx.currency === "IRR"
        ? "amount must be a positive whole number of rials."
        : "amount must be positive, with at most two decimals.",
    );
  }
  if (errors.length > 0) return { errors };

  const parsed = transactionSchema(today(ctx), RULES).safeParse(raw);
  if (!parsed.success) {
    const found = transactionErrors(raw, today(ctx), RULES);
    return { errors: Object.values(found).map((error) => ERRORS[error]) };
  }
  const problem = await checkTransactionReferences(parsed.data, current);
  if (problem) return { errors: [ERRORS[problem]] };
  return { data: parsed.data };
}

/** Registers the tools for one request: read tools for everyone, write tools for writers. */
export function registerTools(server: McpServer, ctx: McpContext) {
  const writer = canWrite(ctx.user.role);

  server.registerTool(
    "today",
    {
      title: "Today and the book's settings",
      description:
        "The current date in the user's calendar and time zone, the date format to use, the book's currency, the user's language and whether they may change the book. Call it first.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      const iso = today(ctx);
      return json({
        date: formatConnectorDate(iso, ctx.user.calendar),
        weekday: WEEKDAY_NAMES.en[isoWeekday(iso)],
        calendar: ctx.user.calendar,
        date_format: CONNECTOR_DATE_FORMATS[ctx.user.calendar],
        time_zone: ctx.timeZone,
        currency: ctx.currency,
        amount_unit:
          ctx.currency === "IRR"
            ? "rial (integer; toman × 10)"
            : `${ctx.currency} (up to two decimals)`,
        user: {
          name: ctx.user.name,
          language: ctx.user.locale,
          role: ctx.user.role,
          can_write: writer,
        },
      });
    },
  );

  server.registerTool(
    "list_accounts",
    {
      title: "List accounts",
      description:
        "The book's accounts (type bank, cash or other) with their ids and current balances, in the user's order. Bank accounts may carry an identifier (account number, card number or Sheba) shown masked to its last four characters; it is only a hint for telling accounts apart, e.g. a card ending in 6219 in a bank SMS. Use it to map an account name to account_id.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      const accounts = await listAccounts();
      const active = accounts.filter((account) => !account.archived);
      return json({
        currency: ctx.currency,
        total_balance: fromMinorUnits(
          active.reduce((sum, account) => sum + account.balance, 0),
          ctx.currency,
        ),
        accounts: accounts.map((account) => ({
          id: account.id,
          name: account.name,
          type: account.type,
          ...(account.identifier
            ? {
                identifier_kind: account.identifier.kind,
                identifier: maskIdentifier(account.identifier),
              }
            : {}),
          balance: fromMinorUnits(account.balance, ctx.currency),
          ...(account.archived ? { archived: true } : {}),
        })),
      });
    },
  );

  server.registerTool(
    "list_categories",
    {
      title: "List categories",
      description:
        "The book's expense and income categories with their subcategories and ids. A transaction's category must have the transaction's type.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      const tree = await listCategories();
      const shape = (type: keyof CategoryTree) =>
        tree[type].map((category) => ({
          id: category.id,
          name: category.name,
          ...(category.archived ? { archived: true } : {}),
          subcategories: category.subcategories.map((sub) => ({
            id: sub.id,
            name: sub.name,
            ...(sub.archived ? { archived: true } : {}),
          })),
        }));
      return json({ expense: shape("expense"), income: shape("income") });
    },
  );

  server.registerTool(
    "list_transactions",
    {
      title: "List transactions",
      description:
        "Find saved transactions, newest first, with the totals of every matching transaction. All filters are optional. Use it to answer questions about spending, check what is already saved, or look up ids before editing.",
      inputSchema: z.object({
        from: dateInput.optional().describe("First date to include"),
        to: dateInput.optional().describe("Last date to include"),
        types: z.array(typeInput).max(3).optional(),
        account_id: z.uuid().optional().describe("From or to this account"),
        category_id: z
          .uuid()
          .optional()
          .describe("This category (with its subcategories) or subcategory"),
        tag: z.string().max(TRANSACTION_TAG_MAX_LENGTH).optional(),
        search: z
          .string()
          .max(TRANSACTION_SEARCH_MAX_LENGTH)
          .optional()
          .describe("Text in the description, note, tags or category names"),
        unknown_only: z
          .boolean()
          .optional()
          .describe(
            "Only unknown transactions: income and expense without a category",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(MCP_LIST_MAX)
          .optional()
          .describe(`Transactions to list, default ${MCP_LIST_DEFAULT}`),
        cursor: z
          .string()
          .max(200)
          .optional()
          .describe("next_cursor of the previous call, for the next page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      const from = input.from ? parseConnectorDate(input.from) : null;
      const to = input.to ? parseConnectorDate(input.to) : null;
      if ((input.from && !from) || (input.to && !to)) {
        return failure(
          "from and to must be real dates: Jalali YYYY/MM/DD or Gregorian YYYY-MM-DD.",
        );
      }
      const filters: TransactionFilters = {
        from,
        to,
        types: input.types ?? [],
        accountId: input.account_id ?? null,
        categoryId: input.category_id ?? null,
        tag: input.tag?.trim() || null,
        search: input.search ?? "",
        unknownOnly: input.unknown_only ?? false,
      };
      const [page, totals] = await Promise.all([
        listTransactions(
          filters,
          input.cursor,
          input.limit ?? MCP_LIST_DEFAULT,
        ),
        transactionTotals(filters),
      ]);
      return json({
        currency: ctx.currency,
        count: totals.count,
        total_income: fromMinorUnits(totals.income, ctx.currency),
        total_expense: fromMinorUnits(totals.expense, ctx.currency),
        listed: page.rows.length,
        next_cursor: page.nextCursor,
        tags: [...new Set(page.rows.flatMap((row) => row.tags))],
        transactions: page.rows.map((row) => view(row, ctx, null)),
      });
    },
  );

  // Viewers only get the read tools. The write tools check the role again on every call, so a
  // change applies to an open connection right away.
  if (!writer) return;

  server.registerTool(
    "add_transactions",
    {
      title: "Add transactions",
      description: `Save up to ${MCP_ADD_MAX} transactions, all or none. Returns the saved transactions with their ids, and existing transactions with the same date, account, amount and type as possible duplicates.`,
      inputSchema: z.object({
        transactions: z.array(newTransactionInput).min(1).max(MCP_ADD_MAX),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ transactions }) => {
      const denied = await requireWrite(ctx);
      if (denied) return denied;

      const checked = await Promise.all(
        transactions.map((item) =>
          checkTransaction(
            {
              type: item.type,
              date: parseConnectorDate(item.date),
              amount: toMinorUnits(item.amount, ctx.currency),
              accountId: item.account_id,
              toAccountId: item.to_account_id ?? null,
              categoryId: item.category_id ?? null,
              description: item.description ?? "",
              note: item.note ?? "",
              tags: item.tags ?? [],
            },
            ctx,
          ),
        ),
      );
      const invalid = checked.flatMap((result, index) =>
        "errors" in result ? [{ index, errors: result.errors }] : [],
      );
      if (invalid.length > 0) {
        return failure(
          "Nothing was saved. Fix these transactions and try again.",
          {
            invalid,
          },
        );
      }

      const inputs = checked.map((result) =>
        "data" in result ? result.data : null,
      );
      const data = inputs.filter(
        (input): input is TransactionInput => input !== null,
      );
      const similar = await findSimilarTransactions(data);
      const ids = await createTransactions(data, ctx.user.id, ctx.source);
      const names = await loadNames();
      const saved = data.map((input, index) => ({ ...input, id: ids[index]! }));
      const sameKey = (a: TransactionInput, b: TransactionInput) =>
        a.date === b.date &&
        a.accountId === b.accountId &&
        a.amount === b.amount &&
        a.type === b.type;
      const duplicates = saved
        .map((row) => ({
          saved_id: row.id,
          existing: similar
            .filter((existing) => sameKey(existing, row))
            .map((existing) => view(existing, ctx, names)),
        }))
        .filter((entry) => entry.existing.length > 0);
      return json({
        saved: saved.map((row) => view(row, ctx, names)),
        possible_duplicates: duplicates,
      });
    },
  );

  server.registerTool(
    "update_transaction",
    {
      title: "Update a transaction",
      description:
        "Change fields of one saved transaction, e.g. give an unknown one its category. Only the given fields change.",
      inputSchema: z.object({
        id: z.uuid(),
        type: typeInput.optional(),
        date: dateInput.optional(),
        amount: amountInput.optional(),
        account_id: z.uuid().optional(),
        to_account_id: z.uuid().nullable().optional(),
        category_id: z
          .uuid()
          .nullable()
          .optional()
          .describe(
            "null removes the category (the transaction becomes unknown)",
          ),
        description: z
          .string()
          .max(TRANSACTION_DESCRIPTION_MAX_LENGTH)
          .optional(),
        note: z.string().max(TRANSACTION_NOTE_MAX_LENGTH).optional(),
        tags: tagsInput
          .optional()
          .describe("Replaces all tags of the transaction"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (input) => {
      const denied = await requireWrite(ctx);
      if (denied) return denied;

      const current = await getTransactionInput(input.id);
      if (!current) return failure(`No transaction with id ${input.id}.`);
      const checked = await checkTransaction(
        {
          type: input.type ?? current.type,
          date:
            input.date === undefined
              ? current.date
              : parseConnectorDate(input.date),
          amount:
            input.amount === undefined
              ? current.amount
              : toMinorUnits(input.amount, ctx.currency),
          accountId: input.account_id ?? current.accountId,
          toAccountId:
            input.to_account_id === undefined
              ? current.toAccountId
              : input.to_account_id,
          categoryId:
            input.category_id === undefined
              ? current.categoryId
              : input.category_id,
          description: input.description ?? current.description,
          note: input.note ?? current.note,
          tags: input.tags ?? current.tags,
        },
        ctx,
        current,
      );
      if ("errors" in checked) {
        return failure("The transaction wasn't changed.", {
          errors: checked.errors,
        });
      }
      if (!(await updateTransaction(input.id, checked.data, ctx.user.id))) {
        return failure(`No transaction with id ${input.id}.`);
      }
      return json({
        updated: view(
          { ...checked.data, id: input.id },
          ctx,
          await loadNames(),
        ),
      });
    },
  );

  server.registerTool(
    "delete_transactions",
    {
      title: "Delete transactions",
      description:
        "Permanently delete transactions by id. Only use it when the user asked for it, e.g. to remove a duplicate.",
      inputSchema: z.object({
        ids: z.array(z.uuid()).min(1).max(MCP_ADD_MAX),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ ids }) => {
      const denied = await requireWrite(ctx);
      if (denied) return denied;

      const names = await loadNames();
      const deleted = await deleteTransactions(ids);
      const found = new Set(deleted.map((row) => row.id));
      return json({
        deleted: deleted.map((row) => view(row, ctx, names)),
        not_found: ids.filter((id) => !found.has(id)),
      });
    },
  );
}
