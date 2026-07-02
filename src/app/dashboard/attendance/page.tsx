"use client";

import { UnavailableModule } from "@/components/ErrorBoundary";

export default function AttendancePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Attendance</h1>
      <UnavailableModule
        title="Attendance Tracking"
        description="Real-time attendance monitoring requires integration with the workforce management system. Clock-in/clock-out data and shift schedules will appear here once the HRM attendance module is connected."
      />
    </div>
  );
}
