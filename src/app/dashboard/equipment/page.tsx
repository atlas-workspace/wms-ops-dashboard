"use client";

const EQUIPMENT_HUB_URL = "https://unis-equipment-performance-maintenance-hub.coolify.item.pub/dashboard";

export default function EquipmentPage() {
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

      {/* Embedded dashboard */}
      <div className="flex-1 relative">
        <iframe
          src={EQUIPMENT_HUB_URL}
          className="absolute inset-0 w-full h-full border-0"
          title="Equipment & Maintenance Hub"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
