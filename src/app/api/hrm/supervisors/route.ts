import { NextRequest, NextResponse } from "next/server";

const HRM_BASE_URL = "https://hrm.item.com";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const pageSize = searchParams.get("pageSize") || "10";
  const pageIndex = searchParams.get("pageIndex") || "1";
  const isAll = searchParams.get("isAll") || "false";

  const url = `${HRM_BASE_URL}/hrm/employee/v1/supervisor/dropdown/page?pageSize=${pageSize}&pageIndex=${pageIndex}&isAll=${isAll}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "x-tenant-id": "LT",
        "x-screen-id": "OwnershipCard",
        "Item-Time-Zone": "America/Los_Angeles",
        "x-channel": "WEB",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "HRM service unavailable", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to reach HRM service" },
      { status: 502 }
    );
  }
}
