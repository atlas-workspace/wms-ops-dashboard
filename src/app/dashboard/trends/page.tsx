"use client";

import { UnavailableModule } from "@/components/ErrorBoundary";

export default function TrendsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Trends</h1>
      <UnavailableModule
        title="Performance Trends"
        description="Historical trend analysis, week-over-week comparisons, and forecasting require time-series data accumulation. Trends will populate as operational data is collected over time."
      />
    </div>
  );
}
