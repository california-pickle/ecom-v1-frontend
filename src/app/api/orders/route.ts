import { NextRequest, NextResponse } from "next/server";
import { db, persistDb } from "@/lib/db";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";
const PROXY_SECRET = process.env.PROXY_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Server-side coupon validation — only the coupon code comes from the browser.
    // discountPercent is read from the server-side DB, never from the request body.
    let discountPercent = 0;
    let matchedCoupon: (typeof db.coupons)[number] | null = null;
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
        matchedCoupon = coupon;
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
        ...(PROXY_SECRET ? { "x-proxy-secret": PROXY_SECRET } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Increment coupon usedCount AFTER successful order creation
    if (matchedCoupon) {
      matchedCoupon.usedCount += 1;
      persistDb();
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
