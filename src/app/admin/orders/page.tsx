"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

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

// ─── Component ───────────────────────────────────────────────
export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

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
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {liveOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <p className="text-[11px] text-gray-400 font-mono font-medium">
                  #{liveOrder._id.slice(-8).toUpperCase()}
                </p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  {fullName(liveOrder.shippingAddress)}
                </h3>
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
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[liveOrder.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
                  {liveOrder.orderStatus === "pending_payment" ? "Pending Payment" : liveOrder.orderStatus}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${paymentColors[liveOrder.paymentStatus]}`}>
                  {liveOrder.paymentStatus}
                </span>
              </div>

              {/* Customer Info */}
              <section className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3 h-3" /> Customer Info
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-800">{fullName(liveOrder.shippingAddress)}</p>
                  <p className="text-gray-500">{liveOrder.email}</p>
                  <p className="text-gray-500 text-xs">{liveOrder.shippingAddress.phone}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{fullAddress(liveOrder.shippingAddress)}</p>
                </div>
              </section>

              {/* Order Items */}
              <section className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Package className="w-3 h-3" /> Order Details
                </h4>
                <div className="space-y-2">
                  {liveOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-800 font-medium">{item.name}</span>
                        <span className="text-gray-400 text-xs ml-1">({item.sizeLabel})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs">×{item.quantity}</span>
                        <span className="text-gray-600 font-medium">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Shipping</span>
                    <span className="text-xs font-medium text-gray-600">${liveOrder.shippingCost?.toFixed(2) ?? "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                    <span className="text-base font-black text-gray-900">${liveOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              {/* Tracking info */}
              {liveOrder.trackingNumber && (
                <section className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Truck className="w-3 h-3" /> Tracking
                  </h4>
                  <p className="text-xs font-mono text-blue-700">{liveOrder.trackingNumber}</p>
                  {liveOrder.shippingCarrier && (
                    <p className="text-[10px] text-blue-500 mt-0.5">{liveOrder.shippingCarrier}</p>
                  )}
                  {liveOrder.trackingUrl && (
                    <a
                      href={liveOrder.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-600 hover:underline mt-1 block"
                    >
                      Track Package →
                    </a>
                  )}
                </section>
              )}

              {/* Shipping & Payment */}
              <section className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Truck className="w-3 h-3" /> Shipping
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[liveOrder.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
                    {liveOrder.orderStatus === "pending_payment" ? "Pending" : liveOrder.orderStatus}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <CreditCard className="w-3 h-3" /> Payment
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${paymentColors[liveOrder.paymentStatus]}`}>
                    {liveOrder.paymentStatus}
                  </span>
                </div>
              </section>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => patchStatus(liveOrder._id, "processing")}
                  disabled={liveOrder.orderStatus === "processing" || liveOrder.orderStatus === "delivered" || updateMutation.isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Processing
                </button>
                <button
                  onClick={() => patchStatus(liveOrder._id, "shipped")}
                  disabled={
                    liveOrder.orderStatus === "shipped" ||
                    liveOrder.orderStatus === "delivered" ||
                    liveOrder.orderStatus === "cancelled" ||
                    updateMutation.isPending
                  }
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" /> Mark Shipped
                </button>
                <button
                  onClick={() => patchStatus(liveOrder._id, "delivered")}
                  disabled={
                    liveOrder.orderStatus === "delivered" ||
                    liveOrder.orderStatus === "cancelled" ||
                    updateMutation.isPending
                  }
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                </button>
                <button
                  onClick={() => patchStatus(liveOrder._id, "cancelled")}
                  disabled={
                    liveOrder.orderStatus === "cancelled" ||
                    liveOrder.orderStatus === "delivered" ||
                    updateMutation.isPending
                  }
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel Order
                </button>
              </div>

              {/* Send Reminder — for unpaid orders */}
              {liveOrder.paymentStatus !== "paid" && liveOrder.orderStatus !== "cancelled" && (
                <button
                  onClick={() => reminderMutation.mutate(liveOrder._id)}
                  disabled={reminderMutation.isPending}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {reminderMutation.isPending ? "Sending..." : "Send Payment Reminder"}
                </button>
              )}

              {updateMutation.isPending && (
                <p className="text-center text-xs text-gray-400 animate-pulse mt-2">Updating...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
