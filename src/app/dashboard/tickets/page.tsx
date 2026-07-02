"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { pageTickets, searchTickets, TicketRecord } from "@/lib/ticket-api";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Open: "bg-yellow-100 text-yellow-700",
  Pending: "bg-orange-100 text-orange-700",
  Closed: "bg-gray-100 text-gray-600",
  Solved: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: "text-red-600",
  High: "text-orange-600",
  Normal: "text-blue-600",
  Low: "text-gray-500",
};

export default function TicketsPage() {
  const { refreshKey } = useApp();
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 20;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (search) {
        const results = await searchTickets(search, pageSize);
        if (results === null) {
          setError(true);
          setTickets([]);
          setTotal(0);
        } else {
          setTickets(results);
          setTotal(results.length);
        }
      } else {
        const result = await pageTickets(page, pageSize);
        if (result === null) {
          setError(true);
          setTickets([]);
          setTotal(0);
        } else {
          setTickets(result.records);
          setTotal(result.total);
        }
      }
    } catch {
      setError(true);
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets, refreshKey]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">Item Ticket System</p>
        </div>
        <button onClick={fetchTickets} className="text-xs text-[#7c3aed] hover:underline flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard label="Total" value={error ? null : total} color="#3b82f6" loading={loading} />
        <SummaryCard label="Open" value={error ? null : tickets.filter(t => statusName(t) === "Open" || statusName(t) === "New").length} color="#f59e0b" loading={loading} note="This page" />
        <SummaryCard label="Pending" value={error ? null : tickets.filter(t => statusName(t) === "Pending").length} color="#f97316" loading={loading} note="This page" />
        <SummaryCard label="Resolved" value={error ? null : tickets.filter(t => statusName(t) === "Closed" || statusName(t) === "Solved").length} color="#10b981" loading={loading} note="This page" />
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tickets by keyword..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 text-gray-800"
          />
          {search && (
            <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className="px-4 py-2 bg-[#7c3aed] text-white text-sm rounded-lg hover:bg-[#6d28d9] transition-colors">
          Search
        </button>
      </form>

      {/* Ticket List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#7c3aed] rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-2">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-amber-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Ticket Service Unavailable</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Unable to connect to the Item Ticket System. This may require additional authentication or the service may be temporarily unavailable.
            </p>
            <button onClick={fetchTickets} className="mt-3 text-xs text-[#7c3aed] hover:underline">Retry</button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">No Tickets Found</h3>
            <p className="text-xs text-gray-500">
              {search ? `No tickets matching "${search}"` : "No tickets available for the current tenant"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Assignee</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((ticket, i) => (
                  <tr key={ticket.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#7c3aed] font-medium">
                      {ticket.ticketNumber || `#${ticket.id}`}
                    </td>
                    <td className="px-4 py-2.5 text-gray-800 max-w-xs truncate">
                      {ticket.title || ticket.subject || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <TicketStatusBadge name={statusName(ticket)} />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[priorityName(ticket)] || "text-gray-500"}`}>
                        {priorityName(ticket)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {ticket.staffName || (ticket.staffId ? `Staff #${ticket.staffId}` : "Unassigned")}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">
                      {formatDate(ticket.createdTime || ticket.createTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && total > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="px-2 py-1 text-xs text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, loading, note }: { label: string; value: number | null; color: string; loading: boolean; note?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {loading ? <div className="w-8 h-6 bg-gray-100 rounded animate-pulse mx-auto"></div> : value ?? "—"}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {note && <div className="text-[10px] text-gray-400 mt-0.5">{note}</div>}
    </div>
  );
}

function TicketStatusBadge({ name }: { name: string }) {
  const cls = STATUS_COLORS[name] || "bg-gray-100 text-gray-600";
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>{name}</span>;
}

function statusName(ticket: TicketRecord): string {
  if (ticket.displayStatusName) return ticket.displayStatusName;
  const id = ticket.displayStatusId;
  if (id === 1) return "New";
  if (id === 2) return "Open";
  if (id === 3) return "Pending";
  if (id === 4) return "Closed";
  if (id === 5) return "Solved";
  return "Unknown";
}

function priorityName(ticket: TicketRecord): string {
  if (ticket.priorityName) return ticket.priorityName;
  return "Normal";
}

function formatDate(d?: string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}
