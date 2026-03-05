import { NextRequest, NextResponse } from "next/server";
import { db, generateBulkId, addNotification, addLog, today } from "@/lib/db";

// GET /api/bulk-orders
export async function GET() {
  const sorted = [...db.bulkOrders].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json(sorted);
}

// POST /api/bulk-orders — submit from storefront
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, quantity, message } = body;

    if (!name || !email || !phone || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newBulk = {
      id: generateBulkId(),
      name,
      email,
      phone,
      company: company ?? "",
      quantity,
      message: message ?? "",
      status: "New" as const,
      date: today(),
    };

    db.bulkOrders.unshift(newBulk);

    // Notify admin
    addNotification({
      type: "bulk_order",
      title: "New Bulk Inquiry",
      message: `${name}${company ? ` from ${company}` : ""} — ${quantity}`,
      href: "/admin/bulk-orders",
      read: false,
      date: today(),
    });

    addLog("Bulk Lead", `New bulk inquiry from ${name}${company ? ` (${company})` : ""} — ${quantity}`);

    console.log(`[EMAIL] Bulk order inquiry received from ${email} — forwarded to admin`);

    return NextResponse.json({ success: true, bulkOrder: newBulk }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
