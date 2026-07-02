"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { getStoredAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { facility, setFacility } = useApp();
  const auth = getStoredAuth();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Facility Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Active Facility</label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
            >
              <option value="LT_F1">LT Facility 1</option>
              <option value="BUENA_PARK">Buena Park</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Timezone</label>
            <input type="text" value="America/Los_Angeles" readOnly className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 bg-gray-50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Session Info</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-gray-500">User:</span>
            <span className="ml-2 text-gray-800">{auth?.user.username || "—"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500">Tenant:</span>
            <span className="ml-2 text-gray-800 font-mono">{auth?.user.tenantId || "—"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Integrations</h2>
        <div className="space-y-2">
          <IntegrationRow name="WMS API" url="wms-staging.item.com" status="connected" />
          <IntegrationRow name="IAM Auth" url="iam-staging.item.com" status="connected" />
          <IntegrationRow name="HRM Ownership Cards" url="hrm.item.com/ownership-card" status="pending" />
          <IntegrationRow name="Item Ticket System" url="unisticket.item.com" status="connected" />
        </div>
      </div>

      <button onClick={handleSave} className="px-4 py-2 bg-[#7c3aed] text-white text-sm rounded hover:bg-[#6d28d9] transition-colors">
        {saved ? "Saved" : "Save Settings"}
      </button>
    </div>
  );
}

function IntegrationRow({ name, url, status }: { name: string; url: string; status: "connected" | "pending" | "error" }) {
  const colors = {
    connected: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <span className="text-sm text-gray-800">{name}</span>
        <span className="text-xs text-gray-400 ml-2 font-mono">{url}</span>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>{status}</span>
    </div>
  );
}
