import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Coupon code is required" },
        { status: 400 },
      );
    }

    const coupon = db.coupons.find(
      (c) => c.code.toLowerCase() === code.toLowerCase(),
    );

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: "Coupon not found" },
        { status: 400 },
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { valid: false, message: "Coupon is no longer active" },
        { status: 400 },
      );
    }

    const now = new Date();
    const expires = new Date(coupon.expiresAt);
    if (now > expires) {
      return NextResponse.json(
        { valid: false, message: "Coupon has expired" },
        { status: 400 },
      );
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, message: "Coupon has reached its usage limit" },
        { status: 400 },
      );
    }

    // Valid — return details without incrementing (usage is incremented at order placement via /api/coupons/redeem)
    return NextResponse.json({
      valid: true,
      discountPercent: coupon.discountPercent,
      code: coupon.code,
    });
  } catch {
    return NextResponse.json(
      { valid: false, message: "Invalid request body" },
      { status: 400 },
    );
  }
}
