"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { fetchOwnershipCards, OwnershipCard } from "@/lib/wms-api";

export default function EmployeesPage() {
  const { refreshKey } = useApp();
  const [cards, setCards] = useState<OwnershipCard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchOwnershipCards();
      setCards(result);
    } catch {
      setError("Unable to connect to HRM service");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCards(); }, [loadCards, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Team members and ownership cards from HRM</p>
        </div>
        <button onClick={loadCards} className="text-xs text-[#0066cc] hover:underline flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#0066cc] rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 mt-2">Loading employee data from HRM...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-amber-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">HRM Service Unavailable</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">{error}</p>
          <button onClick={loadCards} className="mt-3 text-xs text-[#0066cc] hover:underline">Retry</button>
        </div>
      ) : cards === null || cards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">No Employee Records</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {cards === null
              ? "HRM ownership-card service did not return employee data. This may require authentication or the service may be temporarily unavailable."
              : "No ownership cards found for this facility. Records will appear when employees are assigned."}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Source: hrm.item.com/ownership-card
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <EmployeeCard key={card.id || card.employeeId || i} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeCard({ card }: { card: OwnershipCard }) {
  const name = card.displayName || card.name || card.userId || "Unknown";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#004499] flex items-center justify-center text-white text-sm font-medium shrink-0">
          {card.avatar ? (
            <img src={card.avatar} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">{name}</h3>
          {card.role && <p className="text-xs text-gray-500">{card.role}</p>}
          {card.team && <p className="text-xs text-gray-400">{card.team}</p>}
          {card.department && <p className="text-xs text-gray-400">{card.department}</p>}
        </div>
        {card.status && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            card.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {card.status}
          </span>
        )}
      </div>
      {card.employeeId && (
        <div className="mt-2 text-[10px] text-gray-400 font-mono">ID: {card.employeeId}</div>
      )}
    </div>
  );
}
