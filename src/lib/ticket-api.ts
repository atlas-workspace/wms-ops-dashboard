"use client";

import { getStoredAuth } from "./auth";

export interface TicketRecord {
  id?: number | string;
  ticketNumber?: string;
  title?: string;
  subject?: string;
  displayStatusId?: number;
  displayStatusName?: string;
  priorityId?: number;
  priorityName?: string;
  staffId?: number;
  staffName?: string;
  customerId?: number;
  customerName?: string;
  departmentId?: number;
  departmentName?: string;
  sourceChannel?: number;
  replyStatus?: number;
  createdTime?: string;
  updatedTime?: string;
  createTime?: string;
  updateTime?: string;
  dueDate?: string;
  [key: string]: unknown;
}

export interface TicketPageResult {
  total?: number;
  records?: TicketRecord[];
  list?: TicketRecord[];
  content?: TicketRecord[];
  size?: number;
  current?: number;
}

export interface TicketApiResponse {
  code?: number;
  msg?: string;
  data?: TicketPageResult | TicketRecord[];
  success?: boolean;
}

export interface TicketPriority {
  id: number;
  name: string;
  color?: string;
  level?: number;
}

export interface TicketDisplayStatus {
  id: number;
  name: string;
  code?: number | string;
  systemStatus?: number;
  color?: string;
}

async function ticketPost<T>(action: string, payload: unknown): Promise<T | null> {
  try {
    const auth = getStoredAuth();
    if (!auth) return null;

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
        "x-tenant-id": auth.user.tenantId || "LT",
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!res.ok) return null;
    const json: TicketApiResponse = await res.json();
    if (json.success === false && json.code !== 0) return null;
    return (json.data as T) ?? null;
  } catch {
    return null;
  }
}

export async function pageTickets(page: number = 1, size: number = 20, input?: Record<string, unknown>): Promise<{ total: number; records: TicketRecord[] } | null> {
  const data = await ticketPost<TicketPageResult>("page", {
    page,
    size,
    input: input || {},
  });
  if (!data) return null;
  const records = data.records || data.list || data.content || [];
  return { total: data.total ?? records.length, records };
}

export async function searchTickets(keyword: string, size: number = 20): Promise<TicketRecord[] | null> {
  const data = await ticketPost<TicketPageResult | TicketRecord[]>("search", {
    keyword,
    size,
    includeContent: false,
  });
  if (!data) return null;
  if (Array.isArray(data)) return data;
  const page = data as TicketPageResult;
  return page.records || page.list || page.content || [];
}

export async function getTicketPriorities(): Promise<TicketPriority[] | null> {
  const data = await ticketPost<TicketPageResult>("priorities", {
    page: 1,
    size: 50,
    input: {},
  });
  if (!data) return null;
  const records = data.records || data.list || data.content || [];
  return records as unknown as TicketPriority[];
}

export async function getTicketDisplayStatuses(): Promise<TicketDisplayStatus[] | null> {
  const data = await ticketPost<TicketPageResult>("display-statuses", {
    page: 1,
    size: 50,
    input: {},
  });
  if (!data) return null;
  const records = data.records || data.list || data.content || [];
  return records as unknown as TicketDisplayStatus[];
}
