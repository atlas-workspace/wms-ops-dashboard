"use client";

import { UnavailableModule } from "@/components/ErrorBoundary";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Reports</h1>
      <UnavailableModule
        title="Operational Reports"
        description="Shift reports, daily summaries, and export capabilities require the reporting service integration. Reports will be available when the analytics backend is connected."
      />
    </div>
  );
}
