"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";

const EQUIPMENT_HUB_URL = "https://unis-equipment-performance-maintenance-hub.coolify.item.pub/dashboard";

const equipmentSidebarItems = [
  { id: "overview", label: "Dashboard", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { id: "assets", label: "Asset Registry", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { id: "maintenance", label: "Maintenance", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "work-orders", label: "Work Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "performance", label: "Performance", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "schedules", label: "Schedules", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

type EquipmentTab = "overview" | "assets" | "maintenance" | "work-orders" | "performance" | "schedules";

export default function EquipmentPage() {
  const { refreshKey } = useApp();
  const [activeTab, setActiveTab] = useState<EquipmentTab>("overview");

  return (
    <div className="h-full flex flex-col -m-5">
      {/* Module header bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Equipment & Maintenance Hub</h1>
            <p className="text-[11px] text-gray-500">Performance monitoring, maintenance scheduling & work orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={EQUIPMENT_HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7c3aed] bg-[#7c3aed]/5 hover:bg-[#7c3aed]/10 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open external
          </a>
        </div>
      </div>

      {/* Content area with internal sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Equipment sub-nav */}
        <nav className="w-44 bg-white border-r border-gray-100 py-2 shrink-0 overflow-y-auto">
          {equipmentSidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as EquipmentTab)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-left text-xs transition-colors ${
                activeTab === item.id
                  ? "bg-[#7c3aed]/5 text-[#7c3aed] font-medium border-l-2 border-[#7c3aed]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent"
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main panel */}
        <div className="flex-1 overflow-y-auto bg-[#f0f2f5] p-5">
          {activeTab === "overview" && <EquipmentOverview key={refreshKey} />}
          {activeTab === "assets" && <PendingSection title="Asset Registry" description="Track and manage all warehouse equipment assets including forklifts, conveyors, sorters, and automated systems. Asset data will populate when the equipment management API is connected." />}
          {activeTab === "maintenance" && <PendingSection title="Maintenance Scheduling" description="Preventive and corrective maintenance schedules for all tracked assets. Maintenance records require integration with the CMMS (Computerized Maintenance Management System)." />}
          {activeTab === "work-orders" && <PendingSection title="Work Orders" description="Create, assign, and track maintenance work orders. Work order management requires the equipment service API to be connected for real-time tracking." />}
          {activeTab === "performance" && <PendingSection title="Equipment Performance" description="OEE (Overall Equipment Effectiveness), uptime tracking, and performance analytics. Metrics will display once equipment telemetry feeds are integrated." />}
          {activeTab === "schedules" && <PendingSection title="Maintenance Schedules" description="Calendar view of upcoming preventive maintenance, inspections, and certifications. Schedule data requires the maintenance planning API integration." />}
        </div>
      </div>
    </div>
  );
}

function EquipmentOverview() {
  return (
    <div className="space-y-4">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard title="Total Assets" icon="📦" color="#3b82f6" />
        <KpiCard title="Active Equipment" icon="✅" color="#10b981" />
        <KpiCard title="Under Maintenance" icon="🔧" color="#f59e0b" />
        <KpiCard title="Overdue PM" icon="⚠️" color="#ef4444" />
      </div>

      {/* Main dashboard panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Equipment Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#7c3aed] rounded-full"></span>
            Equipment Status Overview
          </h3>
          <div className="py-6 text-center">
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-xs text-gray-500">Equipment status data will appear when asset telemetry is connected</p>
          </div>
        </div>

        {/* Maintenance Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#f59e0b] rounded-full"></span>
            Maintenance Activity
          </h3>
          <div className="py-6 text-center">
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-500">Maintenance logs and activity feed require CMMS integration</p>
          </div>
        </div>
      </div>

      {/* Recent Work Orders + Upcoming PM */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#3b82f6] rounded-full"></span>
            Recent Work Orders
          </h3>
          <div className="py-4 text-center">
            <p className="text-xs text-gray-400">No work orders available</p>
            <p className="text-[10px] text-gray-300 mt-1">Work orders will display when the maintenance service is connected</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#ef4444] rounded-full"></span>
            Upcoming Preventive Maintenance
          </h3>
          <div className="py-4 text-center">
            <p className="text-xs text-gray-400">No scheduled maintenance</p>
            <p className="text-[10px] text-gray-300 mt-1">PM schedules will appear when the planning module is integrated</p>
          </div>
        </div>
      </div>

      {/* Integration notice */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-800">Integration Status</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              This module provides the native equipment dashboard structure. Live metrics require
              equipment telemetry and CMMS API connections. The external Equipment Hub remains
              available via the &ldquo;Open external&rdquo; link above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, icon, color }: { title: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
      <div className="w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-lg mb-1.5" style={{ backgroundColor: `${color}15` }}>
        {icon}
      </div>
      <div className="text-xl font-bold text-gray-300">—</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{title}</div>
    </div>
  );
}

function PendingSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 max-w-md mb-4">{description}</p>
      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Integration pending
      </div>
    </div>
  );
}
