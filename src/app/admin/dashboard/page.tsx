"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Users, DollarSign,
  ArrowUpRight, RefreshCw, AlertTriangle, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";

interface BackendOrder {
  _id: string;
  email: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
  items: { name: string; sizeLabel: string; quantity: number; priceAtPurchase: number }[];
  totalAmount: number;
  shippingCost: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: string;
  createdAt: string;
}

interface BackendVariant {
  _id: string;
  sizeLabel: string;
  stock: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "UPCOMING";
}

interface BackendProduct {
  _id: string;
  name: string;
  variants: BackendVariant[];
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  aov: string;
  chartData: { date: string; revenue: number }[];
  recentOrders: BackendOrder[];
  lowStockVariants: { productName: string; sizeLabel: string; stock: number; status: string }[];
  activeBulkLeads: number;
}

const orderStatusColors: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-600",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const orderStatusLabel: Record<string, string> = {
  pending_payment: "Pending Payment",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setError(false);
    try {
      const [ordersRes, productsRes, bulkRes] = await Promise.all([
        axiosInstance.get("/order/all?page=1&limit=500"),
        axiosInstance.get("/products/all"),
        fetch("/api/bulk-orders", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
      ]);

      const orders: BackendOrder[] = ordersRes.data.orders ?? [];
      const products: BackendProduct[] =
        Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products ?? []);

      const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
      const pendingOrders = orders.filter((o) =>
        o.orderStatus === "pending_payment" || o.orderStatus === "processing"
      );
      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const aov = paidOrders.length > 0 ? (totalRevenue / paidOrders.length).toFixed(2) : "0.00";
      const uniqueEmails = new Set(orders.map((o) => o.email));

      // Revenue chart grouped by day
      const byDate: Record<string, number> = {};
      for (const o of paidOrders) {
        const date = o.createdAt.split("T")[0];
        byDate[date] = (byDate[date] || 0) + o.totalAmount;
      }
      const chartData = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30)
        .map(([date, revenue]) => ({
          date: date.slice(5),
          revenue: parseFloat(revenue.toFixed(2)),
        }));

      // Recent 6 orders
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

      // Low stock variants from products
      const lowStockVariants: DashboardStats["lowStockVariants"] = [];
      for (const product of products) {
        for (const variant of (product.variants ?? [])) {
          if (variant.stockStatus === "LOW_STOCK" || variant.stockStatus === "OUT_OF_STOCK") {
            lowStockVariants.push({
              productName: product.name,
              sizeLabel: variant.sizeLabel,
              stock: variant.stock,
              status: variant.stockStatus,
            });
          }
        }
      }

      const bulkOrders: { status: string }[] = Array.isArray(bulkRes) ? bulkRes : [];
      const activeBulkLeads = bulkOrders.filter((b) => b.status === "New" || b.status === "Contacted").length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingOrders: pendingOrders.length,
        totalCustomers: uniqueEmails.size,
        aov,
        chartData,
        recentOrders,
        lowStockVariants,
        activeBulkLeads,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading dashboard...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm font-semibold">Failed to load dashboard data.</p>
        <button
          onClick={() => { setLoading(true); fetchDashboard(); }}
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 bg-white border border-gray-200 rounded-lg"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      sub: `${stats.paidOrders} paid orders`,
      icon: DollarSign,
      color: "text-[#65a30d]",
      bg: "bg-[#84cc16]/10",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      sub: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Avg. Order Value",
      value: `$${stats.aov}`,
      sub: "per paid order",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toString(),
      sub: "unique shoppers",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Good morning, Admin</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchDashboard(); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {stats.lowStockVariants.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">Low Stock Warning</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {stats.lowStockVariants.map((v) => `${v.sizeLabel} (${v.stock} left)`).join(" · ")}
            </p>
          </div>
          <Link href="/admin/products" className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0">
            Manage →
          </Link>
        </div>
      )}

      {/* Bulk Leads Priority Banner */}
      {stats.activeBulkLeads > 0 && (
        <Link
          href="/admin/bulk-orders"
          className="flex items-center gap-3 bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-3 hover:bg-amber-100 transition group"
        >
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-900 uppercase tracking-wide">
              {stats.activeBulkLeads} Bulk {stats.activeBulkLeads === 1 ? "Inquiry" : "Inquiries"} Need Attention
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Priority leads waiting — click to manage
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-700 group-hover:underline flex-shrink-0">
            View Now →
          </span>
        </Link>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bg)}>
                <Icon className={cn("w-[18px] h-[18px]", color)} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                <ArrowUpRight className="w-3 h-3" />
                Live
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Revenue Over Time</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live from order data · last 30 days</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="w-3 h-1 bg-[#84cc16] rounded-full inline-block" />Revenue
          </span>
        </div>
        {stats.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#84cc16" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-60 text-gray-300 text-sm">
            No revenue data yet. Orders will appear here once paid.
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs font-semibold text-[#65a30d] hover:underline">
            View all
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Order ID</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 hidden sm:table-cell">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800 hidden sm:table-cell">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-800">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", orderStatusColors[order.orderStatus] ?? "bg-gray-100 text-gray-600")}>
                        {orderStatusLabel[order.orderStatus] ?? order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
