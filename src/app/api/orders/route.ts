import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";
const PROXY_SECRET = process.env.PROXY_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Strip frontend-only fields.
    const { productSubtotal: _unused, discountAmount: _ignored, discountPercent: _blocked, couponCode: _coupon, ...rest } = body;
    const payload = { ...rest };

    const response = await fetch(`${BACKEND_URL}/order/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(PROXY_SECRET ? { "x-proxy-secret": PROXY_SECRET } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    const msg = error?.message ?? "Unknown error";
    console.error("Order proxy error:", msg);
    return NextResponse.json(
      { error: "Failed to reach order service", detail: msg },
      { status: 502 },
    );
  }
}
