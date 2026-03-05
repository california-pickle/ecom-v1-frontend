"use client";

import { useState, useEffect, useCallback } from "react";
import { Customer } from "@/lib/db";
import { Order } from "@/lib/db";
import { Search, ChevronRight, X, User, Mail, MapPin, ShoppingBag, Calendar, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, oRes] = await Promise.all([
        fetch("/api/customers", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);
      setCustomers(await cRes.json());
      setOrders(await oRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalLTV = customers.reduce((s, c) => s + c.totalSpent, 0);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const getOrderHistory = (c: Customer) =>
    orders.filter((o) => c.orderHistory.includes(o.id));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} registered customers</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-900">${totalLTV.toFixed(0)}</p>
          <p className="text-xs text-gray-400">Total lifetime value</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading customers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Orders</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Total Spent</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Joined</th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="hover:bg-gray-50/60 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#84cc16]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#65a30d]">
                            {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-gray-500 hidden sm:table-cell">{c.email}</td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {c.totalOrders}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-bold text-gray-800">${c.totalSpent.toFixed(2)}</td>
                    <td className="px-3 py-3.5 text-gray-400 text-xs hidden md:table-cell">{c.joinDate}</td>
                    <td className="px-3 py-3.5">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No customers found.
          </div>
        )}
      </div>

      {/* Customer Profile Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#84cc16]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#65a30d]">
                    {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-xs text-gray-400">{selected.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#84cc16]/10 rounded-xl p-3.5 text-center">
                  <p className="text-xl font-black text-[#65a30d]">{selected.totalOrders}</p>
                  <p className="text-[11px] text-[#65a30d]/70 font-medium mt-0.5">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 text-center">
                  <p className="text-xl font-black text-gray-800">${selected.totalSpent.toFixed(0)}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Lifetime Value</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 text-center">
                  <p className="text-xl font-black text-gray-800">
                    ${selected.totalOrders > 0 ? (selected.totalSpent / selected.totalOrders).toFixed(0) : "0"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Avg. Order</p>
                </div>
              </div>

              {/* Basic Info */}
              <section className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-sm">
                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{selected.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">{selected.email}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500 text-xs leading-relaxed">{selected.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 text-xs">Member since {selected.joinDate}</span>
                  </div>
                </div>
              </section>

              {/* Order History */}
              <section>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <ShoppingBag className="w-3 h-3" /> Order History
                </h4>
                <div className="space-y-2">
                  {getOrderHistory(selected).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No orders found.</p>
                  ) : (
                    getOrderHistory(selected).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                      >
                        <div>
                          <p className="text-xs font-mono text-gray-400">{order.id}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">{order.product}</p>
                          <p className="text-xs text-gray-400">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">${order.amount.toFixed(2)}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
