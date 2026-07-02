"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { fetchOwnershipCards, OwnershipCard } from "@/lib/wms-api";
import {
  getMyTeamMembers,
  addTeamMember,
  removeTeamMember,
  isOnMyTeam,
  TeamMember,
} from "@/lib/team-setup";

const PAYLOCITY_COMPANY_ID = process.env.NEXT_PUBLIC_PAYLOCITY_COMPANY_ID || "317433";
const PAYLOCITY_PORTAL_URL = `https://go.paylocity.com/Home?__viewedCompanyId=${PAYLOCITY_COMPANY_ID}`;

type Tab = "directory" | "my-team";

export default function EmployeesPage() {
  const { refreshKey } = useApp();
  const [cards, setCards] = useState<OwnershipCard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("directory");
  const [myTeam, setMyTeam] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");

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
  useEffect(() => { setMyTeam(getMyTeamMembers()); }, []);

  function handleAddToTeam(card: OwnershipCard) {
    addTeamMember(card);
    setMyTeam(getMyTeamMembers());
  }

  function handleRemoveFromTeam(id: string) {
    removeTeamMember(id);
    setMyTeam(getMyTeamMembers());
  }

  const filteredCards = cards?.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.displayName || c.name || "").toLowerCase().includes(q) ||
      (c.role || "").toLowerCase().includes(q) ||
      (c.department || "").toLowerCase().includes(q) ||
      (c.employeeId || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Team members from HRM with Paylocity portal access</p>
        </div>
        <button onClick={loadCards} className="text-xs text-[#7c3aed] hover:underline flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <PaylocityCard />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("directory")}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            tab === "directory" ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Employee Directory
        </button>
        <button
          onClick={() => setTab("my-team")}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
            tab === "my-team" ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Team
          {myTeam.length > 0 && (
            <span className="bg-[#7c3aed] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {myTeam.length}
            </span>
          )}
        </button>
      </div>

      {tab === "my-team" ? (
        <MyTeamView team={myTeam} onRemove={handleRemoveFromTeam} onSwitchTab={() => setTab("directory")} />
      ) : (
        <>
          {/* Search */}
          {cards && cards.length > 0 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees by name, role, or department..."
              className="w-full max-w-md border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 text-gray-800"
            />
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#7c3aed] rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 mt-2">Loading employee data from HRM...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-amber-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">HRM Service Unavailable</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">{error}</p>
              <button onClick={loadCards} className="mt-3 text-xs text-[#7c3aed] hover:underline">Retry</button>
            </div>
          ) : !filteredCards || filteredCards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {search ? "No Matching Employees" : "No Employee Records"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {search
                  ? `No employees matching "${search}"`
                  : cards === null
                  ? "HRM ownership-card service did not return employee data. Paylocity API sync can be enabled by an administrator; until then use the Paylocity portal link above."
                  : "No ownership cards found for this facility. Records will appear when employees are assigned in HRM or after Paylocity API sync is configured."}
              </p>
              {!search && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Source: hrm.item.com/ownership-card
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card, i) => (
                <EmployeeCard
                  key={card.id || card.employeeId || i}
                  card={card}
                  onTeam={isOnMyTeam(card.id || card.employeeId || "")}
                  onAdd={() => handleAddToTeam(card)}
                  onRemove={() => handleRemoveFromTeam(card.id || card.employeeId || "")}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PaylocityCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0066a1]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#0066a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">Paylocity</h3>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                API sync not connected
              </span>
            </div>
            <p className="text-xs text-gray-500">Company ID: {PAYLOCITY_COMPANY_ID}. Current dashboard employees continue to come from HRM until API credentials are configured.</p>
          </div>
        </div>
        <a
          href={PAYLOCITY_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0066a1] rounded-lg hover:bg-[#005080] transition-colors"
        >
          Open Paylocity
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          This is wired as a safe portal connection for Paylocity. Automatic employee sync requires Paylocity admin API credentials; no credentials are stored in the app and no HR records are changed from this dashboard.
        </p>
      </div>
    </div>
  );
}

function EmployeeCard({ card, onTeam, onAdd, onRemove }: {
  card: OwnershipCard; onTeam: boolean; onAdd: () => void; onRemove: () => void;
}) {
  const name = card.displayName || card.name || card.userId || "Unknown";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center text-white text-sm font-medium shrink-0">
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
      <div className="mt-3 flex items-center justify-between">
        {card.employeeId && (
          <span className="text-[10px] text-gray-400 font-mono">ID: {card.employeeId}</span>
        )}
        <button
          onClick={onTeam ? onRemove : onAdd}
          className={`ml-auto text-xs px-2.5 py-1 rounded-md transition-colors ${
            onTeam
              ? "bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-red-50 hover:text-red-600"
              : "bg-gray-100 text-gray-600 hover:bg-[#7c3aed]/10 hover:text-[#7c3aed]"
          }`}
        >
          {onTeam ? "On My Team ✓" : "+ Add to Team"}
        </button>
      </div>
    </div>
  );
}

function MyTeamView({ team, onRemove, onSwitchTab }: {
  team: TeamMember[]; onRemove: (id: string) => void; onSwitchTab: () => void;
}) {
  if (team.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">No Team Members Selected</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Select team members from the Employee Directory to build your personal team view.
          This is your dashboard team selection and does not change HR assignments.
        </p>
        <button onClick={onSwitchTab} className="mt-3 text-xs text-[#7c3aed] hover:underline">
          Browse Employee Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {team.length} team member{team.length !== 1 ? "s" : ""} selected
          <span className="ml-2 text-gray-400">— Personal dashboard selection</span>
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {team.map((member) => (
          <div key={member.id} className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center text-white text-xs font-medium shrink-0">
              {member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{member.name}</div>
              <div className="text-xs text-gray-500">
                {[member.role, member.department].filter(Boolean).join(" · ") || "Team member"}
              </div>
            </div>
            <button
              onClick={() => onRemove(member.id)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Remove from team"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 text-center">
        This is your personal team view saved in this browser. It does not modify HR records.
      </p>
    </div>
  );
}
