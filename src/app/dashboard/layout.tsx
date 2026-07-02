"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredAuth, clearAuth } from "@/lib/auth";
import { AppProvider, useApp } from "@/lib/app-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FacilitySelector } from "@/components/FacilitySelector";
import { ModuleSelector } from "@/components/ModuleSelector";

const menuItems = [
  { id: "team-dashboard", path: "/dashboard", label: "Team Dashboard", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: "dashboard", path: "/dashboard/overview", label: "Dashboard", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { id: "orders", path: "/dashboard/orders", label: "Orders & Units", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { id: "employees", path: "/dashboard/employees", label: "Employees", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "productivity", path: "/dashboard/productivity", label: "Productivity", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { id: "attendance", path: "/dashboard/attendance", label: "Attendance", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "quality", path: "/dashboard/quality", label: "Quality", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "exceptions", path: "/dashboard/exceptions", label: "Exceptions", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  { id: "reports", path: "/dashboard/reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "trends", path: "/dashboard/trends", label: "Trends", icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" },
  { id: "tickets", path: "/dashboard/tickets", label: "Support Tickets", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
  { id: "coaching", path: "/dashboard/coaching", label: "Coaching", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { id: "settings", path: "/dashboard/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { facility, setFacility, triggerRefresh, activeModule, setActiveModule } = useApp();
  const [user, setUser] = useState<{ username: string; tenantId: string } | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.push("/");
      return;
    }
    try {
      if (!auth.user || !auth.user.username) {
        clearAuth();
        router.push("/");
        return;
      }
      setUser(auth.user);
    } catch {
      clearAuth();
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextModule = pathname.startsWith("/dashboard/equipment") ? "equipment-hub" : "ops-dashboard";
    if (activeModule !== nextModule) {
      setActiveModule(nextModule);
    }
  }, [pathname, activeModule, setActiveModule]);

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  if (!user) return null;

  const facilityLabel = facility.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const isOperationsModule = activeModule === "ops-dashboard";
  const moduleLabel = isOperationsModule ? "Operations Dashboard" : "Equipment & Maintenance Hub";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 shrink-0 z-50">
        <ModuleSelector />
        <div className="ml-6 flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-800">{moduleLabel}</span>
          {isOperationsModule && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-500">{facilityLabel}</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <button
            onClick={triggerRefresh}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span className="text-gray-500">
            {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <span className="text-gray-400">
            {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 font-medium">{user.username}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 p-1" title="Sign out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {isOperationsModule ? (
          <aside className="w-56 bg-[#1a1a2e] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-white/10">
              <FacilitySelector value={facility} onChange={setFacility} />
            </div>

            <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
              {menuItems.map((item) => {
                const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/dashboard");
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-[#7c3aed]/20 text-white border-l-3 border-[#7c3aed]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <span className={isActive ? "font-medium" : ""}>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="px-4 py-3 border-t border-white/10">
              <div className="bg-[#252540] rounded-lg p-3">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider text-center">Warehouse</div>
                <div className="text-[10px] text-gray-500 mt-0.5 text-center">System Active</div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Last refresh: just now</span>
              </div>
            </div>
          </aside>
        ) : (
          <aside className="w-56 bg-[#1a1a2e] flex flex-col shrink-0">
            <nav className="flex-1 py-2">
              <button
                onClick={() => router.push("/dashboard/equipment")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm bg-[#7c3aed]/20 text-white border-l-3 border-[#7c3aed]"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Equipment Hub</span>
              </button>
            </nav>
            <div className="px-4 py-3 border-t border-white/10 text-xs text-gray-500">
              Operations Dashboard pages are hidden until the Operations Dashboard business module is selected.
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto bg-[#f0f2f5] p-5">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppProvider>
  );
}
