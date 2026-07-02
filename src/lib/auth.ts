"use client";

import { decodeJwt } from "jose";

const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || "LT";
const DEFAULT_FACILITY_ID = process.env.NEXT_PUBLIC_DEFAULT_FACILITY_ID || "LT_F1";
const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "America/Los_Angeles";
const WMS_API_BASE_URL = process.env.NEXT_PUBLIC_WMS_API_BASE_URL || "https://unis.item.com/api";

function friendlySignInError(message?: string): string {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("maximum number") || normalized.includes("failed login attempts") || normalized.includes("locked")) {
    return "Your account is temporarily locked after too many failed sign-in attempts. Please wait a few minutes or contact an administrator.";
  }
  if (normalized.includes("captcha")) {
    return "Additional verification is required before sign-in. Please contact an administrator if this continues.";
  }
  if (normalized.includes("disabled") || normalized.includes("deactivated")) {
    return "This account has been deactivated. Please contact an administrator.";
  }
  if (normalized.includes("not found") || normalized.includes("no user") || normalized.includes("invalid") || normalized.includes("unauthorized") || normalized.includes("password") || normalized.includes("get token failed")) {
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

export async function login(username: string, password: string): Promise<TokenData> {
  let json: Record<string, unknown>;
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
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

  if (String(json.code) !== "0") {
    const msg = String(json.msg || json.message || "");
    throw new Error(friendlySignInError(msg));
  }

  const data = json.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new Error("Sign in is currently unavailable. Please try again in a moment.");
  }

  const accessToken = String(data.access_token || data.accessToken || "");
  const refreshToken = String(data.refresh_token || data.refreshToken || "");
  const expiresIn = Number(data.expires_in || data.expiresIn || 3600);

  if (!accessToken) {
    throw new Error("Sign in is currently unavailable. Please try again in a moment.");
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = decodeJwt(accessToken) as Record<string, unknown>;
  } catch {
    // Token may not be a standard JWT; proceed with defaults.
  }

  const tokenPayloadData = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;

  const userId = String(tokenPayloadData.user_id ?? tokenPayloadData.userId ?? payload.sub ?? username);
  const tenantId = String(tokenPayloadData.tenant_id ?? tokenPayloadData.tenantId ?? tokenPayloadData.company_code ?? DEFAULT_TENANT_ID);
  const resolvedUsername = String(tokenPayloadData.user_name ?? tokenPayloadData.username ?? tokenPayloadData.name ?? username);

  return {
    accessToken,
    refreshToken,
    expiresIn,
    user: {
      userId,
      tenantId,
      username: resolvedUsername,
      facilityId: DEFAULT_FACILITY_ID,
      facilities: [],
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
