"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, Mail, Phone, Building2, Package, MessageSquare, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  quantity: string;
  message: string;
  status: "New" | "Contacted" | "Closed";
  date: string;
}

const statusConfig = {
  New: { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  Contacted: { color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  Closed: { color: "bg-green-100 text-green-700", dot: "bg-green-500" },
};

export default function BulkOrdersPage() {
  const [leads, setLeads] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | BulkOrder["status"]>("All");
  const [selected, setSelected] = useState<BulkOrder | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/bulk-orders", { cache: "no-store" });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id: string, status: BulkOrder["status"]) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bulk-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      if (selected?.id === id) setSelected(updated);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = leads.filter((l) => {
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    All: leads.length,
    New: leads.filter((l) => l.status === "New").length,
    Contacted: leads.filter((l) => l.status === "Contacted").length,
    Closed: leads.filter((l) => l.status === "Closed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading leads...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bulk Orders / Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.New} new {counts.New === 1 ? "inquiry" : "inquiries"} waiting
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchLeads(); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stat chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["All", "New", "Contacted", "Closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition",
              filterStatus === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            )}
          >
            {s !== "All" && (
              <span className={cn("w-2 h-2 rounded-full", statusConfig[s]?.dot)} />
            )}
            {s}
            <span className={cn(
              "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black",
              filterStatus === s ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, company..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#84cc16] bg-white"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 hidden md:table-cell">Company</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">Quantity</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition cursor-pointer"
                    onClick={() => setSelected(lead)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                      <p className="text-xs text-gray-400 sm:hidden">{lead.email}</p>
                    </td>
                    <td className="px-3 py-3.5 text-gray-600 text-sm hidden sm:table-cell">{lead.email}</td>
                    <td className="px-3 py-3.5 text-gray-500 text-sm hidden md:table-cell">
                      {lead.company || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <Package className="w-3 h-3 text-gray-400" />
                        {lead.quantity}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusConfig[lead.status].color)}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-gray-400 hidden sm:table-cell">{lead.date}</td>
                    <td className="px-3 py-3.5">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <p className="text-xs font-mono text-gray-400 mb-1">{selected.id}</p>
                <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                {selected.company && (
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {selected.company}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact info */}
            <div className="p-6 space-y-4 border-b border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Email</p>
                    <p className="text-sm font-semibold text-gray-800 break-all">{selected.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Phone</p>
                    <p className="text-sm font-semibold text-gray-800">{selected.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Quantity Required</p>
                    <p className="text-sm font-semibold text-gray-800">{selected.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">📅</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Submitted</p>
                    <p className="text-sm font-semibold text-gray-800">{selected.date}</p>
                  </div>
                </div>
              </div>

              {selected.message && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500">Message</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
                </div>
              )}
            </div>

            {/* Status updater */}
            <div className="p-6">
              <p className="text-xs font-semibold text-gray-500 mb-3">Update Status</p>
              <div className="flex items-center gap-2 flex-wrap">
                {(["New", "Contacted", "Closed"] as const).map((s) => (
                  <button
                    key={s}
                    disabled={updating || selected.status === s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition",
                      selected.status === s
                        ? cn(statusConfig[s].color, "border-transparent cursor-default")
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 disabled:opacity-50"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", statusConfig[s].dot)} />
                    {s}
                    {selected.status === s && " ✓"}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: Bulk Order Inquiry from ${selected.company || selected.name}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-black text-sm font-bold rounded-xl transition"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
