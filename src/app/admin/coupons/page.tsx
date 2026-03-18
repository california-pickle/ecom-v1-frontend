"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { Tag, Plus, X, RefreshCw, CheckCircle, XCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Coupon {
  _id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  note: string;
  createdAt: string;
}

function getCouponStatus(coupon: Coupon): { label: string; color: string } {
  if (!coupon.active) return { label: "Deactivated", color: "bg-gray-100 text-gray-500" };
  if (new Date() > new Date(coupon.expiresAt)) return { label: "Expired", color: "bg-red-100 text-red-600" };
  if (coupon.usedCount >= coupon.maxUses) return { label: "Maxed Out", color: "bg-orange-100 text-orange-600" };
  return { label: "Active", color: "bg-[#84cc16]/20 text-[#65a30d]" };
}

const DAYS_OPTIONS = [3, 4, 5, 6, 7];

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    discountPercent: "",
    maxUses: "1",
    daysUntilExpiry: "7",
    note: "",
    code: "",
  });

  const { data: coupons = [], isLoading, isError, refetch } = useQuery<Coupon[]>({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const res = await axiosInstance.get("/coupons");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: object) => {
      const res = await axiosInstance.post("/coupons", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success(`Coupon ${data.code} created!`);
      setShowForm(false);
      setForm({ discountPercent: "", maxUses: "1", daysUntilExpiry: "7", note: "", code: "" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || "Failed to create coupon";
      toast.error(msg);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.put(`/coupons/${id}/deactivate`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deactivated");
    },
    onError: () => {
      toast.error("Failed to deactivate coupon");
    },
  });

  const handleCreate = () => {
    const discountPercent = parseInt(form.discountPercent, 10);
    const maxUses = parseInt(form.maxUses, 10);
    const days = parseInt(form.daysUntilExpiry, 10);

    if (!discountPercent || discountPercent < 1 || discountPercent > 50) {
      toast.error("Discount must be between 1% and 50%");
      return;
    }
    if (!maxUses || maxUses < 1 || maxUses > 100) {
      toast.error("Max uses must be between 1 and 100");
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    const expiresAtStr = expiresAt.toISOString().split("T")[0];

    const payload: Record<string, any> = { discountPercent, maxUses, expiresAt: expiresAtStr, note: form.note };
    if (form.code.trim()) payload.code = form.code.trim();

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Coupons</h2>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-black text-sm font-bold rounded-lg transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#84cc16]/10">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#65a30d]" />
              <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">New Coupon</p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount % */}
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1.5">
                Discount % * (1–50)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                placeholder="10"
                className="w-full px-3 py-2.5 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#84cc16]/20 transition-all"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1.5">
                Max Uses (1–100)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                className="w-full px-3 py-2.5 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#84cc16]/20 transition-all"
              />
            </div>

            {/* Expires In */}
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1.5">
                Expires In (days)
              </label>
              <div className="flex gap-1.5">
                {DAYS_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, daysUntilExpiry: String(d) }))}
                    className={cn(
                      "flex-1 py-2 border-2 border-black rounded-sm text-[11px] font-black transition-all",
                      form.daysUntilExpiry === String(d)
                        ? "bg-[#84cc16] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-[#84cc16]/20",
                    )}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Code */}
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1.5">
                Code (optional — auto-generated if blank)
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="PICKLE-SUMMER"
                className="w-full px-3 py-2.5 border-2 border-black rounded-sm text-sm font-bold uppercase focus:outline-none focus:bg-[#84cc16]/20 transition-all placeholder:opacity-30"
              />
            </div>

            {/* Note */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1.5">
                Note (optional)
              </label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Sent to VIP customer John"
                className="w-full px-3 py-2.5 border-2 border-black rounded-sm text-sm focus:outline-none focus:bg-[#84cc16]/20 transition-all"
              />
            </div>

            {/* Submit */}
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-black text-sm font-bold rounded-lg transition disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {createMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" strokeWidth={3} />
                )}
                {createMutation.isPending ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading coupons...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-red-500 text-sm font-semibold">Failed to load coupons.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 bg-white border border-gray-200 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Tag className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No coupons yet</p>
            <p className="text-xs text-gray-400">Create your first coupon above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Code</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Discount</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Uses</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Expires</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Note</th>
                  <th className="px-3 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const canDeactivate = coupon.active && new Date() <= new Date(coupon.expiresAt) && coupon.usedCount < coupon.maxUses;

                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#84cc16]/10 rounded-md flex items-center justify-center flex-shrink-0">
                            <Tag className="w-3.5 h-3.5 text-[#65a30d]" />
                          </div>
                          <span className="font-mono font-bold text-gray-900 text-xs tracking-wide">{coupon.code}</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Copied!"); }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="font-black text-gray-900">{coupon.discountPercent}%</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={cn(
                          "font-semibold text-sm",
                          coupon.usedCount >= coupon.maxUses ? "text-red-500" : "text-gray-700"
                        )}>
                          {coupon.usedCount}/{coupon.maxUses}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-gray-500 text-xs hidden md:table-cell">
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", status.color)}>
                          {status.label === "Active" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-gray-400 text-xs hidden sm:table-cell max-w-[140px] truncate">
                        {coupon.note || <span className="italic">—</span>}
                      </td>
                      <td className="px-3 py-3.5">
                        {canDeactivate && (
                          <button
                            onClick={() => deactivateMutation.mutate(coupon._id)}
                            disabled={deactivateMutation.isPending}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition disabled:opacity-50 uppercase tracking-wide border border-red-200"
                          >
                            {deactivateMutation.isPending ? "..." : "Deactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
