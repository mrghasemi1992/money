import { ReportsSkeleton } from "@/components/reports";

/** Shown inside the app shell while the reports' overview loads. */
export default function Loading() {
  return <ReportsSkeleton section="overview" />;
}
