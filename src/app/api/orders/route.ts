import { NextRequest, NextResponse } from "next/server";
import {
  db, generateOrderId, upsertCustomer, triggerEmail,
  deductInventory, addNotification, addLog, computeMargin,
  today, Order,
} from "@/lib/db";

// GET /api/orders
export async function GET() {
  const sorted = [...db.orders].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json(sorted);
}

// POST /api/orders — create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, address, city, state, zip, country, items, total } = body;

    if (!firstName || !email || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const customerName = `${firstName} ${lastName}`.trim();
    const fullAddress = `${address}, ${city}, ${state} ${zip}, ${country}`;

    const productSummary = items
      .map((i: { sizeLabel: string; quantity: number }) => `${i.sizeLabel} ×${i.quantity}`)
      .join(", ");
    const totalQuantity = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
    const amount = parseFloat(total);

    const { cost, profit } = computeMargin(productSummary, totalQuantity, amount);

    const newOrder: Order = {
      id: generateOrderId(),
      customer: customerName,
      email,
      address: fullAddress,
      product: productSummary,
      quantity: totalQuantity,
      amount,
      cost,
      profit,
      status: "Pending",
      paymentStatus: "Paid",
      date: today(),
      notes: "",
    };

    db.orders.unshift(newOrder);
    upsertCustomer(newOrder);

    // Deduct inventory + low stock alerts
    for (const item of items as { sizeLabel: string; quantity: number }[]) {
      const lowStockProducts = deductInventory(item.sizeLabel, item.quantity);
      if (db.settings.lowStockAlertEnabled) {
        for (const prod of lowStockProducts) {
          addNotification({
            type: "low_stock",
            title: "Low Stock Alert",
            message: `${prod.variant} — only ${prod.stock} units remaining`,
            href: "/admin/products",
            read: false,
            date: today(),
          });
          addLog("Low Stock Alert", `${prod.variant} stock dropped to ${prod.stock} units`);
          console.log(`[ALERT] Low stock: ${prod.variant} — ${prod.stock} units left`);
        }
      }
    }

    // Admin notification
    if (db.settings.orderNotificationsEnabled) {
      addNotification({
        type: "order",
        title: "New Order Placed",
        message: `${newOrder.id} from ${customerName} — $${amount.toFixed(2)}`,
        href: "/admin/orders",
        read: false,
        date: today(),
      });
    }

    addLog("Order Created", `${newOrder.id} placed by ${customerName} — $${amount.toFixed(2)}`);

    if (db.settings.emailNotificationsEnabled) {
      triggerEmail("confirmation", newOrder);
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
