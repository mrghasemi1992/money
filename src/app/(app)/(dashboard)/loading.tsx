import { DashboardSkeleton } from "@/components/dashboard";

/**
 * Shown inside the app shell while the dashboard loads. The page sits in its own route group so
 * this skeleton covers only the dashboard; other pages without a loading.tsx get PageSkeleton.
 */
export default function Loading() {
  return <DashboardSkeleton />;
}
