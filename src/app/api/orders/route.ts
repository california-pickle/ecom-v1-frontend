import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Server-side coupon validation — only the coupon code comes from the browser.
    // discountPercent is read from the server-side DB, never from the request body.
    let discountPercent = 0;
    if (body.couponCode) {
      const now = new Date();
      const coupon = db.coupons.find(
        (c) =>
          c.code.toLowerCase() === body.couponCode.toLowerCase() &&
          c.active &&
          now <= new Date(c.expiresAt) &&
          c.usedCount < c.maxUses,
      );
      if (coupon) {
        discountPercent = coupon.discountPercent;
      }
    }

    // Strip frontend-only fields. discountPercent is always server-computed.
    const { productSubtotal: _unused, discountAmount: _ignored, discountPercent: _blocked, ...rest } = body;
    const payload = {
      ...rest,
      discountPercent,
    };

    const response = await fetch(`${BACKEND_URL}/order/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
