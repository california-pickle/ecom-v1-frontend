"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Package, RefreshCw, Search, X, Phone, Mail, Building2,
  Clock, CheckCheck, XCircle, Star, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulkOrder {
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

const statusConfig = {
  New: { color: "bg-[#84cc16] text-black", label: "New — Action Required" },
  Contacted: { color: "bg-blue-100 text-blue-700", label: "Contacted" },
  Closed: { color: "bg-green-100 text-green-700", label: "Closed / Won" },
  Cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
};

export default function BulkOrdersPage() {
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BulkOrder | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchBulkOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/bulk-orders", { cache: "no-store" });
      if (res.ok) setBulkOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBulkOrders(); }, [fetchBulkOrders]);

  const updateStatus = async (id: string, status: BulkOrder["status"]) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bulk-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setBulkOrders((prev) => {
        const next = prev.map((b) => (b.id === id ? updated : b));
        // Re-sort: New first, Contacted second, Closed/Cancelled last
        const priority: Record<string, number> = { New: 0, Contacted: 1, Closed: 2, Cancelled: 3 };
        return [...next].sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9));
      });
      setSelected((prev) => (prev?.id === id ? updated : prev));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const activeOrders = bulkOrders.filter((b) => b.status === "New" || b.status === "Contacted");
  const closedOrders = bulkOrders.filter((b) => b.status === "Closed" || b.status === "Cancelled");

  const filtered = (list: BulkOrder[]) => {
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.company.toLowerCase().includes(q)
    );
  };

  const BulkCard = ({ b }: { b: BulkOrder }) => (
    <div
      onClick={() => setSelected(b)}
      className={cn(
        "flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50/60 transition cursor-pointer group",
        b.status === "New" && "bg-[#84cc16]/5 hover:bg-[#84cc16]/10"
      )}
    >
      {/* Priority badge */}
      {b.status === "New" && (
        <div className="w-2 h-2 rounded-full bg-[#84cc16] flex-shrink-0 ring-2 ring-[#84cc16]/30 animate-pulse" />
      )}
      {b.status !== "New" && <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{b.name}</span>
          {b.company && (
            <span className="text-xs text-gray-400">· {b.company}</span>
          )}
          {b.status === "New" && (
            <span className="text-[10px] font-black bg-[#84cc16] text-black px-2 py-0.5 rounded-full uppercase tracking-wide">
              PRIORITY
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{b.quantity}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusConfig[b.status].color)}>
          {b.status}
        </span>
        <span className="text-xs text-gray-400 hidden sm:block">{b.date}</span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Bulk Inquiries</h2>
            {activeOrders.length > 0 && (
              <span className="bg-[#84cc16] text-black text-xs font-black px-2 py-0.5 rounded-full">
                {activeOrders.length} active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Priority queue — new inquiries appear at the top</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchBulkOrders(); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading bulk inquiries...
        </div>
      ) : (
        <>
          {/* Active / Priority Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-[#84cc16]/5 flex items-center gap-2">
              <Star className="w-4 h-4 text-[#65a30d]" />
              <h3 className="text-sm font-bold text-gray-800">Active Inquiries — Priority</h3>
              <span className="ml-auto text-xs text-gray-400">{filtered(activeOrders).length} item{filtered(activeOrders).length !== 1 ? "s" : ""}</span>
            </div>
            {filtered(activeOrders).length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                {search ? "No active inquiries match your search." : "No active bulk inquiries. New ones will appear here."}
              </div>
            ) : (
              <div>
                {filtered(activeOrders).map((b) => <BulkCard key={b.id} b={b} />)}
              </div>
            )}
          </div>

          {/* Closed / Done Section */}
          {filtered(closedOrders).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-500">Closed / Cancelled</h3>
                <span className="ml-auto text-xs text-gray-400">{filtered(closedOrders).length}</span>
              </div>
              <div>
                {filtered(closedOrders).map((b) => <BulkCard key={b.id} b={b} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className={cn(
              "flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 z-10",
              selected.status === "New" ? "bg-[#84cc16]/10" : "bg-white"
            )}>
              <div>
                {selected.status === "New" && (
                  <span className="text-[10px] font-black text-[#65a30d] uppercase tracking-widest">
                    ● Priority Inquiry
                  </span>
                )}
                <h3 className="text-base font-bold text-gray-900">{selected.name}</h3>
                <p className="text-xs text-gray-400">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Status */}
              <div>
                <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full", statusConfig[selected.status].color)}>
                  {statusConfig[selected.status].label}
                </span>
                <span className="text-xs text-gray-400 ml-3">{selected.date} at {selected.time}</span>
              </div>

              {/* Contact Info */}
              <section className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact</h4>
                <div className="space-y-2">
                  {selected.company && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 font-semibold">{selected.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline text-sm">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${selected.phone}`} className="text-gray-700 hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                </div>
              </section>

              {/* Order Details */}
              <section className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3 h-3" /> Inquiry Details
                </h4>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity</p>
                  <p className="text-sm font-bold text-gray-800">{selected.quantity}</p>
                </div>
                {selected.message && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Message</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{selected.message}</p>
                  </div>
                )}
              </section>

              {/* Quick reply links */}
              <section className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</h4>
                <a
                  href={`mailto:${selected.email}?subject=Re: Bulk Order Inquiry - California Pickle&body=Hi ${selected.name},%0A%0AThank you for your interest in bulk ordering California Pickle!%0A%0A`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
                >
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition"
                >
                  <Phone className="w-4 h-4" /> Call Customer
                </a>
              </section>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateStatus(selected.id, "New")}
                  disabled={selected.status === "New" || updating}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#84cc16]/10 text-[#65a30d] hover:bg-[#84cc16]/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Star className="w-3.5 h-3.5" /> Mark New
                </button>
                <button
                  onClick={() => updateStatus(selected.id, "Contacted")}
                  disabled={selected.status === "Contacted" || updating}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Clock className="w-3.5 h-3.5" /> Contacted
                </button>
                <button
                  onClick={() => updateStatus(selected.id, "Closed")}
                  disabled={selected.status === "Closed" || updating}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Close / Won
                </button>
                <button
                  onClick={() => updateStatus(selected.id, "Cancelled")}
                  disabled={selected.status === "Cancelled" || updating}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
              {updating && (
                <p className="text-center text-xs text-gray-400 animate-pulse">Updating...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
