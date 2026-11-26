import { db } from "@/db";
import {
  accounts,
  budgets,
  categories,
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  oauthRefreshToken,
  session,
  transactions,
  user,
} from "@/db/schema";
import type { AccountType } from "@/types/account";
import type { CategoryType } from "@/types/category";
import type { TransactionType } from "@/types/transaction";
import type { UserRole } from "@/types/user";

/*
 * Rows for the integration tests, written straight to the test database (src/test/integration/
 * setup.ts empties it before each test). Each helper fills what the schema requires and
 * returns the new row's id; a test passes only what it is about.
 */

export async function seedUser({
  name = "مریم",
  role = "admin",
  disabled = false,
}: {
  name?: string;
  role?: UserRole;
  disabled?: boolean;
} = {}): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(user).values({
    id,
    name,
    email: `${id}@users.money.invalid`,
    username: id,
    role,
    banned: disabled,
  });
  return id;
}

export async function seedAccount({
  name = "ملت",
  type = "bank",
  openingBalance = 0,
  sortOrder = 0,
}: {
  name?: string;
  type?: AccountType;
  openingBalance?: number;
  sortOrder?: number;
} = {}): Promise<string> {
  const [row] = await db
    .insert(accounts)
    .values({ name, type, openingBalance, sortOrder })
    .returning({ id: accounts.id });
  return row.id;
}

export async function seedCategory({
  name,
  type = "expense",
  parentId = null,
  archived = false,
}: {
  name: string;
  type?: CategoryType;
  parentId?: string | null;
  archived?: boolean;
}): Promise<string> {
  const [row] = await db
    .insert(categories)
    .values({ name, type, color: "teal", parentId, archived })
    .returning({ id: categories.id });
  return row.id;
}

export async function seedTransaction({
  type,
  amount,
  date,
  accountId,
  toAccountId = null,
  categoryId = null,
  createdBy,
}: {
  type: TransactionType;
  amount: number;
  date: string;
  accountId: string;
  toAccountId?: string | null;
  categoryId?: string | null;
  createdBy: string;
}): Promise<string> {
  const [row] = await db
    .insert(transactions)
    .values({
      type,
      amount,
      date,
      accountId,
      toAccountId,
      categoryId,
      createdBy,
      updatedBy: createdBy,
    })
    .returning({ id: transactions.id });
  return row.id;
}

export async function seedBudget(
  categoryId: string,
  amount: number,
): Promise<void> {
  await db.insert(budgets).values({ categoryId, amount });
}

/** A signed-in session of the user. */
export async function seedSession(userId: string): Promise<void> {
  await db.insert(session).values({
    userId,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 86_400_000),
  });
}

/**
 * Connects an app (the Claude connector) for the user: its consent, a refresh token and an
 * access token. Returns the app's client id.
 */
export async function seedConnection(
  userId: string,
  clientId = "claude",
): Promise<string> {
  await db
    .insert(oauthClient)
    .values({
      clientId,
      redirectUris: ["https://claude.ai/api/mcp/auth_callback"],
    })
    .onConflictDoNothing();
  const scopes = ["openid"];
  await db.insert(oauthConsent).values({ clientId, userId, scopes });
  const expiresAt = new Date(Date.now() + 86_400_000);
  const [refresh] = await db
    .insert(oauthRefreshToken)
    .values({ token: crypto.randomUUID(), clientId, userId, scopes, expiresAt })
    .returning({ id: oauthRefreshToken.id });
  await db.insert(oauthAccessToken).values({
    token: crypto.randomUUID(),
    clientId,
    userId,
    refreshId: refresh.id,
    scopes,
    expiresAt,
  });
  return clientId;
}

/**
 * One of every movement that is never income or expense, on `date`: a transfer between two of
 * the book's accounts, a loan to a counterparty and its repayment (transfers), and a debt each
 * way recorded without money moving (receivable, payable). Large amounts, so a total that
 * counts any of them is far off. Creates the accounts it needs.
 */
export async function seedNeverIncomeOrExpense(
  date: string,
  createdBy: string,
): Promise<void> {
  const bank = await seedAccount({ name: `بانک ${date}` });
  const cash = await seedAccount({ name: `نقد ${date}`, type: "cash" });
  const person = await seedAccount({
    name: `علی ${date}`,
    type: "counterparty",
  });
  const movements: [TransactionType, string, string | null][] = [
    ["transfer", bank, cash],
    ["transfer", bank, person],
    ["transfer", person, bank],
    ["receivable", person, null],
    ["payable", person, null],
  ];
  for (const [type, accountId, toAccountId] of movements) {
    await seedTransaction({
      type,
      amount: 900_000_000,
      date,
      accountId,
      toAccountId,
      createdBy,
    });
  }
}
