"use client";

export function DataSourceBadge({ source, status = "live" }: { source: string; status?: "live" | "unavailable" | "pending" }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        {source}
      </span>
    );
  }
  if (status === "unavailable") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
        {source}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      {source}
    </span>
  );
}
