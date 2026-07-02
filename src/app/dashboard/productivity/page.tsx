"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { getTaskActionStats, TaskActionStats } from "@/lib/wms-api";

export default function ProductivityPage() {
  const { refreshKey } = useApp();
  const [stats, setStats] = useState<TaskActionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [pick, pack, sort] = await Promise.all([
      getTaskActionStats(["PICK"]),
      getTaskActionStats(["PACK"]),
      getTaskActionStats(["SORTING"]),
    ]);
    setStats({
      itemIdCount: (pick?.itemIdCount ?? 0) + (pack?.itemIdCount ?? 0) + (sort?.itemIdCount ?? 0),
      barcodeCount: (pick?.barcodeCount ?? 0) + (pack?.barcodeCount ?? 0) + (sort?.barcodeCount ?? 0),
      itemNoCount: (pick?.itemNoCount ?? 0) + (pack?.itemNoCount ?? 0) + (sort?.itemNoCount ?? 0),
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Productivity</h1>
      <p className="text-sm text-gray-500">Task action statistics by type</p>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#7c3aed] rounded-full animate-spin"></div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Total Barcodes Scanned" value={stats.barcodeCount} color="#3b82f6" />
          <MetricCard label="Unique Items Processed" value={stats.itemIdCount} color="#10b981" />
          <MetricCard label="Item Numbers Handled" value={stats.itemNoCount} color="#f59e0b" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No productivity data available for this facility</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
      <div className="text-3xl font-bold mb-1" style={{ color }}>{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
