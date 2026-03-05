"use client";

import { useState, useEffect, useCallback } from "react";
import { Order } from "@/lib/db";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Users, DollarSign,
  ArrowUpRight, RefreshCw, AlertTriangle, Package, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TopProduct {
  id: string;
  variant: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  sold: number;
  revenue: number;
  profit: number;
}

interface LowStockProduct {
  id: string;
  variant: string;
  stock: number;
  lowStockThreshold: number;
}

interface DashboardData {
  totalRevenue: number;
  totalProfit: number;
  marginPct: string;
  totalOrders: number;
  pendingOrders: number;
  conversionRate: string;
  aov: string;
  chartData: { date: string; revenue: number; profit: number }[];
  recentOrders: Order[];
  totalCustomers: number;
  lowStockProducts: LowStockProduct[];
  topProducts: TopProduct[];
  newBulkLeads: number;
  unreadNotifications: number;
}

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json);
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

  if (error || !data) {
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
      value: `$${data.totalRevenue.toFixed(2)}`,
      sub: `${data.totalOrders} orders`,
      icon: DollarSign,
      color: "text-[#65a30d]",
      bg: "bg-[#84cc16]/10",
    },
    {
      label: "Total Profit",
      value: `$${data.totalProfit.toFixed(2)}`,
      sub: `${data.marginPct}% margin`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Avg. Order Value",
      value: `$${data.aov}`,
      sub: `${data.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Customers",
      value: data.totalCustomers.toString(),
      sub: `${data.newBulkLeads} bulk leads`,
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
      {data.lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">Low Stock Warning</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {data.lowStockProducts.map((p) => `${p.variant} (${p.stock} left)`).join(" · ")}
            </p>
          </div>
          <Link href="/admin/products" className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0">
            Manage →
          </Link>
        </div>
      )}

      {/* New bulk leads banner */}
      {data.newBulkLeads > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <ClipboardList className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-purple-800 flex-1">
            {data.newBulkLeads} new bulk {data.newBulkLeads === 1 ? "inquiry" : "inquiries"} waiting for response
          </p>
          <Link href="/admin/bulk-orders" className="text-xs font-semibold text-purple-700 hover:underline flex-shrink-0">
            View →
          </Link>
        </div>
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

      {/* Revenue + Profit Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Revenue & Profit Over Time</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live from order data</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#84cc16] rounded-full inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" />Profit</span>
          </div>
        </div>
        {data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#84cc16" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-60 text-gray-300 text-sm">No revenue data yet.</div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#65a30d] hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 hidden sm:table-cell">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 hidden sm:table-cell">Profit</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.id}</td>
                    <td className="px-3 py-3 font-medium text-gray-800 hidden sm:table-cell">{order.customer}</td>
                    <td className="px-3 py-3 font-semibold text-gray-800">${order.amount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-emerald-600 hidden sm:table-cell">
                      +${order.profit.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusColors[order.status])}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Top Products</h3>
            <Link href="/admin/products" className="text-xs font-semibold text-[#65a30d] hover:underline">Manage</Link>
          </div>
          <div className="p-4 space-y-3">
            {data.topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-xs font-black text-gray-300 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{product.variant}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{product.sold} sold</span>
                    {product.stock <= 20 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                        <AlertTriangle className="w-2.5 h-2.5" /> {product.stock} left
                      </span>
                    )}
                    {product.stock > 20 && (
                      <span className="text-[10px] text-gray-400">{product.stock} in stock</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${product.revenue.toFixed(0)}</p>
                  <p className="text-xs text-emerald-600 font-semibold">+${product.profit.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
