import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard — fully live computed stats
export async function GET() {
  const orders = db.orders;
  const activeOrders = orders.filter((o) => o.status !== "Cancelled" && o.paymentStatus !== "Refunded");

  const totalRevenue = parseFloat(activeOrders.reduce((sum, o) => sum + o.amount, 0).toFixed(2));
  const totalProfit = parseFloat(activeOrders.reduce((sum, o) => sum + o.profit, 0).toFixed(2));
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const conversionRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : "0.0";
  const aov = activeOrders.length > 0 ? (totalRevenue / activeOrders.length).toFixed(2) : "0.00";
  const marginPct = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Chart data — revenue + profit grouped by date
  const byDate: Record<string, { revenue: number; profit: number }> = {};
  for (const o of activeOrders) {
    if (!byDate[o.date]) byDate[o.date] = { revenue: 0, profit: 0 };
    byDate[o.date].revenue = parseFloat((byDate[o.date].revenue + o.amount).toFixed(2));
    byDate[o.date].profit = parseFloat((byDate[o.date].profit + o.profit).toFixed(2));
  }
  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date: date.slice(5), ...vals }));

  // Recent 6 orders
  const recentOrders = [...orders]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  // Low stock products
  const lowStockProducts = db.products.filter((p) => p.stock <= p.lowStockThreshold);

  // Top products by revenue (live)
  const topProducts = [...db.products]
    .map((p) => ({
      id: p.id,
      variant: p.variant,
      sellingPrice: p.sellingPrice,
      costPrice: p.costPrice,
      stock: p.stock,
      sold: p.sold,
      revenue: parseFloat((p.sellingPrice * p.sold).toFixed(2)),
      profit: parseFloat(((p.sellingPrice - p.costPrice) * p.sold).toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Pending orders count
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const newBulkLeads = db.bulkOrders.filter((b) => b.status === "New").length;

  return NextResponse.json({
    totalRevenue,
    totalProfit,
    marginPct,
    totalOrders,
    pendingOrders,
    conversionRate,
    aov,
    chartData,
    recentOrders,
    totalCustomers: db.customers.length,
    lowStockProducts,
    topProducts,
    newBulkLeads,
    unreadNotifications: db.notifications.filter((n) => !n.read).length,
  });
}
