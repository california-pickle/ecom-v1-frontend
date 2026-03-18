import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

function getAuthHeader(req: NextRequest): Record<string, string> {
  const token = req.cookies.get("accessToken")?.value;
  return token ? { Cookie: `accessToken=${token}` } : {};
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/coupons`, {
      headers: { ...getAuthHeader(req) },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader(req) },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 502 });
  }
}
