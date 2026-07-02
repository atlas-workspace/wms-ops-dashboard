"use client";

import { getWmsHeaders, getWmsBaseUrl } from "./auth";

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

export interface OrderSearchResult {
  total?: number;
  records?: Array<Record<string, unknown>>;
}

export async function searchOrders(params?: Record<string, unknown>): Promise<OrderSearchResult | null> {
  return wmsPost<OrderSearchResult>("/wms-bam/outbound/order/raw-search", {
    currentPage: 1,
    pageSize: 20,
    ...params,
  });
}
