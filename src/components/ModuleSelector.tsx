"use client";

import { useState, useRef, useEffect } from "react";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  path?: string;
}

const MODULES: Module[] = [
  {
    id: "ops-dashboard",
    name: "Operations Dashboard",
    description: "Warehouse, Workforce & Ticket Management",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    active: true,
    path: "/dashboard",
  },
  {
    id: "equipment-hub",
    name: "Equipment & Maintenance Hub",
    description: "Asset tracking, maintenance schedules & work orders",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    active: false,
    path: "/dashboard/equipment",
  },
];

export function ModuleSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = MODULES.find((m) => m.active) || MODULES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="bg-[#7c3aed] text-white font-bold text-sm px-2 py-0.5 rounded">
          Item
        </div>
        <span className="text-sm font-semibold text-gray-800">{current.name}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-[100] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Module</h3>
          </div>
          <div className="p-2">
            {MODULES.map((mod) => (
              <ModuleItem key={mod.id} module={mod} onSelect={() => setOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleItem({ module, onSelect }: { module: Module; onSelect: () => void }) {
  function handleClick() {
    if (module.active) {
      onSelect();
      return;
    }
    if (module.path) {
      window.location.href = module.path;
    }
    onSelect();
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
        module.active
          ? "bg-[#7c3aed]/5 border border-[#7c3aed]/20"
          : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        module.active ? "bg-[#7c3aed]/10" : "bg-gray-100"
      }`}>
        <svg className={`w-5 h-5 ${module.active ? "text-[#7c3aed]" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={module.icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${module.active ? "text-[#7c3aed]" : "text-gray-800"}`}>
            {module.name}
          </span>
          {module.active && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#7c3aed] text-white font-medium">Active</span>
          )}
          {!module.active && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">Pending</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
      </div>
    </button>
  );
}
