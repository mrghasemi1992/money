import { SAMPLE_ACCOUNTS } from "@/components/account-list/sample-accounts";
import { SAMPLE_CATEGORIES } from "@/components/category-list/sample-categories";
import type { CategoryType } from "@/types/category";
import type {
  AccountOption,
  Transaction,
  TransactionDayTotal,
  TransactionOptions,
  TransactionTotals,
  TransactionType,
} from "@/types/transaction";

/*
 * Transactions for stories, around 7 October 2026 (15 Mehr 1405): names stay Persian, amounts
 * in rials. Categories and accounts come from the other sample files.
 */

/** «Today» in the stories. */
export const SAMPLE_TODAY = "2026-10-07";

const USERS = {
  sara: { id: "1f2e3d4c-0000-4000-8000-000000000001", name: "سارا محمدی" },
  amir: { id: "1f2e3d4c-0000-4000-8000-000000000002", name: "امیر رضایی" },
};

function account(index: number) {
  const { id, name, type } = SAMPLE_ACCOUNTS[index];
  return { id, name, type };
}

/** A category by its name, or «parent / sub» for a subcategory. */
function category(type: CategoryType, path: string) {
  const [parentName, subName] = path.split(" / ");
  const parent = SAMPLE_CATEGORIES[type].find(
    (item) => item.name === parentName,
  );
  if (!parent) throw new Error(`No sample category ${path}`);
  if (!subName) {
    return {
      id: parent.id,
      info: { name: parent.name, parentName: null, color: parent.color },
    };
  }
  const sub = parent.subcategories.find((item) => item.name === subName);
  if (!sub) throw new Error(`No sample subcategory ${path}`);
  return {
    id: sub.id,
    info: { name: sub.name, parentName: parent.name, color: parent.color },
  };
}

let next = 0;

function sample(fields: {
  type: TransactionType;
  date: string;
  amount: number;
  from: number;
  to?: number;
  category?: string;
  description: string;
  note?: string;
  tags?: string[];
  claude?: boolean;
  by?: keyof typeof USERS;
  editedBy?: keyof typeof USERS;
}): Transaction {
  const picked =
    fields.category && fields.type !== "transfer"
      ? category(fields.type, fields.category)
      : null;
  const from = account(fields.from);
  const to = fields.to !== undefined ? account(fields.to) : null;
  const by = USERS[fields.by ?? "sara"];
  const createdAt = `${fields.date}T08:${String(next % 60).padStart(2, "0")}:00.000Z`;
  return {
    id: `9b8c7d6e-0000-4000-8000-${String(++next).padStart(12, "0")}`,
    type: fields.type,
    date: fields.date,
    amount: fields.amount,
    accountId: from.id,
    toAccountId: to?.id ?? null,
    categoryId: picked?.id ?? null,
    description: fields.description,
    note: fields.note ?? "",
    tags: fields.tags ?? [],
    account: from,
    toAccount: to,
    category: picked?.info ?? null,
    source: fields.claude ? "mcp" : "web",
    createdBy: by,
    updatedBy: USERS[fields.editedBy ?? fields.by ?? "sara"],
    createdAt,
    updatedAt: createdAt,
  };
}

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  sample({
    type: "expense",
    date: "2026-10-07",
    amount: 1850000,
    from: 0,
    category: "خوراک / سوپرمارکت",
    description: "خرید هفتگی سوپرمارکت",
    claude: true,
  }),
  sample({
    type: "expense",
    date: "2026-10-07",
    amount: 420000,
    from: 1,
    category: "حمل‌ونقل / تاکسی اینترنتی",
    description: "اسنپ تا دفتر",
    tags: ["کاری"],
  }),
  sample({
    type: "expense",
    date: "2026-10-07",
    amount: 2300000,
    from: 1,
    description: "؟",
    note: "پیامک بانک: خرید کارتی.",
    claude: true,
  }),
  sample({
    type: "transfer",
    date: "2026-10-06",
    amount: 5000000,
    from: 0,
    to: 1,
    description: "انتقال برای خرج ماه",
    by: "amir",
  }),
  sample({
    type: "expense",
    date: "2026-10-06",
    amount: 960000,
    from: 0,
    category: "خانه / قبوض",
    description: "قبض برق",
    by: "amir",
    claude: true,
  }),
  sample({
    type: "expense",
    date: "2026-10-05",
    amount: 3400000,
    from: 2,
    category: "خوراک / رستوران و کافه",
    description: "شام با خانواده",
    tags: ["خانواده"],
    by: "amir",
    editedBy: "sara",
    claude: true,
  }),
  sample({
    type: "income",
    date: "2026-10-04",
    amount: 12000000,
    from: 1,
    category: "کار آزاد / پروژه",
    description: "پروژه طراحی وب‌سایت",
    tags: ["کاری"],
  }),
  sample({
    type: "expense",
    date: "2026-10-02",
    amount: 8500000,
    from: 1,
    category: "تفریح",
    description: "اقامت در رامسر",
    note: "دو شب، با صبحانه.",
    tags: ["سفر شمال", "خانواده"],
    by: "amir",
  }),
  sample({
    type: "income",
    date: "2026-09-23",
    amount: 45000000,
    from: 0,
    category: "حقوق / حقوق ماهانه",
    description: "حقوق مهر",
  }),
];

function totals(rows: Transaction[]): TransactionTotals {
  return {
    income: rows
      .filter((row) => row.type === "income")
      .reduce((sum, row) => sum + row.amount, 0),
    expense: rows
      .filter((row) => row.type === "expense")
      .reduce((sum, row) => sum + row.amount, 0),
    count: rows.length,
  };
}

/** Totals of a list of sample transactions. */
export function sampleTotals(rows: Transaction[]): TransactionTotals {
  return totals(rows);
}

/** Each day's totals of a list of sample transactions, newest first. */
export function sampleDayTotals(rows: Transaction[]): TransactionDayTotal[] {
  const dates = [...new Set(rows.map((row) => row.date))];
  return dates.map((date) => ({
    date,
    ...totals(rows.filter((row) => row.date === date)),
  }));
}

export const SAMPLE_ACCOUNT_OPTIONS: AccountOption[] = SAMPLE_ACCOUNTS.map(
  ({ id, name, type, archived }) => ({ id, name, type, archived }),
);

export const SAMPLE_TRANSACTION_OPTIONS: TransactionOptions = {
  accounts: SAMPLE_ACCOUNT_OPTIONS,
  categories: SAMPLE_CATEGORIES,
  tags: ["کاری", "خانواده", "سفر شمال", "مهمانی", "قابل بازپرداخت", "مدرسه"],
};

/** The options as the layout hands them to the add-transaction form: a promise. */
export const SAMPLE_TRANSACTION_OPTIONS_PROMISE = Promise.resolve(
  SAMPLE_TRANSACTION_OPTIONS,
);

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

/** Fake Server Actions for the add-transaction form: everything succeeds. */
export const SAMPLE_ADD_TRANSACTION_ACTIONS = {
  onCreate: async () => {
    await wait();
    return { ok: true as const, id: crypto.randomUUID() };
  },
  onDelete: async () => {
    await wait();
    return {
      ok: true as const,
      deleted: {
        type: "expense" as const,
        amount: 1000000,
        date: SAMPLE_TODAY,
        accountId: SAMPLE_ACCOUNTS[0].id,
        toAccountId: null,
        categoryId: null,
        description: "؟",
        note: "",
        tags: [],
      },
    };
  },
};
