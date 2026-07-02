"use client";

import { useEffect, useState, useCallback } from "react";
import { getStoredAuth, getStoredFacility } from "@/lib/auth";
import {
  getDailyShipmentStats,
  getShipmentProgress,
  getTaskActionStats,
  searchOrders,
  ShipmentStats,
  ShipmentProgress,
  TaskActionStats,
} from "@/lib/wms-api";
import { OrdersDonutChart } from "@/components/OrdersDonutChart";

interface DashboardData {
  shipment: ShipmentStats | null;
  progress: ShipmentProgress | null;
  taskStats: TaskActionStats | null;
  orderCount: number | null;
  loading: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    shipment: null,
    progress: null,
    taskStats: null,
    orderCount: null,
    loading: true,
  });

  const fetchData = useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth) return;

    setData((prev) => ({ ...prev, loading: true }));

    const [shipment, progress, taskStats, orders] = await Promise.all([
      getDailyShipmentStats(),
      getShipmentProgress(),
      getTaskActionStats(),
      searchOrders({ currentPage: 1, pageSize: 1 }),
    ]);

    setData({
      shipment,
      progress,
      taskStats,
      orderCount: orders?.total ?? null,
      loading: false,
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const facility = getStoredFacility() || "BUENA_PARK";
  const facilityLabel = facility.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const user = getStoredAuth();

  return (
    <div className="space-y-4">
      {/* Team Today - Facility Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar with status ring */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066cc] to-[#004499] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              {/* Status ring */}
              <svg className="absolute -inset-1 w-[72px] h-[72px]" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="34" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                <circle cx="36" cy="36" r="34" fill="none" stroke="#10b981" strokeWidth="2.5"
                  strokeDasharray={`${(data.progress?.progressRate ?? 0.75) * 213} 213`}
                  strokeLinecap="round" transform="rotate(-90 36 36)" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Team Today
                </h1>
                <span className="text-lg font-bold text-[#0066cc]">—</span>
                <span className="text-lg font-bold text-[#0066cc] uppercase">{facilityLabel}</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Score indicators */}
            <div className="text-center">
              <div className="text-2xl font-bold text-[#10b981]">
                {data.progress ? `${Math.round(data.progress.progressRate * 100)}%` : "—"}
              </div>
              <div className="text-[10px] text-gray-500 uppercase">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#3b82f6]">
                {data.shipment?.actualQty ?? "—"}
              </div>
              <div className="text-[10px] text-gray-500 uppercase">Shipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {data.shipment?.unshippedQty ?? "—"}
              </div>
              <div className="text-[10px] text-gray-500 uppercase">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Tiles Row */}
      <div className="grid grid-cols-6 gap-3">
        <KpiTile
          icon="📦"
          label="Total Orders"
          value={data.orderCount}
          color="#3b82f6"
          loading={data.loading}
        />
        <KpiTile
          icon="🚚"
          label="Shipped"
          value={data.shipment?.actualQty}
          color="#10b981"
          loading={data.loading}
        />
        <KpiTile
          icon="⏳"
          label="Unshipped"
          value={data.shipment?.unshippedQty}
          color="#f59e0b"
          loading={data.loading}
        />
        <KpiTile
          icon="📋"
          label="Planned"
          value={data.shipment?.plannedShipmentQty}
          color="#8b5cf6"
          loading={data.loading}
        />
        <KpiTile
          icon="✅"
          label="Picked"
          value={data.progress?.pickedQty}
          color="#14b8a6"
          loading={data.loading}
        />
        <KpiTile
          icon="📊"
          label="Items Processed"
          value={data.taskStats?.barcodeCount}
          color="#ef4444"
          loading={data.loading}
        />
      </div>

      {/* Middle Row: Productivity + Orders Donut + Activity */}
      <div className="grid grid-cols-3 gap-4">
        {/* Productivity By Employee */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#0066cc] rounded-full"></span>
            Productivity By Employee
          </h3>
          <ProductivityBars progress={data.progress} loading={data.loading} />
        </div>

        {/* Orders By Status Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#10b981] rounded-full"></span>
            Orders By Status
          </h3>
          <OrdersDonutChart progress={data.progress} loading={data.loading} />
        </div>

        {/* Activity Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#f59e0b] rounded-full"></span>
            Activity Overview
          </h3>
          <ActivityBars taskStats={data.taskStats} loading={data.loading} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Case Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#8b5cf6] rounded-full"></span>
            Case Information
          </h3>
          <CaseInformation shipment={data.shipment} />
        </div>

        {/* Top Performers Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#f59e0b] rounded-full"></span>
            Top Performers Today
          </h3>
          <TopPerformers user={user?.user.username} />
        </div>

        {/* Team Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#14b8a6] rounded-full"></span>
            Team Summary
          </h3>
          <TeamSummary progress={data.progress} />
        </div>

        {/* Alerts & Coaching */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#ef4444] rounded-full"></span>
            Alerts &amp; Coaching
          </h3>
          <AlertsCoaching />
        </div>
      </div>
    </div>
  );
}

function KpiTile({ icon, label, value, color, loading }: {
  icon: string; label: string; value: number | null | undefined; color: string; loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col items-center gap-1.5 hover:shadow-md transition-shadow">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${color}15` }}>
        {icon}
      </div>
      <div className="text-xl font-bold text-gray-900">
        {loading ? (
          <div className="w-8 h-5 bg-gray-100 rounded animate-pulse"></div>
        ) : value != null ? (
          value.toLocaleString()
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider text-center leading-tight">{label}</div>
    </div>
  );
}

function ProductivityBars({ progress, loading }: { progress: ShipmentProgress | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!progress) {
    return <div className="text-sm text-gray-400 text-center py-6">No productivity data available</div>;
  }

  const total = progress.requiredQty || 1;
  const employees = [
    { name: "Picking", value: progress.pickedQty, color: "#3b82f6" },
    { name: "Shipped", value: progress.shippedQty, color: "#10b981" },
    { name: "Unpicked", value: progress.unpickedQty, color: "#f59e0b" },
    { name: "Uncommitted", value: progress.uncommitQty, color: "#ef4444" },
  ];

  return (
    <div className="space-y-3">
      {employees.map((emp) => (
        <div key={emp.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{emp.name}</span>
            <span className="font-medium text-gray-800">{emp.value?.toLocaleString() ?? 0}</span>
          </div>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(((emp.value ?? 0) / total) * 100, 100)}%`,
                backgroundColor: emp.color,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityBars({ taskStats, loading }: { taskStats: TaskActionStats | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!taskStats) {
    return <div className="text-sm text-gray-400 text-center py-6">No activity data available</div>;
  }

  const maxVal = Math.max(taskStats.itemIdCount, taskStats.barcodeCount, taskStats.itemNoCount, 1);
  const activities = [
    { name: "Items Scanned", value: taskStats.barcodeCount, color: "#3b82f6" },
    { name: "Unique Items", value: taskStats.itemIdCount, color: "#10b981" },
    { name: "Item Numbers", value: taskStats.itemNoCount, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-3">
      {activities.map((act) => (
        <div key={act.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{act.name}</span>
            <span className="font-medium text-gray-800">{act.value?.toLocaleString() ?? 0}</span>
          </div>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(((act.value ?? 0) / maxVal) * 100, 100)}%`,
                backgroundColor: act.color,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CaseInformation({ shipment }: { shipment: ShipmentStats | null }) {
  if (!shipment) {
    return <div className="text-sm text-gray-400 text-center py-4">No case data available</div>;
  }
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Completion Rate</span>
        <span className="font-bold text-[#10b981]">{shipment.completionRate != null ? `${Math.round(shipment.completionRate * 100)}%` : "—"}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Planned Shipments</span>
        <span className="font-medium text-gray-800">{shipment.plannedShipmentQty?.toLocaleString() ?? "—"}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Actual Shipped</span>
        <span className="font-medium text-gray-800">{shipment.actualQty?.toLocaleString() ?? "—"}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Remaining</span>
        <span className="font-medium text-[#f59e0b]">{shipment.unshippedQty?.toLocaleString() ?? "—"}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Statistics Date</span>
        <span className="font-medium text-gray-800">{shipment.statisticsDate || "Today"}</span>
      </div>
    </div>
  );
}

function TopPerformers({ user }: { user?: string }) {
  return (
    <div className="text-sm text-gray-400 text-center py-4">
      <div className="text-2xl mb-2">🏆</div>
      <p>Performance data requires workforce tracking integration</p>
      {user && <p className="text-xs text-gray-300 mt-1">Signed in as {user}</p>}
    </div>
  );
}

function TeamSummary({ progress }: { progress: ShipmentProgress | null }) {
  if (!progress) {
    return <div className="text-sm text-gray-400 text-center py-4">No team data available</div>;
  }
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Required Units</span>
        <span className="font-medium text-gray-800">{progress.requiredQty?.toLocaleString() ?? "—"}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Shipped Units</span>
        <span className="font-bold text-[#10b981]">{progress.shippedQty?.toLocaleString() ?? "—"}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Picked Units</span>
        <span className="font-medium text-[#3b82f6]">{progress.pickedQty?.toLocaleString() ?? "—"}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Progress Rate</span>
        <span className="font-bold text-[#0066cc]">{Math.round(progress.progressRate * 100)}%</span>
      </div>
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0066cc] rounded-full"
          style={{ width: `${Math.min(progress.progressRate * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function AlertsCoaching() {
  return (
    <div className="text-sm text-gray-400 text-center py-4">
      <div className="text-2xl mb-2">🔔</div>
      <p>No active alerts</p>
      <p className="text-xs text-gray-300 mt-1">Coaching notifications will appear here</p>
    </div>
  );
}
