"use client";

import { useState } from "react";

const EQUIPMENT_HUB_URL = "https://unis-equipment-performance-maintenance-hub.coolify.item.pub/dashboard";

export default function EquipmentPage() {
  const [embedFailed, setEmbedFailed] = useState(false);

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
            Open in new tab
          </a>
        </div>
      </div>

      {/* Embedded hub or fallback */}
      {embedFailed ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Unable to embed Equipment Hub</h2>
          <p className="text-sm text-gray-500 max-w-md mb-5">
            The Equipment & Maintenance Hub could not be loaded inline due to security restrictions. You can access it directly in a new browser tab.
          </p>
          <a
            href={EQUIPMENT_HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] text-white text-sm font-medium rounded-lg hover:bg-[#6d28d9] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Equipment Hub
          </a>
          <button
            onClick={() => setEmbedFailed(false)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Try embedding again
          </button>
        </div>
      ) : (
        <div className="flex-1 relative bg-[#f0f2f5]">
          <iframe
            src={EQUIPMENT_HUB_URL}
            className="absolute inset-0 w-full h-full border-0"
            title="Equipment & Maintenance Hub"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onError={() => setEmbedFailed(true)}
            onLoad={(e) => {
              try {
                const frame = e.currentTarget;
                if (!frame.contentWindow?.document) {
                  setEmbedFailed(true);
                }
              } catch {
                setEmbedFailed(true);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
