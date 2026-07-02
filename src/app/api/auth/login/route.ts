import { NextRequest, NextResponse } from "next/server";

const IAM_BASE_URL = process.env.NEXT_PUBLIC_IAM_BASE_URL || "https://id.item.com";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: -1, msg: "Invalid request" },
      { status: 400 }
    );
  }

  if (!body.username || !body.password) {
    return NextResponse.json(
      { code: -1, msg: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${IAM_BASE_URL}/auth/exchange-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "password",
        username: body.username,
        password: body.password,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { code: -1, msg: "Authentication service unavailable" },
        { status: 502 }
      );
    }

    const json = await res.json();
    return NextResponse.json(json, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json(
      { code: -1, msg: "Unable to reach authentication service" },
      { status: 502 }
    );
  }
}
