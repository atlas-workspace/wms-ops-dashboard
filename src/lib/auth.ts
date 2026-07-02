"use client";

import { decodeJwt } from "jose";

const IAM_BASE_URL = process.env.NEXT_PUBLIC_IAM_BASE_URL || "https://id.item.com";
const WMS_API_BASE_URL = process.env.NEXT_PUBLIC_WMS_API_BASE_URL || "https://unis.item.com/api";

function friendlySignInError(message?: string): string {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("not_found") || normalized.includes("404") || normalized.includes("get token failed")) {
    return "We could not sign you in with those credentials. Please check your username and password, then try again.";
  }
  if (normalized.includes("failed") || normalized.includes("invalid") || normalized.includes("unauthorized")) {
    return "We could not sign you in with those credentials. Please check your username and password, then try again.";
  }
  return "Sign in is currently unavailable. Please try again in a moment.";
}

export interface AuthUser {
  userId: string;
  tenantId: string;
  username: string;
  facilityId?: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export async function login(username: string, password: string): Promise<TokenData> {
  let json: { code?: string | number; msg?: string; data?: { access_token?: string; refresh_token?: string; expires_in?: number } };
  try {
    const res = await fetch(`${IAM_BASE_URL}/auth/exchange-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "password", username, password }),
    });
    json = await res.json();
  } catch {
    throw new Error("Sign in is currently unavailable. Please try again in a moment.");
  }

  if (String(json.code) !== "0" || !json.data?.access_token) {
    throw new Error(friendlySignInError(json.msg));
  }
  const access_token = json.data.access_token;
  const refresh_token = json.data.refresh_token || "";
  const expires_in = json.data.expires_in || 0;
  let payload: Record<string, unknown> = {};
  try {
    payload = decodeJwt(access_token) as Record<string, unknown>;
  } catch {
    // Keep the UI stable if the identity provider changes token format.
  }
  const tokenData = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;
  const userId = String(tokenData.user_id || tokenData.userId || tokenData.id || payload.sub || username);
  const tenantId = String(tokenData.tenant_id || tokenData.tenantId || tokenData.company_code || tokenData.companyCode || "LT");
  const displayName = String(tokenData.user_name || tokenData.username || tokenData.name || username);

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
    user: {
      userId,
      tenantId,
      username: displayName,
    },
  };
}

export function getStoredAuth(): TokenData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("wms_auth");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TokenData>;
    if (!parsed.accessToken || !parsed.user || !parsed.user.username) {
      clearAuth();
      return null;
    }
    return {
      accessToken: String(parsed.accessToken),
      refreshToken: String(parsed.refreshToken || ""),
      expiresIn: Number(parsed.expiresIn || 0),
      user: {
        userId: String(parsed.user.userId || parsed.user.username),
        tenantId: String(parsed.user.tenantId || "LT"),
        username: String(parsed.user.username),
        facilityId: parsed.user.facilityId,
      },
    };
  } catch {
    clearAuth();
    return null;
  }
}

export function storeAuth(data: TokenData) {
  localStorage.setItem("wms_auth", JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem("wms_auth");
  localStorage.removeItem("wms_facility");
}

export function getStoredFacility(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("wms_facility") || "";
}

export function storeFacility(facilityId: string) {
  localStorage.setItem("wms_facility", facilityId);
}

export function getWmsHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  const facility = getStoredFacility();
  if (!auth) return {};
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${auth.accessToken}`,
    "x-tenant-id": auth.user.tenantId,
    "x-facility-id": facility || "",
    "item-time-zone": "America/Los_Angeles",
  };
}

export function getWmsBaseUrl(): string {
  return WMS_API_BASE_URL;
}
