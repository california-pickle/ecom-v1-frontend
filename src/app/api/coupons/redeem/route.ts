import { NextRequest, NextResponse } from "next/server";
import { db, persistDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = db.coupons.find((c) => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon || !coupon.active || coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon no longer valid" }, { status: 400 });
    }

    coupon.usedCount += 1;
    persistDb();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
