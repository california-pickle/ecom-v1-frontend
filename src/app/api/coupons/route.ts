import { NextRequest, NextResponse } from "next/server";
import { db, generateCouponId, generateCouponCode, today, persistDb } from "@/lib/db";

export async function GET() {
  const sorted = [...db.coupons].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
  try {
    const { discountPercent, maxUses, expiresAt, note, code } = await req.json();

    if (discountPercent === undefined || discountPercent < 1 || discountPercent > 50) {
      return NextResponse.json(
        { error: "discountPercent must be between 1 and 50" },
        { status: 400 },
      );
    }

    // Enforce 3-7 day expiry window
    const now = Date.now();
    const minExpiry = new Date(now + 3 * 24 * 60 * 60 * 1000);
    const maxExpiry = new Date(now + 7 * 24 * 60 * 60 * 1000);
    const defaultExpiry = maxExpiry.toISOString().split("T")[0]; // default 7 days

    let finalExpiry = expiresAt || defaultExpiry;
    const expiryDate = new Date(finalExpiry);
    if (expiryDate < minExpiry) finalExpiry = minExpiry.toISOString().split("T")[0];
    if (expiryDate > maxExpiry) finalExpiry = maxExpiry.toISOString().split("T")[0];

    const coupon = {
      id: generateCouponId(),
      code: code || generateCouponCode(),
      discountPercent,
      maxUses: maxUses ?? 1,
      usedCount: 0,
      expiresAt: finalExpiry,
      active: true,
      createdAt: today(),
      note: note || "",
    };

    db.coupons.unshift(coupon);
    persistDb();

    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
