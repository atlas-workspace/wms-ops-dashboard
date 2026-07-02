"use client";

import { useState, useRef, useEffect } from "react";
import { LT_FACILITIES, FacilityOption } from "@/lib/facilities";

interface FacilitySelectorProps {
  value: string;
  onChange: (facilityId: string) => void;
}

export function FacilitySelector({ value, onChange }: FacilitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentFacility = LT_FACILITIES.find((f) => f.id === value);
  const currentLabel = currentFacility?.name || value;

  const filtered = search
    ? LT_FACILITIES.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.id.toLowerCase().includes(search.toLowerCase())
      )
    : LT_FACILITIES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  function handleSelect(f: FacilityOption) {
    onChange(f.id);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-[#252540] text-white text-xs rounded px-2.5 py-2 border border-white/10 focus:outline-none hover:border-white/20 transition-colors flex items-center justify-between gap-1"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="truncate">{currentLabel}</span>
        </div>
        <svg className={`w-3 h-3 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1e1e38] border border-white/10 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search warehouses..."
              className="w-full bg-[#252540] text-white text-xs rounded px-2.5 py-1.5 border border-white/10 focus:outline-none focus:border-[#0066cc]/50 placeholder-gray-500"
            />
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">No warehouses match "{search}"</div>
            ) : (
              filtered.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelect(f)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors ${
                    f.id === value
                      ? "bg-[#0066cc]/20 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  <span className="text-[10px] text-gray-500 shrink-0 font-mono">{f.id.replace("LT_", "")}</span>
                </button>
              ))
            )}
          </div>
          <div className="px-3 py-1.5 border-t border-white/10 text-[10px] text-gray-500 text-center">
            {LT_FACILITIES.length} warehouses available
          </div>
        </div>
      )}
    </div>
  );
}
