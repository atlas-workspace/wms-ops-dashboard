"use client";

import { UnavailableModule } from "@/components/ErrorBoundary";

export default function QualityPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Quality</h1>
      <UnavailableModule
        title="Quality Metrics"
        description="Quality scoring, accuracy rates, and error tracking require integration with the QC inspection system. Quality metrics will populate when the quality module API is connected."
      />
    </div>
  );
}
