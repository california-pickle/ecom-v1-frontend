"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import {
  Search,
  X,
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Mail,
  Star,
  Phone,
  ExternalLink,
  User,
  Calendar,
  Hash,
  Clock,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────
type OrderStatus = "pending_payment" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";

interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  sizeLabel: string;
  quantity: number;
  priceAtPurchase: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  aptOrSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface Order {
  _id: string;
  email: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingCarrier?: string | null;
  createdAt: string;
}

interface OrdersResponse {
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Status config ───────────────────────────────────────────
const statusColors: Record<string, string> = {
  delivered: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  pending_payment: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const statusDot: Record<string, string> = {
  delivered: "bg-green-500",
  shipped: "bg-blue-500",
  processing: "bg-yellow-500",
  pending_payment: "bg-gray-400",
  cancelled: "bg-red-500",
};

const paymentColors: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_FILTERS = ["All", "processing", "shipped", "delivered", "cancelled", "pending_payment"];

// ─── API calls ───────────────────────────────────────────────
const fetchOrders = async (page = 1): Promise<OrdersResponse> => {
  const res = await axiosInstance.get(`/order/all?page=${page}&limit=50`);
  return res.data;
};

const updateStatus = async ({ id, orderStatus }: { id: string; orderStatus: string }) => {
  const res = await axiosInstance.put(`/order/${id}/status`, { orderStatus });
  return res.data.order as Order;
};

const sendReminder = async (id: string) => {
  const res = await axiosInstance.post(`/order/${id}/remind`);
  return res.data;
};

// ─── Helpers ─────────────────────────────────────────────────
const fullName = (addr: ShippingAddress) => `${addr.firstName} ${addr.lastName}`;
const fullAddress = (addr: ShippingAddress) =>
  `${addr.street}${addr.aptOrSuite ? `, ${addr.aptOrSuite}` : ""}, ${addr.city}, ${addr.state} ${addr.zipCode}`;

// ─── Bulk Order type ─────────────────────────────────────────
interface BulkInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  quantity: string;
  message: string;
  status: "New" | "Contacted" | "Closed" | "Cancelled";
  date: string;
  time: string;
}

// ─── Component ───────────────────────────────────────────────
export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  // Bulk inquiries — pinned at top
  const [bulkOrders, setBulkOrders] = useState<BulkInquiry[]>([]);
  const [updatingBulk, setUpdatingBulk] = useState<string | null>(null);

  const fetchBulkOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/bulk-orders", { cache: "no-store" });
      if (res.ok) {
        const all: BulkInquiry[] = await res.json();
        setBulkOrders(all.filter((b) => b.status === "New" || b.status === "Contacted"));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchBulkOrders(); }, [fetchBulkOrders]);

  const updateBulkStatus = async (id: string, status: BulkInquiry["status"]) => {
    setUpdatingBulk(id);
    try {
      const res = await fetch(`/api/bulk-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      if (status === "Closed" || status === "Cancelled") {
        setBulkOrders((prev) => prev.filter((b) => b.id !== id));
      } else {
        const updated: BulkInquiry = await res.json();
        setBulkOrders((prev) => prev.map((b) => (b.id === id ? updated : b)));
      }
      toast.success(`Bulk inquiry marked as ${status}`);
    } catch {
      toast.error("Failed to update bulk inquiry.");
    } finally {
      setUpdatingBulk(null);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => fetchOrders(page),
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const updateMutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(["orders", page], (old: OrdersResponse | undefined) => {
        if (!old) return old;
        return { ...old, data: old.data.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)) };
      });
      setSelectedOrder((prev) => (prev?._id === updatedOrder._id ? updatedOrder : prev));
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order"),
  });

  const reminderMutation = useMutation({
    mutationFn: sendReminder,
    onSuccess: (data) => toast.success(data.message || "Reminder sent"),
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to send reminder"),
  });

  // ─── Filter ───────────────────────────────────────────────
  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "All" || o.orderStatus === statusFilter;
    const q = search.toLowerCase();
    const name = fullName(o.shippingAddress).toLowerCase();
    const matchSearch =
      !q ||
      o._id.toLowerCase().includes(q) ||
      name.includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.items.some((item) => item.name.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const patchStatus = (id: string, orderStatus: string) => updateMutation.mutate({ id, orderStatus });

  const liveOrder = selectedOrder
    ? (orders.find((o) => o._id === selectedOrder._id) ?? selectedOrder)
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
          {pagination?.total ?? 0} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, order ID, email..."
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
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                statusFilter === s
                  ? "bg-[#84cc16] text-black shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s === "pending_payment" ? "Pending Payment" : s}
            </button>
          ))}
        </div>
      </div>

      {/* ─── BULK INQUIRY PRIORITY SECTION ─── */}
      {bulkOrders.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 bg-amber-400/30 border-b border-amber-300">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-700" />
              <span className="text-sm font-black text-amber-900 uppercase tracking-wide">
                Bulk Order Inquiries — Priority
              </span>
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {bulkOrders.length} pending
              </span>
            </div>
            <Link
              href="/admin/bulk-orders"
              className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1"
            >
              Manage all <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-amber-200">
            {bulkOrders.map((bulk) => (
              <div
                key={bulk.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4",
                  bulk.status === "New" ? "bg-amber-50" : "bg-amber-50/40"
                )}
              >
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5",
                  bulk.status === "New" ? "bg-amber-500 ring-2 ring-amber-300 animate-pulse" : "bg-blue-400"
                )} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{bulk.name}</span>
                    {bulk.company && <span className="text-xs text-gray-500">· {bulk.company}</span>}
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                      bulk.status === "New" ? "bg-amber-400 text-white" : "bg-blue-100 text-blue-700"
                    )}>
                      {bulk.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    <span className="font-semibold">Qty:</span> {bulk.quantity}
                  </p>
                  {bulk.message && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{bulk.message}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                    <a href={`mailto:${bulk.email}`} className="flex items-center gap-1 hover:text-blue-600 transition">
                      <Mail className="w-3 h-3" /> {bulk.email}
                    </a>
                    <a href={`tel:${bulk.phone}`} className="flex items-center gap-1 hover:text-green-600 transition">
                      <Phone className="w-3 h-3" /> {bulk.phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {bulk.status === "New" && (
                    <button
                      onClick={() => updateBulkStatus(bulk.id, "Contacted")}
                      disabled={updatingBulk === bulk.id}
                      className="px-3 py-1.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-40"
                    >
                      Contacted
                    </button>
                  )}
                  <button
                    onClick={() => updateBulkStatus(bulk.id, "Closed")}
                    disabled={updatingBulk === bulk.id}
                    className="px-3 py-1.5 text-[11px] font-bold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-40"
                  >
                    Close / Won
                  </button>
                  <button
                    onClick={() => updateBulkStatus(bulk.id, "Cancelled")}
                    disabled={updatingBulk === bulk.id}
                    className="px-3 py-1.5 text-[11px] font-bold bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading orders...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Order ID", "Customer", "Product", "Amount", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-gray-50/60 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 font-medium">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-gray-800">{fullName(order.shippingAddress)}</div>
                      <div className="text-xs text-gray-400">{order.email}</div>
                    </td>
                    <td className="px-3 py-3.5 text-gray-500 hidden md:table-cell max-w-[160px] truncate">
                      {order.items.map((i) => `${i.name} (${i.sizeLabel})`).join(", ")}
                    </td>
                    <td className="px-3 py-3.5 font-bold text-gray-800">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[order.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.orderStatus === "pending_payment" ? "Pending Payment" : order.orderStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3.5">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No orders found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 text-xs">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ─── ORDER DETAIL MODAL (centered) ─── */}
      {liveOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] z-10 flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-sm font-bold text-gray-700">{liveOrder._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[liveOrder.orderStatus]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[liveOrder.orderStatus]}`} />
                    {liveOrder.orderStatus === "pending_payment" ? "Pending Payment" : liveOrder.orderStatus}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${paymentColors[liveOrder.paymentStatus]}`}>
                    {liveOrder.paymentStatus}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Left Column */}
                <div className="space-y-4">
                  {/* Customer Info */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <User className="w-3 h-3" /> Customer
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-gray-900 text-base">{fullName(liveOrder.shippingAddress)}</p>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{liveOrder.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{liveOrder.shippingAddress.phone}</span>
                      </div>
                    </div>
                  </section>

                  {/* Shipping Address */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3 h-3" /> Shipping Address
                    </h4>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>{liveOrder.shippingAddress.street}</p>
                      {liveOrder.shippingAddress.aptOrSuite && <p>{liveOrder.shippingAddress.aptOrSuite}</p>}
                      <p>{liveOrder.shippingAddress.city}, {liveOrder.shippingAddress.state} {liveOrder.shippingAddress.zipCode}</p>
                    </div>
                  </section>

                  {/* Tracking info */}
                  {liveOrder.trackingNumber && (
                    <section className="bg-blue-50 rounded-xl p-4">
                      <h4 className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Truck className="w-3 h-3" /> Tracking
                      </h4>
                      <p className="text-sm font-mono font-bold text-blue-700">{liveOrder.trackingNumber}</p>
                      {liveOrder.shippingCarrier && (
                        <p className="text-xs text-blue-500 mt-1">{liveOrder.shippingCarrier}</p>
                      )}
                      {liveOrder.trackingUrl && (
                        <a
                          href={liveOrder.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mt-2"
                        >
                          <ExternalLink className="w-3 h-3" /> Track Package
                        </a>
                      )}
                    </section>
                  )}

                  {/* Order Date */}
                  <section className="flex items-center gap-3 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ordered {new Date(liveOrder.createdAt).toLocaleString()}</span>
                  </section>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Order Items */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Package className="w-3 h-3" /> Items
                    </h4>
                    <div className="space-y-3">
                      {liveOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start text-sm bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                          <div>
                            <span className="font-semibold text-gray-800 block">{item.name}</span>
                            <span className="text-gray-400 text-xs">{item.sizeLabel} &times; {item.quantity}</span>
                          </div>
                          <span className="font-bold text-gray-700">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Order Summary */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <CreditCard className="w-3 h-3" /> Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>${liveOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Shipping</span>
                        <span>${liveOrder.shippingCost?.toFixed(2) ?? "---"}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-lg font-black text-gray-900">
                          ${(liveOrder.totalAmount + (liveOrder.shippingCost ?? 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Status Tiles */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3.5 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        <Truck className="w-3 h-3 inline mr-1" />Shipping
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[liveOrder.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {liveOrder.orderStatus === "pending_payment" ? "Pending" : liveOrder.orderStatus}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3.5 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        <CreditCard className="w-3 h-3 inline mr-1" />Payment
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${paymentColors[liveOrder.paymentStatus]}`}>
                        {liveOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer — Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              {liveOrder.paymentStatus === "paid" ? (
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3" /> Actions
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => patchStatus(liveOrder._id, "shipped")}
                      disabled={liveOrder.orderStatus !== "processing" || updateMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <Truck className="w-4 h-4" /> Mark Shipped
                    </button>
                    <button
                      onClick={() => patchStatus(liveOrder._id, "delivered")}
                      disabled={liveOrder.orderStatus !== "shipped" || updateMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Delivered
                    </button>
                    <button
                      onClick={() => patchStatus(liveOrder._id, "cancelled")}
                      disabled={liveOrder.orderStatus !== "processing" || updateMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Order
                    </button>
                    {updateMutation.isPending && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 animate-pulse ml-1">
                        <Clock className="w-3.5 h-3.5" /> Updating...
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-400 font-semibold">
                    {liveOrder.paymentStatus === "pending" ? "Awaiting payment --- status updates locked" : "Payment failed --- status updates locked"}
                  </p>
                  {liveOrder.orderStatus !== "cancelled" && (
                    <button
                      onClick={() => reminderMutation.mutate(liveOrder._id)}
                      disabled={reminderMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg transition-all disabled:opacity-30"
                    >
                      <Bell className="w-4 h-4" />
                      {reminderMutation.isPending ? "Sending..." : "Send Reminder"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
