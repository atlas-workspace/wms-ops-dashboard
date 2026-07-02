"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuth } from "@/lib/auth";
import { useApp } from "@/lib/app-context";
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
import { DataSourceBadge } from "@/components/DataSourceBadge";

interface DashboardData {
  shipment: ShipmentStats | null;
  progress: ShipmentProgress | null;
  taskStats: TaskActionStats | null;
  orderCount: number | null;
  loading: boolean;
}

export default function TeamDashboardPage() {
  const router = useRouter();
  const { facility, refreshKey } = useApp();
  const [data, setData] = useState<DashboardData>({
    shipment: null, progress: null, taskStats: null, orderCount: null, loading: true,
  });
  const [drilldown, setDrilldown] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth) return;
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const [shipmentResult, progressResult, taskStatsResult, ordersResult] = await Promise.allSettled([
        getDailyShipmentStats(),
        getShipmentProgress(),
        getTaskActionStats(),
        searchOrders({ currentPage: 1, pageSize: 1, statuses: ["OPEN", "COMMITTED", "PARTIAL_COMMITTED", "PICKED", "PACKED", "STAGED", "LOADED", "READY_TO_SHIP"] }),
      ]);

      const shipment = shipmentResult.status === "fulfilled" ? shipmentResult.value : null;
      const progress = progressResult.status === "fulfilled" ? progressResult.value : null;
      const taskStats = taskStatsResult.status === "fulfilled" ? taskStatsResult.value : null;
      const orders = ordersResult.status === "fulfilled" ? ordersResult.value : null;

      setData({
        shipment,
        progress,
        taskStats,
        orderCount: orders?.total ?? null,
        loading: false,
      });
    } catch {
      setData({
        shipment: null,
        progress: null,
        taskStats: null,
        orderCount: null,
        loading: false,
      });
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  const facilityLabel = facility.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  function handleKpiClick(type: string) {
    if (type === "orders" || type === "shipped" || type === "unshipped" || type === "planned") {
      router.push("/dashboard/orders");
    } else if (type === "picked" || type === "processed") {
      setDrilldown(type);
    }
  }

  return (
    <div className="space-y-4">
      {/* Team Today Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066cc] to-[#004499] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <svg className="absolute -inset-1 w-[72px] h-[72px]" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="34" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                <circle cx="36" cy="36" r="34" fill="none" stroke="#10b981" strokeWidth="2.5"
                  strokeDasharray={`${(data.progress?.progressRate ?? 0) * 213} 213`}
                  strokeLinecap="round" transform="rotate(-90 36 36)" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Team Today</h1>
                <span className="text-lg font-bold text-[#0066cc]">—</span>
                <span className="text-lg font-bold text-[#0066cc] uppercase">{facilityLabel}</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                <DataSourceBadge source="Live WMS" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ScoreIndicator label="Completion" value={data.progress ? `${Math.round(data.progress.progressRate * 100)}%` : null} color="#10b981" />
            <ScoreIndicator label="Shipped" value={data.shipment?.actualQty} color="#3b82f6" />
            <ScoreIndicator label="Pending" value={data.shipment?.unshippedQty} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-6 gap-3">
        <KpiTile icon="📦" label="Total Orders" value={data.orderCount} color="#3b82f6" loading={data.loading} onClick={() => handleKpiClick("orders")} />
        <KpiTile icon="🚚" label="Shipped" value={data.shipment?.actualQty} color="#10b981" loading={data.loading} onClick={() => handleKpiClick("shipped")} />
        <KpiTile icon="⏳" label="Unshipped" value={data.shipment?.unshippedQty} color="#f59e0b" loading={data.loading} onClick={() => handleKpiClick("unshipped")} />
        <KpiTile icon="📋" label="Planned" value={data.shipment?.plannedShipmentQty} color="#8b5cf6" loading={data.loading} onClick={() => handleKpiClick("planned")} />
        <KpiTile icon="✅" label="Picked" value={data.progress?.pickedQty} color="#14b8a6" loading={data.loading} onClick={() => handleKpiClick("picked")} />
        <KpiTile icon="📊" label="Items Processed" value={data.taskStats?.barcodeCount} color="#ef4444" loading={data.loading} onClick={() => handleKpiClick("processed")} />
      </div>

      {/* Drilldown Panel */}
      {drilldown && (
        <DrilldownPanel type={drilldown} data={data} onClose={() => setDrilldown(null)} />
      )}

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#0066cc] rounded-full"></span>
            Productivity By Employee
            <DataSourceBadge source="Live WMS" />
          </h3>
          <ProductivityBars progress={data.progress} loading={data.loading} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#10b981] rounded-full"></span>
            Orders By Status
            <DataSourceBadge source="Live WMS" />
          </h3>
          <OrdersDonutChart progress={data.progress} loading={data.loading} onSegmentClick={(status) => router.push(`/dashboard/orders?status=${status}`)} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#f59e0b] rounded-full"></span>
            Activity Overview
            <DataSourceBadge source="Live WMS" />
          </h3>
          <ActivityBars taskStats={data.taskStats} loading={data.loading} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#8b5cf6] rounded-full"></span>
            Case Information
            <DataSourceBadge source="Live WMS" />
          </h3>
          <CaseInformation shipment={data.shipment} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#f59e0b] rounded-full"></span>
            Top Performers Today
            <DataSourceBadge source="HRM" status="pending" />
          </h3>
          <TopPerformers />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#14b8a6] rounded-full"></span>
            Team Summary
            <DataSourceBadge source="Live WMS" />
          </h3>
          <TeamSummary progress={data.progress} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#ef4444] rounded-full"></span>
            Alerts &amp; Coaching
            <DataSourceBadge source="Alerts" status="pending" />
          </h3>
          <AlertsCoaching />
        </div>
      </div>
    </div>
  );
}

function ScoreIndicator({ label, value, color }: { label: string; value: string | number | null | undefined; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color }}>{value ?? "—"}</div>
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}

function KpiTile({ icon, label, value, color, loading, onClick }: {
  icon: string; label: string; value: number | null | undefined; color: string; loading: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col items-center gap-1.5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer text-center w-full">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${color}15` }}>{icon}</div>
      <div className="text-xl font-bold text-gray-900">
        {loading ? <div className="w-8 h-5 bg-gray-100 rounded animate-pulse"></div> : value != null ? value.toLocaleString() : <span className="text-gray-300">—</span>}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider leading-tight">{label}</div>
    </button>
  );
}

function DrilldownPanel({ type, data, onClose }: { type: string; data: DashboardData; onClose: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          {type === "picked" ? "Pick Activity Details" : "Processing Details"}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {type === "picked" && data.progress ? (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Required:</span> <span className="font-medium">{data.progress.requiredQty?.toLocaleString()}</span></div>
          <div><span className="text-gray-500">Picked:</span> <span className="font-medium text-[#14b8a6]">{data.progress.pickedQty?.toLocaleString()}</span></div>
          <div><span className="text-gray-500">Remaining:</span> <span className="font-medium text-[#f59e0b]">{data.progress.unpickedQty?.toLocaleString()}</span></div>
        </div>
      ) : type === "processed" && data.taskStats ? (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Barcodes:</span> <span className="font-medium">{data.taskStats.barcodeCount?.toLocaleString()}</span></div>
          <div><span className="text-gray-500">Unique Items:</span> <span className="font-medium">{data.taskStats.itemIdCount?.toLocaleString()}</span></div>
          <div><span className="text-gray-500">Item Numbers:</span> <span className="font-medium">{data.taskStats.itemNoCount?.toLocaleString()}</span></div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No detail data available</p>
      )}
    </div>
  );
}

function ProductivityBars({ progress, loading }: { progress: ShipmentProgress | null; loading: boolean }) {
  if (loading) return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>)}</div>;
  if (!progress) return <div className="text-sm text-gray-400 text-center py-6">No productivity data available</div>;
  const total = progress.requiredQty || 1;
  const items = [
    { name: "Picking", value: progress.pickedQty, color: "#3b82f6" },
    { name: "Shipped", value: progress.shippedQty, color: "#10b981" },
    { name: "Unpicked", value: progress.unpickedQty, color: "#f59e0b" },
    { name: "Uncommitted", value: progress.uncommitQty, color: "#ef4444" },
  ];
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{item.name}</span>
            <span className="font-medium text-gray-800">{item.value?.toLocaleString() ?? 0}</span>
          </div>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(((item.value ?? 0) / total) * 100, 100)}%`, backgroundColor: item.color }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityBars({ taskStats, loading }: { taskStats: TaskActionStats | null; loading: boolean }) {
  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>)}</div>;
  if (!taskStats) return <div className="text-sm text-gray-400 text-center py-6">No activity data available</div>;
  const maxVal = Math.max(taskStats.itemIdCount, taskStats.barcodeCount, taskStats.itemNoCount, 1);
  const items = [
    { name: "Items Scanned", value: taskStats.barcodeCount, color: "#3b82f6" },
    { name: "Unique Items", value: taskStats.itemIdCount, color: "#10b981" },
    { name: "Item Numbers", value: taskStats.itemNoCount, color: "#f59e0b" },
  ];
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{item.name}</span>
            <span className="font-medium text-gray-800">{item.value?.toLocaleString() ?? 0}</span>
          </div>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(((item.value ?? 0) / maxVal) * 100, 100)}%`, backgroundColor: item.color }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CaseInformation({ shipment }: { shipment: ShipmentStats | null }) {
  if (!shipment) return <div className="text-sm text-gray-400 text-center py-4">No case data available</div>;
  return (
    <div className="space-y-2.5">
      <InfoRow label="Completion Rate" value={shipment.completionRate != null ? `${Math.round(shipment.completionRate * 100)}%` : "—"} valueColor="#10b981" />
      <InfoRow label="Planned Shipments" value={shipment.plannedShipmentQty?.toLocaleString() ?? "—"} />
      <InfoRow label="Actual Shipped" value={shipment.actualQty?.toLocaleString() ?? "—"} />
      <InfoRow label="Remaining" value={shipment.unshippedQty?.toLocaleString() ?? "—"} valueColor="#f59e0b" />
      <InfoRow label="Statistics Date" value={shipment.statisticsDate || "Today"} />
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  );
}

function TopPerformers() {
  return (
    <div className="text-sm text-gray-400 text-center py-4">
      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
      <p>Requires HRM integration</p>
      <button onClick={() => window.location.href = "/dashboard/employees"} className="text-xs text-[#0066cc] hover:underline mt-1">View Employees</button>
    </div>
  );
}

function TeamSummary({ progress }: { progress: ShipmentProgress | null }) {
  if (!progress) return <div className="text-sm text-gray-400 text-center py-4">No team data available</div>;
  return (
    <div className="space-y-2.5">
      <InfoRow label="Required Units" value={progress.requiredQty?.toLocaleString() ?? "—"} />
      <InfoRow label="Shipped Units" value={progress.shippedQty?.toLocaleString() ?? "—"} valueColor="#10b981" />
      <InfoRow label="Picked Units" value={progress.pickedQty?.toLocaleString() ?? "—"} valueColor="#3b82f6" />
      <InfoRow label="Progress Rate" value={`${Math.round(progress.progressRate * 100)}%`} valueColor="#0066cc" />
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#0066cc] rounded-full" style={{ width: `${Math.min(progress.progressRate * 100, 100)}%` }}></div>
      </div>
    </div>
  );
}

function AlertsCoaching() {
  return (
    <div className="text-sm text-gray-400 text-center py-4">
      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <p>Alert feed is not connected yet</p>
      <p className="text-xs text-gray-300 mt-1">No alert status is shown unless a live source is available.</p>
      <button onClick={() => window.location.href = "/dashboard/coaching"} className="text-xs text-[#0066cc] hover:underline mt-1">View Coaching</button>
    </div>
  );
}
