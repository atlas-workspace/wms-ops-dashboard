"use client";

import { getWmsHeaders, getWmsBaseUrl } from "./auth";

const customerNameCache = new Map<string, string>();

export async function resolveCustomerNames(orgIds: string[]): Promise<Map<string, string>> {
  const uncached = orgIds.filter((id) => id && !customerNameCache.has(id));
  if (uncached.length === 0) {
    return new Map(orgIds.filter(Boolean).map((id) => [id, customerNameCache.get(id) || id]));
  }

  try {
    const res = await fetch(`${getWmsBaseUrl()}/mdm/customer/search`, {
      method: "POST",
      headers: getWmsHeaders(),
      body: JSON.stringify({ orgIds: uncached, scenario: "BASIC" }),
    });
    const json = await res.json();
    if ((json.success || String(json.code) === "0") && Array.isArray(json.data)) {
      for (const customer of json.data) {
        const orgId = customer.orgId as string;
        const name = (customer.name || customer.customerCode || orgId) as string;
        if (orgId) customerNameCache.set(orgId, name);
      }
    }
  } catch {
    // Cache miss is acceptable; we'll show the raw ID
  }

  return new Map(orgIds.filter(Boolean).map((id) => [id, customerNameCache.get(id) || id]));
}

export function getCachedCustomerName(orgId: string): string | undefined {
  return customerNameCache.get(orgId);
}
