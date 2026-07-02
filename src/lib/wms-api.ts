"use client";

import { getWmsHeaders, getWmsBaseUrl, getStoredAuth } from "./auth";

const HRM_BASE_URL = "https://hrm.item.com";

async function wmsPost<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${getWmsBaseUrl()}${path}`, {
      method: "POST",
      headers: getWmsHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (json.success || String(json.code) === "0") {
      return json.data as T;
    }
    return null;
  } catch {
    return null;
  }
}

async function wmsGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getWmsBaseUrl()}${path}`, {
      method: "GET",
      headers: getWmsHeaders(),
    });
    const json = await res.json();
    if (json.success || String(json.code) === "0") {
      return json.data as T;
    }
    return null;
  } catch {
    return null;
  }
}

export interface ShipmentStats {
  plannedShipmentQty: number;
  unshippedQty: number;
  actualQty: number;
  completionRate: number;
  statisticsDate: string;
}

export interface ShipmentProgress {
  requiredQty: number;
  shippedQty: number;
  pickedQty: number;
  unpickedQty: number;
  uncommitQty: number;
  progressRate: number;
}

export interface TaskActionStats {
  itemIdCount: number;
  barcodeCount: number;
  itemNoCount: number;
}

export async function getDailyShipmentStats(date?: string): Promise<ShipmentStats | null> {
  return wmsPost<ShipmentStats>("/wms/shipment-statistics/daily", { date });
}

export async function getShipmentProgress(): Promise<ShipmentProgress | null> {
  return wmsPost<ShipmentProgress>("/wms-bam/outbound/shipment-progress/summary", {
    currentPage: 1,
    pageSize: 100,
  });
}

export async function getTaskActionStats(actionTypes?: string[]): Promise<TaskActionStats | null> {
  return wmsPost<TaskActionStats>("/wms/task-action/statistics", {
    actionTypes: actionTypes || ["PICK", "PACK", "SORTING", "STAGE"],
    currentPage: 1,
    pageSize: 100,
  });
}

export async function getTaskStatusSummary(taskType?: string): Promise<Record<string, unknown> | null> {
  return wmsPost<Record<string, unknown>>("/wms-bam/tasks/search/status/summary", {
    taskType,
    currentPage: 1,
    pageSize: 100,
  });
}

export interface OrderRecord {
  id?: string;
  orderId?: string;
  orderNo?: string;
  status?: string;
  customerId?: string;
  createdTime?: string;
  [key: string]: unknown;
}

export interface OrderSearchResult {
  total?: number;
  records?: OrderRecord[];
}

export async function searchOrders(params?: Record<string, unknown>): Promise<OrderSearchResult | null> {
  return wmsPost<OrderSearchResult>("/wms-bam/outbound/order/raw-search", {
    currentPage: 1,
    pageSize: 20,
    ...params,
  });
}

export async function getDeviceStatusSummary(): Promise<Record<string, unknown> | null> {
  return wmsGet<Record<string, unknown>>("/wms-bam/wcs/device-status-summary/all");
}

// HRM Ownership Card integration
export interface OwnershipCard {
  id?: string;
  userId?: string;
  employeeId?: string;
  name?: string;
  displayName?: string;
  role?: string;
  team?: string;
  department?: string;
  avatar?: string;
  status?: string;
  [key: string]: unknown;
}

export interface HrmResponse {
  data?: OwnershipCard[] | OwnershipCard | null;
  items?: OwnershipCard[];
  records?: OwnershipCard[];
  code?: number | string;
  success?: boolean;
  message?: string;
  error?: string;
}

export async function fetchOwnershipCards(): Promise<OwnershipCard[] | null> {
  try {
    const auth = getStoredAuth();
    if (!auth) return null;

    const res = await fetch(`${HRM_BASE_URL}/ownership-card`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
        "x-tenant-id": auth.user.tenantId || "LT",
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return null;
      return null;
    }

    const json: HrmResponse = await res.json();

    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.items)) return json.items;
    if (Array.isArray(json.records)) return json.records;
    if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) return [json.data];
    return null;
  } catch {
    return null;
  }
}

export async function fetchOwnershipCardById(id: string): Promise<OwnershipCard | null> {
  try {
    const auth = getStoredAuth();
    if (!auth) return null;

    const res = await fetch(`${HRM_BASE_URL}/ownership-card/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
        "x-tenant-id": auth.user.tenantId || "LT",
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return (json.data as OwnershipCard) || null;
  } catch {
    return null;
  }
}
