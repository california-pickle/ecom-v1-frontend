import { NextRequest, NextResponse } from "next/server";
import { db, addLog, addNotification, today } from "@/lib/db";

// PATCH /api/bulk-orders/[id] — update status or convert to order
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bulk = db.bulkOrders.find((b) => b.id === id);
  if (!bulk) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  if (body.status) {
    const prevStatus = bulk.status;
    bulk.status = body.status;
    addLog(
      "Bulk Lead Updated",
      `${bulk.id} (${bulk.name}) status changed from ${prevStatus} to ${body.status}`
    );
  }

  return NextResponse.json(bulk);
}

// GET /api/bulk-orders/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bulk = db.bulkOrders.find((b) => b.id === id);
  if (!bulk) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bulk);
}
