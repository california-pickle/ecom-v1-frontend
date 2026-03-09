import { NextRequest, NextResponse } from "next/server";
import { db, addLog, today, persistDb } from "@/lib/db";

// PATCH /api/bulk-orders/[id] — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bulk = db.bulkOrders.find((b) => b.id === id);
  if (!bulk) return NextResponse.json({ message: "Bulk order not found." }, { status: 404 });

  const { status } = await req.json();
  if (!["New", "Contacted", "Closed", "Cancelled"].includes(status)) {
    return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  }

  const prev = bulk.status;
  bulk.status = status;
  persistDb();

  addLog("Bulk Inquiry Updated", `${bulk.name} (${bulk.company || bulk.email}) — ${prev} → ${status}`);

  return NextResponse.json(bulk);
}
