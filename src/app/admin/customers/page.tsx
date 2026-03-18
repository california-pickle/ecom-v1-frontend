"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronRight, X, User, Mail, MapPin, ShoppingBag, Calendar, RefreshCw } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BackendOrder {
  _id: string;
  email: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: { name: string; sizeLabel: string; quantity: number; priceAtPurchase: number }[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: string;
  createdAt: string;
}

interface DerivedCustomer {
  email: string;
  name: string;
  city: string;
  state: string;
  totalOrders: number;
  paidOrders: number;
  totalSpent: number;
  joinDate: string;
  orders: BackendOrder[];
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

function deriveCustomers(orders: BackendOrder[]): DerivedCustomer[] {
  const map = new Map<string, DerivedCustomer>();

  for (const order of orders) {
    const email = order.email.toLowerCase();
    if (!map.has(email)) {
      map.set(email, {
        email,
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        totalOrders: 0,
        paidOrders: 0,
        totalSpent: 0,
        joinDate: order.createdAt,
        orders: [],
      });
    }
    const c = map.get(email)!;
    c.totalOrders += 1;
    if (order.paymentStatus === "paid") {
      c.paidOrders += 1;
      c.totalSpent = parseFloat((c.totalSpent + order.totalAmount).toFixed(2));
    }
    // Update to most recent name/address
    const orderDate = new Date(order.createdAt);
    if (orderDate > new Date(c.joinDate)) {
      // Keep the latest name/address
      c.name = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
      c.city = order.shippingAddress.city;
      c.state = order.shippingAddress.state;
    } else {
      // joinDate is the earliest
      c.joinDate = order.createdAt;
    }
    c.orders.push(order);
  }

  // Sort each customer's orders by date desc
  for (const c of map.values()) {
    c.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<DerivedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DerivedCustomer | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", body: "" });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<{ id: string; name: string; type: string; subject: string; fields: Record<string, string>; body: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const openEmailModal = () => {
    setEmailForm({ subject: "", body: "" });
    setSelectedTemplateId("");
    setEmailModalOpen(true);
    // Fetch templates
    fetch("/api/emails/templates").then((r) => r.json()).then((t) => setEmailTemplates(t)).catch(() => {});
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId || !selected) { setEmailForm({ subject: "", body: "" }); return; }
    const tpl = emailTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    if (tpl.type === "order_confirmation") {
      setEmailForm({
        subject: tpl.subject,
        body: `Hi ${selected.name},\n\n${tpl.fields.greeting || ""}\n\nOrder details will be included automatically.\n\n${tpl.fields.closing || ""}`,
      });
    } else if (tpl.type === "shipping_update") {
      setEmailForm({
        subject: tpl.subject,
        body: `Hi ${selected.name},\n\n${tpl.fields.message || ""}\n\nTracking details will be included automatically.\n\n${tpl.fields.closing || ""}`,
      });
    } else {
      setEmailForm({ subject: tpl.subject || "", body: tpl.body || "" });
    }
  };

  const handleSendEmail = async () => {
    if (!selected || !emailForm.subject.trim() || !emailForm.body.trim()) return;
    setSendingEmail(true);
    try {
      await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selected.email,
          toName: selected.name,
          subject: emailForm.subject,
          body: emailForm.body,
        }),
      });
      toast.success(`Email sent to ${selected.name}`);
      setEmailModalOpen(false);
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchData = useCallback(async () => {
    setError(false);
    try {
      const res = await axiosInstance.get("/order/all?page=1&limit=500");
      const orders: BackendOrder[] = res.data.data ?? [];
      setCustomers(deriveCustomers(orders));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalLTV = customers.reduce((s, c) => s + c.totalSpent, 0);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} unique customers</p>
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
          placeholder="Search by name, email, or city..."
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-red-500 text-sm font-semibold">Failed to load customers.</p>
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 bg-white border border-gray-200 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
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
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Location</th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr
                    key={c.email}
                    onClick={() => setSelected(c)}
                    className="hover:bg-gray-50/60 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#84cc16]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#65a30d]">
                            {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
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
                    <td className="px-3 py-3.5 text-gray-400 text-xs hidden md:table-cell">
                      {c.city}, {c.state}
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
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            {search ? "No customers match your search." : "No customers yet. Orders will appear here."}
          </div>
        )}
      </div>

      {/* Customer Profile Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#84cc16]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#65a30d]">
                    {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-xs text-gray-400">{selected.email}</p>
                  <button
                    onClick={openEmailModal}
                    className="mt-1.5 inline-flex items-center gap-1.5 bg-[#84cc16] text-black hover:bg-[#65a30d] px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" /> Send Email
                  </button>
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
                    ${selected.paidOrders > 0 ? (selected.totalSpent / selected.paidOrders).toFixed(0) : "0"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Avg. Order</p>
                </div>
              </div>

              {/* Contact Info */}
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
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 text-xs">{selected.city}, {selected.state}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 text-xs">
                      First order: {new Date(selected.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </section>

              {/* Order History */}
              <section>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <ShoppingBag className="w-3 h-3" /> Order History
                </h4>
                <div className="space-y-2">
                  {selected.orders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-xs font-mono text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                          {order.items.map((i) => i.sizeLabel).join(", ")}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">${order.totalAmount.toFixed(2)}</p>
                        <span className={cn(
                          "inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                          orderStatusColors[order.orderStatus] ?? "bg-gray-100 text-gray-600"
                        )}>
                          {orderStatusLabel[order.orderStatus] ?? order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {emailModalOpen && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setEmailModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Send Email</h3>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">To</label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#84cc16]/10 text-[#65a30d] px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Mail className="w-3 h-3" /> {selected.email}
                </span>
                <span className="text-xs text-gray-400">{selected.name}</span>
              </div>
            </div>

            {/* Template Picker */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent"
              >
                <option value="">Custom (blank)</option>
                {emailTemplates.filter((t) => t.type !== "custom").map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Subject</label>
              <input
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Email subject..."
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent"
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Body</label>
              <textarea
                rows={6}
                value={emailForm.body}
                onChange={(e) => setEmailForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write your message..."
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailForm.subject.trim() || !emailForm.body.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#84cc16] text-white text-sm font-semibold rounded-lg hover:bg-[#65a30d] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-3.5 h-3.5" />
                {sendingEmail ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
