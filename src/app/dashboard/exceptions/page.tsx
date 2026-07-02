"use client";

import { UnavailableModule } from "@/components/ErrorBoundary";

export default function ExceptionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Exceptions</h1>
      <UnavailableModule
        title="Exception Management"
        description="Exception alerts, inventory discrepancies, and workflow interruptions require real-time event stream integration. Exception data will appear when the alert system is connected."
      />
    </div>
  );
}
