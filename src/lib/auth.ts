"use client";

import { decodeJwt } from "jose";

const IAM_BASE_URL = process.env.NEXT_PUBLIC_IAM_BASE_URL || "https://iam-staging.item.com/api";
const WMS_API_BASE_URL = process.env.NEXT_PUBLIC_WMS_API_BASE_URL || "https://wms-staging.item.com/api";

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
  const res = await fetch(`${IAM_BASE_URL}/auth/exchange-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "password", username, password }),
  });
  const json = await res.json();
  if (String(json.code) !== "0") {
    throw new Error(json.msg || "Login failed");
  }
  const { access_token, refresh_token, expires_in } = json.data;
  const payload = decodeJwt(access_token);
  const data = (payload as Record<string, unknown>).data as Record<string, string>;
  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
    user: {
      userId: data.user_id,
      tenantId: data.tenant_id || data.company_code,
      username: data.user_name || data.username || username,
    },
  };
}

export function getStoredAuth(): TokenData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("wms_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
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
