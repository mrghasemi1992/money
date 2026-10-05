import { signOut } from "@/auth/actions";
import { requireUser } from "@/auth/session";
import { AppShell } from "@/components/app-shell";
import { toUserRole } from "@/helpers/role";

/**
 * Every signed-in page: the app shell around it. The role comes from the user record on every
 * request, so a role change shows up at once; each page and action still checks it itself.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { user } = await requireUser();
  return (
    <AppShell
      user={{ name: user.name, role: toUserRole(user.role) }}
      onSignOut={signOut}
    >
      {children}
    </AppShell>
  );
}
