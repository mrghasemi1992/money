import { PageNotFound } from "@/components/page-status";

/**
 * Inside the app shell: unknown paths (through the [...rest] catch-all) and notFound() from a
 * page, such as /admin/users for non-admins.
 */
export default function NotFound() {
  return <PageNotFound />;
}
