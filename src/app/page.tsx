"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, storeAuth, clearAuth, getStoredAuth } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const auth = getStoredAuth();
      if (auth?.accessToken && auth?.user?.username) {
        router.push("/dashboard");
      }
    } catch {
      clearAuth();
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      storeAuth(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-white text-[#1a1a2e] font-bold text-xl px-3 py-1 rounded">UNIS</div>
            <div className="bg-[#0066cc] text-white font-semibold text-sm px-3 py-1 rounded">
              VERINT Workforce Optimization
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Operations Manager</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800 text-center">Sign In</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] text-gray-900"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] text-gray-900"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066cc] text-white py-2.5 rounded font-medium text-sm hover:bg-[#0055aa] disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
