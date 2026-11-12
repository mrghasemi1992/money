import { ReportsSkeleton } from "@/components/reports";

/** Shown inside the app shell while the reports' month-by-month view loads. */
export default function Loading() {
  return <ReportsSkeleton section="trends" />;
}
