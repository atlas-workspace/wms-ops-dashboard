"use client";

import { UnavailableModule } from "@/components/ErrorBoundary";

export default function EquipmentPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Equipment & Maintenance Hub</h1>
      <UnavailableModule
        title="Equipment & Maintenance Hub"
        description="This business module is not connected yet. Equipment tracking, preventive maintenance schedules, and work order management will be available once the hub is configured and integrated with your facility systems."
      />
    </div>
  );
}
