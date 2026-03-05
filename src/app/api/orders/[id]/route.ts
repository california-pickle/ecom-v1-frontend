import { NextRequest, NextResponse } from "next/server";
import { db, triggerEmail, addNotification, addLog, today } from "@/lib/db";

// GET /api/orders/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = db.orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}

// PATCH /api/orders/[id] — update status, paymentStatus, or notes
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = db.orders.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const body = await req.json();
  const order = db.orders[idx];
  const prevStatus = order.status;

  if (body.status) order.status = body.status;
  if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
  if (body.notes !== undefined) order.notes = body.notes;

  // Log status change
  if (body.status && body.status !== prevStatus) {
    addLog("Status Changed", `${order.id} marked as ${body.status} (was ${prevStatus})`);

    addNotification({
      type: "status_change",
      title: "Order Status Updated",
      message: `${order.id} (${order.customer}) → ${body.status}`,
      href: "/admin/orders",
      read: false,
      date: today(),
    });
  }

  // Emails based on status
  if (body.status === "Shipped" && db.settings.emailNotificationsEnabled) {
    triggerEmail("shipping", order);
  } else if (body.status === "Delivered" && db.settings.emailNotificationsEnabled) {
    triggerEmail("status_update", order);
  }

  // Sync customer totalSpent on refund
  if (body.paymentStatus === "Refunded") {
    const customer = db.customers.find((c) => c.email.toLowerCase() === order.email.toLowerCase());
    if (customer) {
      customer.totalSpent = parseFloat(Math.max(0, customer.totalSpent - order.amount).toFixed(2));
    }
    addLog("Refund Issued", `${order.id} refunded — $${order.amount.toFixed(2)} to ${order.customer}`);
  }

  // Log cancellation
  if (body.status === "Cancelled") {
    addLog("Order Cancelled", `${order.id} cancelled by admin`);
  }

  return NextResponse.json(order);
}
