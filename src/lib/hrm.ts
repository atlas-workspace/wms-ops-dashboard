"use client";

import { getStoredAuth } from "./auth";

export interface Supervisor {
  id: string;
  name: string;
  employeeId?: string;
  email?: string;
  department?: string;
  position?: string;
}

export interface HrmPageResult {
  list: Supervisor[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export async function fetchSupervisors(params?: {
  pageSize?: number;
  pageIndex?: number;
  isAll?: boolean;
}): Promise<HrmPageResult> {
  const auth = getStoredAuth();
  if (!auth) throw new Error("Not authenticated");

  const qs = new URLSearchParams({
    pageSize: String(params?.pageSize ?? 10),
    pageIndex: String(params?.pageIndex ?? 1),
    isAll: String(params?.isAll ?? false),
  });

  const res = await fetch(`/api/hrm/supervisors?${qs}`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  if (res.status === 401) {
    throw new Error("Session expired — please sign in again");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "HRM service is currently unavailable");
  }

  const json = await res.json();

  if (json.code !== undefined && String(json.code) !== "0") {
    throw new Error(json.msg || "Unable to load team data");
  }

  const payload = json.data ?? json;

  if (Array.isArray(payload?.records || payload?.list || payload?.content)) {
    const items = payload.records || payload.list || payload.content || [];
    return {
      list: items.map(normalizeSupervisor),
      total: payload.total ?? payload.totalElements ?? items.length,
      pageIndex: payload.pageIndex ?? payload.current ?? 1,
      pageSize: payload.pageSize ?? payload.size ?? 10,
    };
  }

  if (Array.isArray(payload)) {
    return {
      list: payload.map(normalizeSupervisor),
      total: payload.length,
      pageIndex: 1,
      pageSize: payload.length,
    };
  }

  return { list: [], total: 0, pageIndex: 1, pageSize: 10 };
}

function normalizeSupervisor(raw: Record<string, unknown>): Supervisor {
  return {
    id: String(raw.id ?? raw.userId ?? raw.employeeId ?? ""),
    name: String(raw.name ?? raw.employeeName ?? raw.userName ?? raw.label ?? ""),
    employeeId: raw.employeeId ? String(raw.employeeId) : undefined,
    email: raw.email ? String(raw.email) : undefined,
    department: raw.department
      ? String(raw.department)
      : raw.deptName
      ? String(raw.deptName)
      : undefined,
    position: raw.position
      ? String(raw.position)
      : raw.jobTitle
      ? String(raw.jobTitle)
      : undefined,
  };
}
