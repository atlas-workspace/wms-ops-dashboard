"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Dashboard could not load</h2>
        <p className="mt-2 text-sm text-gray-500">
          Your session is active, but the dashboard workspace could not be prepared. Please retry, or sign out and sign in again.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6d28d9]"
        >
          Reload dashboard
        </button>
      </div>
    </div>
  );
}
