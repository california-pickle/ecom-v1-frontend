import { NextRequest, NextResponse } from "next/server";
import { db, generateBulkId, addNotification, addLog, today, nowTime, persistDb } from "@/lib/db";

// GET /api/bulk-orders — list all, sorted newest first
export async function GET() {
  const sorted = [...db.bulkOrders].sort((a, b) => {
    // Priority sort: New first, then Contacted, then Closed/Cancelled
    const priority: Record<string, number> = { New: 0, Contacted: 1, Closed: 2, Cancelled: 3 };
    const pa = priority[a.status] ?? 9;
    const pb = priority[b.status] ?? 9;
    if (pa !== pb) return pa - pb;
    // Within same priority, newest first
    return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
  });
  return NextResponse.json(sorted);
}

// POST /api/bulk-orders — submit a new bulk inquiry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, quantity, message } = body;

    if (!name || !email || !phone || !quantity) {
      return NextResponse.json({ message: "Name, email, phone, and quantity are required." }, { status: 400 });
    }

    const id = generateBulkId();
    const newBulk = {
      id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      company: String(company ?? "").trim(),
      quantity: String(quantity).trim(),
      message: String(message ?? "").trim(),
      status: "New" as const,
      date: today(),
      time: nowTime(),
    };

    db.bulkOrders.unshift(newBulk);
    persistDb();

    addNotification({
      type: "order",
      title: "New Bulk Inquiry",
      message: `${name} from ${company || "unknown company"} — ${quantity}`,
      href: "/admin/bulk-orders",
      read: false,
      date: today(),
    });

    addLog("Bulk Inquiry", `New bulk inquiry from ${name} (${company || email}) — ${quantity}`);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to submit inquiry." }, { status: 500 });
  }
}
