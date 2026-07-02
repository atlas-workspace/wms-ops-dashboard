"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { searchOrders, OrderRecord } from "@/lib/wms-api";
import { DataSourceBadge } from "@/components/DataSourceBadge";

const ACTIVE_STATUSES = ["OPEN", "COMMITTED", "PARTIAL_COMMITTED", "PICKED", "PACKED", "STAGED", "LOADED", "READY_TO_SHIP", "PLANNED", "PLANNING", "PICKING", "PACKING", "LOADING"];
const ALL_STATUS_OPTIONS = [
  { value: "active", label: "Active Orders" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "OPEN", label: "Open" },
  { value: "COMMITTED", label: "Committed" },
  { value: "PICKED", label: "Picked" },
  { value: "PACKED", label: "Packed" },
  { value: "STAGED", label: "Staged" },
  { value: "LOADED", label: "Loaded" },
  { value: "IMPORTED", label: "Imported" },
];

type FetchState = "loading" | "success" | "error" | "timeout";

export default function OrdersPage() {
  const { facility, refreshKey } = useApp();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState<FetchState>("loading");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(urlStatus || "active");

  const fetchOrders = useCallback(async () => {
    setLoading("loading");
    const params: Record<string, unknown> = { currentPage: page, pageSize: 20 };

    if (statusFilter === "active") {
      params.statuses = ACTIVE_STATUSES;
    } else if (statusFilter) {
      params.statuses = [statusFilter];
    }

    const result = await searchOrders(params);
    if (result === null) {
      setOrders([]);
      setTotal(null);
      setLoading("error");
    } else {
      setOrders(result.records || []);
      setTotal(result.total ?? 0);
      setLoading("success");
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders, refreshKey, facility]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const facilityLabel = facility.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Orders & Units</h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            {facilityLabel}
            {total != null && ` — ${total.toLocaleString()} order${total !== 1 ? "s" : ""}`}
            <DataSourceBadge source="Live WMS" status={loading === "error" ? "unavailable" : "live"} />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          >
            {ALL_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            disabled={loading === "loading"}
            className="flex items-center gap-1 text-xs text-[#0066cc] hover:text-[#004499] disabled:opacity-40"
          >
            <svg className={`w-3.5 h-3.5 ${loading === "loading" ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading === "loading" ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#0066cc] rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-2">Loading orders from WMS...</p>
          </div>
        ) : loading === "error" ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-amber-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Unable to load warehouse orders</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              The order search service did not respond in time. This can happen when the facility has a large order volume. Try filtering by status or retry.
            </p>
            <button onClick={fetchOrders} className="mt-3 text-xs text-[#0066cc] hover:underline">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-gray-500">
              No orders found for {facilityLabel}
              {statusFilter !== "active" && ` with status "${statusFilter}"`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try changing the status filter or switching facilities
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Schedule Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, i) => (
                  <tr key={order.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{order.id || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-700 text-xs">{(order.referenceNo as string) || (order.poNo as string) || (order.soNo as string) || "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{order.customerId || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{(order.orderType as string) || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{(order.scheduleDate as string) ? new Date(order.scheduleDate as string).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading === "success" && total != null && total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-gray-400">—</span>;
  const colors: Record<string, string> = {
    SHIPPED: "bg-green-100 text-green-700",
    PICKED: "bg-blue-100 text-blue-700",
    COMMITTED: "bg-indigo-100 text-indigo-700",
    PARTIAL_COMMITTED: "bg-indigo-50 text-indigo-600",
    OPEN: "bg-gray-100 text-gray-700",
    IMPORTED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
    PACKED: "bg-cyan-100 text-cyan-700",
    STAGED: "bg-purple-100 text-purple-700",
    LOADED: "bg-emerald-100 text-emerald-700",
    READY_TO_SHIP: "bg-teal-100 text-teal-700",
    PLANNING: "bg-yellow-50 text-yellow-700",
    PICKING: "bg-blue-50 text-blue-600",
    PACKING: "bg-cyan-50 text-cyan-600",
    LOADING: "bg-emerald-50 text-emerald-600",
    EXCEPTION: "bg-red-50 text-red-600",
    ON_HOLD: "bg-orange-100 text-orange-700",
  };
  const cls = colors[status] || "bg-gray-100 text-gray-600";
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>{status.replace(/_/g, " ")}</span>;
}
