import { after } from "next/server";

import { signOut } from "@/auth/actions";
import { requireUser } from "@/auth/session";
import { AppShell } from "@/components/app-shell";
import { listTransactionOptions } from "@/db/transactions";
import { saveUserTimeZone } from "@/db/users";
import { canWrite, toUserRole } from "@/helpers/role";
import { reportedTimeZone } from "@/i18n/time-zone";

import { createTransaction, deleteTransaction } from "./transactions/actions";

/**
 * Every signed-in page: the app shell around it. The role comes from the user record on every
 * request, so a role change shows up at once; each page and action still checks it itself.
 * Editors and admins also get the add-transaction form, whose accounts, categories and tags
 * load without holding up the page.
 *
 * The time zone the browser reported is kept on the user record too (after the response), for
 * the Claude connector's «today».
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { user } = await requireUser();
  const timeZone = await reportedTimeZone();
  if (timeZone && timeZone !== user.timeZone) {
    after(() => saveUserTimeZone(user.id, timeZone));
  }
  const role = toUserRole(user.role);
  const writer = canWrite(role);
  return (
    <AppShell
      user={{ name: user.name, role }}
      onSignOut={signOut}
      transactionOptions={writer ? listTransactionOptions() : null}
      transactionActions={
        writer
          ? { onCreate: createTransaction, onDelete: deleteTransaction }
          : null
      }
    >
      {children}
    </AppShell>
  );
}
