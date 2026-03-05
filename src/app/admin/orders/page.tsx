"use client";

import { useState, useEffect, useCallback } from "react";
import { Order } from "@/lib/db";
import {
  Search, X, ChevronRight, MapPin, CreditCard, Truck,
  Package, FileText, CheckCircle, XCircle, RefreshCw, Send
} from "lucide-react";

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

const paymentColors: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Refunded: "bg-gray-100 text-gray-600",
  Pending: "bg-yellow-100 text-yellow-700",
};

const STATUS_FILTERS = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.product.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const patchOrder = async (id: string, patch: Partial<Order>) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const updated: Order = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setSelectedOrder((prev) => (prev?.id === id ? updated : prev));
  };

  const saveNote = async (id: string) => {
    setSavingNote(true);
    await patchOrder(id, { notes: notes[id] ?? "" });
    setSavingNote(false);
  };

  const issueRefund = async (id: string) => {
    await patchOrder(id, { status: "Cancelled", paymentStatus: "Refunded" });
  };

  const openDrawer = (order: Order) => {
    setSelectedOrder(order);
    if (notes[order.id] === undefined) {
      setNotes((n) => ({ ...n, [order.id]: order.notes }));
    }
  };

  const liveOrder = selectedOrder
    ? orders.find((o) => o.id === selectedOrder.id) ?? selectedOrder
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all customer orders</p>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          {orders.length} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s
                  ? "bg-[#84cc16] text-black shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading orders...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Order ID</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Product</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">Date</th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openDrawer(order)}
                    className="hover:bg-gray-50/60 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 font-medium">{order.id}</td>
                    <td className="px-3 py-3.5 font-semibold text-gray-800">{order.customer}</td>
                    <td className="px-3 py-3.5 text-gray-500 hidden md:table-cell max-w-[160px] truncate">{order.product}</td>
                    <td className="px-3 py-3.5 font-bold text-gray-800">${order.amount.toFixed(2)}</td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-gray-400 text-xs hidden lg:table-cell">{order.date}</td>
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
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No orders found.
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {liveOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <p className="text-[11px] text-gray-400 font-mono font-medium">{liveOrder.id}</p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{liveOrder.customer}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[liveOrder.status]}`}>
                  {liveOrder.status}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${paymentColors[liveOrder.paymentStatus]}`}>
                  {liveOrder.paymentStatus}
                </span>
              </div>

              {/* Customer Info */}
              <section className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3 h-3" /> Customer Info
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-800">{liveOrder.customer}</p>
                  <p className="text-gray-500">{liveOrder.email}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{liveOrder.address}</p>
                </div>
              </section>

              {/* Order Info */}
              <section className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Package className="w-3 h-3" /> Order Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{liveOrder.product}</span>
                    <span className="text-sm font-medium text-gray-500">×{liveOrder.quantity}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                    <span className="text-base font-black text-gray-900">${liveOrder.amount.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              {/* Shipping & Payment */}
              <section className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Truck className="w-3 h-3" /> Shipping
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[liveOrder.status]}`}>
                    {liveOrder.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <CreditCard className="w-3 h-3" /> Payment
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentColors[liveOrder.paymentStatus]}`}>
                    {liveOrder.paymentStatus}
                  </span>
                </div>
              </section>

              {/* Internal Notes */}
              <section>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <FileText className="w-3 h-3" /> Internal Notes
                </h4>
                <textarea
                  value={notes[liveOrder.id] ?? liveOrder.notes}
                  onChange={(e) => setNotes((n) => ({ ...n, [liveOrder.id]: e.target.value }))}
                  rows={3}
                  placeholder="Add a private note..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-none text-gray-700 placeholder:text-gray-300"
                />
                <button
                  onClick={() => saveNote(liveOrder.id)}
                  disabled={savingNote}
                  className="mt-1.5 text-xs font-semibold text-[#65a30d] hover:underline disabled:opacity-50"
                >
                  {savingNote ? "Saving..." : "Save note"}
                </button>
              </section>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => patchOrder(liveOrder.id, { status: "Shipped" })}
                  disabled={liveOrder.status === "Shipped" || liveOrder.status === "Delivered" || liveOrder.status === "Cancelled"}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" /> Mark Shipped
                </button>
                <button
                  onClick={() => patchOrder(liveOrder.id, { status: "Delivered" })}
                  disabled={liveOrder.status === "Delivered" || liveOrder.status === "Cancelled"}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                </button>
                <button
                  onClick={() => patchOrder(liveOrder.id, { status: "Cancelled" })}
                  disabled={liveOrder.status === "Cancelled" || liveOrder.status === "Delivered"}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel Order
                </button>
                <button
                  onClick={() => issueRefund(liveOrder.id)}
                  disabled={liveOrder.paymentStatus === "Refunded" || liveOrder.paymentStatus === "Pending"}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Issue Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
