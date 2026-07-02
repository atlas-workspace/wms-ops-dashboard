"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { searchOrders, OrderRecord } from "@/lib/wms-api";

export default function OrdersPage() {
  const { refreshKey } = useApp();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { currentPage: page, pageSize: 20 };
    if (statusFilter) {
      const statusMap: Record<string, string> = {
        shipped: "SHIPPED",
        picked: "PICKED",
        unpicked: "UNPICKED",
        uncommitted: "NEW",
      };
      if (statusMap[statusFilter]) {
        params.statuses = [statusMap[statusFilter]];
      }
    }
    const result = await searchOrders(params);
    setOrders(result?.records || []);
    setTotal(result?.total ?? null);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Orders & Units</h1>
          <p className="text-sm text-gray-500">
            {statusFilter ? `Filtered by: ${statusFilter}` : "All outbound orders"}
            {total != null && ` (${total.toLocaleString()} total)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusFilter && (
            <a href="/dashboard/orders" className="text-xs text-[#0066cc] hover:underline">Clear filter</a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#0066cc] rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-gray-500">No orders found{statusFilter ? ` with status "${statusFilter}"` : ""}</p>
            <p className="text-xs text-gray-400 mt-1">Orders will appear here when available from the WMS</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Order No</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, i) => (
               <tr key={order.id || order.orderId || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{order.orderId || order.id || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-700">{order.orderNo || "—"}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{order.customerId || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{order.createdTime ? new Date(order.createdTime).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total != null && total > 20 && (
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
    NEW: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  };
  const cls = colors[status] || "bg-gray-100 text-gray-600";
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>{status}</span>;
}
