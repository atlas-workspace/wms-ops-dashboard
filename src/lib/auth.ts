"use client";

import { decodeJwt } from "jose";

const WMS_API_BASE_URL = process.env.NEXT_PUBLIC_WMS_API_BASE_URL || "https://unis.item.com/api";
const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || "LT";
const DEFAULT_FACILITY_ID = process.env.NEXT_PUBLIC_DEFAULT_FACILITY_ID || "LT_F1";
const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "America/Los_Angeles";

function friendlySignInError(message?: string): string {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("maximum number") || normalized.includes("failed login attempts") || normalized.includes("locked")) {
    return "Your account is temporarily locked after too many failed sign-in attempts. Please wait a few minutes or contact an administrator.";
  }
  if (normalized.includes("captcha")) {
    return "Additional verification is required before sign-in. Please contact an administrator if this continues.";
  }
  if (normalized.includes("get token failed") || normalized.includes("invalid") || normalized.includes("unauthorized") || normalized.includes("password")) {
    return "We could not sign you in with those credentials. Please check your username and password, then try again.";
  }
  return message && message.length < 140 ? message : "Sign in is currently unavailable. Please try again in a moment.";
}

export interface AuthUser {
  userId: string;
  tenantId: string;
  username: string;
  facilityId?: string;
  facilities?: Array<{ id: string; name?: string; timeZone?: string }>;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

type WmsLoginResponse = {
  code?: string | number;
  success?: boolean;
  msg?: string;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    userInfo?: {
      id?: string;
      userId?: string;
      userName?: string;
      username?: string;
      tenantId?: string;
      companyCode?: string;
      profile?: {
        defaultFacilityId?: string;
        facilities?: Array<{ id?: string; name?: string; timeZone?: string }>;
      };
    };
  };
};

export async function login(username: string, password: string): Promise<TokenData> {
  let json: WmsLoginResponse;
  try {
    const res = await fetch(`${WMS_API_BASE_URL}/wms-bam/auth/login-by-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": DEFAULT_TENANT_ID,
        "x-facility-id": DEFAULT_FACILITY_ID,
        "item-time-zone": DEFAULT_TIMEZONE,
      },
      body: JSON.stringify({ username, password, tenantId: DEFAULT_TENANT_ID }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Sign in is currently unavailable. Please try again in a moment.");
    }
    json = await res.json();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Sign in")) throw error;
    throw new Error("Sign in is currently unavailable. Please try again in a moment.");
  }

  if (!(json.success || String(json.code) === "0") || !json.data?.accessToken) {
    throw new Error(friendlySignInError(json.msg || json.message));
  }

  const accessToken = json.data.accessToken;
  const refreshToken = json.data.refreshToken || "";
  const userInfo = json.data.userInfo || {};

  let payload: Record<string, unknown> = {};
  try {
    payload = decodeJwt(accessToken) as Record<string, unknown>;
  } catch {
    // Keep the UI stable if token format changes.
  }
  const tokenData = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;
  const facilities = (userInfo.profile?.facilities || [])
    .filter((facility) => facility.id)
    .map((facility) => ({ id: String(facility.id), name: facility.name, timeZone: facility.timeZone }));
  const facilityId = userInfo.profile?.defaultFacilityId || facilities[0]?.id || DEFAULT_FACILITY_ID;
  const expiresIn = json.data.expiresAt ? Math.max(0, new Date(json.data.expiresAt).getTime() - Date.now()) : 0;

  return {
    accessToken,
    refreshToken,
    expiresIn,
    user: {
      userId: String(userInfo.userId || userInfo.id || tokenData.user_id || tokenData.userId || payload.sub || username),
      tenantId: String(userInfo.tenantId || userInfo.companyCode || tokenData.tenant_id || tokenData.company_code || DEFAULT_TENANT_ID),
      username: String(userInfo.userName || userInfo.username || tokenData.user_name || tokenData.username || username),
      facilityId,
      facilities,
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
        tenantId: String(parsed.user.tenantId || DEFAULT_TENANT_ID),
        username: String(parsed.user.username),
        facilityId: parsed.user.facilityId,
        facilities: parsed.user.facilities || [],
      },
    };
  } catch {
    clearAuth();
    return null;
  }
}

export function storeAuth(data: TokenData) {
  localStorage.setItem("wms_auth", JSON.stringify(data));
  if (data.user.facilityId) storeFacility(data.user.facilityId);
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
    "x-facility-id": facility || auth.user.facilityId || DEFAULT_FACILITY_ID,
    "item-time-zone": DEFAULT_TIMEZONE,
  };
}

export function getWmsBaseUrl(): string {
  return WMS_API_BASE_URL;
}
