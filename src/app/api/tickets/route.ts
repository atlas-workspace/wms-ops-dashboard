import { NextRequest, NextResponse } from "next/server";

const TICKET_API_BASE = "https://unisticket.item.com";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, payload } = body as { action: string; payload: unknown };

    let path: string;
    switch (action) {
      case "page":
        path = "/v1/iam/tickets/page";
        break;
      case "search":
        path = "/v1/iam/tickets/search";
        break;
      case "priorities":
        path = "/v1/open/ticket/priorities/page";
        break;
      case "display-statuses":
        path = "/v1/open/ticket/display-statuses/page";
        break;
      default:
        return NextResponse.json({ success: false, msg: "Invalid action" }, { status: 400 });
    }

    const tenantId = request.headers.get("x-tenant-id") || "LT";

    const res = await fetch(`${TICKET_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "X-Tenant-Id": tenantId,
        "User-Agent": "wms-ops-dashboard/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, msg: "Ticket service unavailable" },
      { status: 502 }
    );
  }
}
