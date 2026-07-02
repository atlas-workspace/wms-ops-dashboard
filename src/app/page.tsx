"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, loginWithToken, storeAuth, clearAuth, getStoredAuth, validateTokenStructure } from "@/lib/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "token">("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tokenInput, setTokenInput] = useState("");
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

  async function handlePasswordSubmit(e: React.FormEvent) {
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

  async function handleTokenSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const token = tokenInput.trim().replace(/^Bearer\s+/i, "");
    if (!validateTokenStructure(token)) {
      setError("This doesn't look like a valid session token. Please paste the full bearer token from your active Item session.");
      return;
    }

    setLoading(true);
    try {
      const data = loginWithToken(token);
      storeAuth(data);
      setTokenInput("");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not use this token.");
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
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800 text-center">Sign In</h2>

          {/* Mode tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode("password"); setError(""); }}
              className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                mode === "password"
                  ? "bg-white text-gray-800 font-medium shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Credentials
            </button>
            <button
              type="button"
              onClick={() => { setMode("token"); setError(""); }}
              className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                mode === "token"
                  ? "bg-white text-gray-800 font-medium shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Session Token
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {mode === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] text-gray-900"
                  placeholder="Enter username"
                  required
                  disabled={loading}
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
                  disabled={loading}
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
          ) : (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Token</label>
                <textarea
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0066cc] text-gray-900 resize-none"
                  placeholder="Paste your bearer token from an active Item session (HRM, WMS, etc.)"
                  rows={4}
                  required
                  disabled={loading}
                  spellCheck={false}
                  autoComplete="off"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Your token stays in this browser only. Use DevTools &rarr; Network &rarr; copy the Authorization header value from any Item request.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="w-full bg-[#0066cc] text-white py-2.5 rounded font-medium text-sm hover:bg-[#0055aa] disabled:opacity-50 transition-colors"
              >
                {loading ? "Validating..." : "Continue with token"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
