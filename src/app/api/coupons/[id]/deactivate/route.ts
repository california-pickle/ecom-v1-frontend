import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.cookies.get("accessToken")?.value;
    const res = await fetch(`${BACKEND_URL}/coupons/${id}/deactivate`, {
      method: "PUT",
      headers: token ? { Cookie: `accessToken=${token}` } : {},
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to deactivate coupon" }, { status: 502 });
  }
}
