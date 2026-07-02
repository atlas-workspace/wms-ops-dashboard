"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { getDailyShipmentStats, getShipmentProgress, getTaskActionStats, ShipmentStats, ShipmentProgress, TaskActionStats } from "@/lib/wms-api";

export default function OverviewPage() {
  const { refreshKey } = useApp();
  const [shipment, setShipment] = useState<ShipmentStats | null>(null);
  const [progress, setProgress] = useState<ShipmentProgress | null>(null);
  const [taskStats, setTaskStats] = useState<TaskActionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [s, p, t] = await Promise.all([getDailyShipmentStats(), getShipmentProgress(), getTaskActionStats()]);
    setShipment(s);
    setProgress(p);
    setTaskStats(t);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-gray-900">Dashboard Overview</h1>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-8 h-32 animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Dashboard Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Shipment Statistics" icon="🚚" items={shipment ? [
          { label: "Planned", value: shipment.plannedShipmentQty?.toLocaleString() ?? "—" },
          { label: "Actual", value: shipment.actualQty?.toLocaleString() ?? "—" },
          { label: "Unshipped", value: shipment.unshippedQty?.toLocaleString() ?? "—" },
          { label: "Completion", value: shipment.completionRate != null ? `${Math.round(shipment.completionRate * 100)}%` : "—" },
        ] : null} />
        <StatCard title="Shipment Progress" icon="📈" items={progress ? [
          { label: "Required", value: progress.requiredQty?.toLocaleString() ?? "—" },
          { label: "Shipped", value: progress.shippedQty?.toLocaleString() ?? "—" },
          { label: "Picked", value: progress.pickedQty?.toLocaleString() ?? "—" },
          { label: "Progress", value: `${Math.round(progress.progressRate * 100)}%` },
        ] : null} />
        <StatCard title="Task Actions" icon="⚡" items={taskStats ? [
          { label: "Barcodes Scanned", value: taskStats.barcodeCount?.toLocaleString() ?? "—" },
          { label: "Unique Items", value: taskStats.itemIdCount?.toLocaleString() ?? "—" },
          { label: "Item Numbers", value: taskStats.itemNoCount?.toLocaleString() ?? "—" },
        ] : null} />
      </div>
    </div>
  );
}

function StatCard({ title, icon, items }: { title: string; icon: string; items: Array<{ label: string; value: string }> | null }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {items ? (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.label} className="flex justify-between text-xs">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-medium text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">No data available</p>
      )}
    </div>
  );
}
