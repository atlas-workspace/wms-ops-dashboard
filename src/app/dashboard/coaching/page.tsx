"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { fetchOwnershipCards, OwnershipCard } from "@/lib/wms-api";

export default function CoachingPage() {
  const { refreshKey } = useApp();
  const [cards, setCards] = useState<OwnershipCard[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchOwnershipCards();
    setCards(result);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Coaching</h1>
      <p className="text-sm text-gray-500">Team coaching assignments and ownership from HRM</p>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#7c3aed] rounded-full animate-spin"></div>
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {cards.map((card, i) => (
            <div key={card.id || i} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#7c3aed]/10 flex items-center justify-center text-xs font-medium text-[#7c3aed]">
                {(card.displayName || card.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{card.displayName || card.name || "Unknown"}</div>
                <div className="text-xs text-gray-500">{card.role || "Team member"}</div>
              </div>
              <div className="text-xs text-gray-400">
                {card.team || "Unassigned"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">No Coaching Data</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Coaching assignments will appear when connected to the HRM ownership-card service. Currently sourcing from hrm.item.com/ownership-card.
          </p>
        </div>
      )}
    </div>
  );
}
