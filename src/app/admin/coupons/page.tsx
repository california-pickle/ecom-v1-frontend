"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Tag, Plus, Copy, Check, RefreshCw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
  note: string;
}

// ─── Status helper ────────────────────────────────────────────────────────────

function getCouponStatus(coupon: Coupon): { label: string; className: string } {
  const now = new Date();
  const expiry = new Date(coupon.expiresAt);
  // Set expiry to end of day
  expiry.setHours(23, 59, 59, 999);

  if (coupon.usedCount >= coupon.maxUses) {
    return { label: "Used Up", className: "bg-red-100 text-red-700" };
  }
  if (expiry < now) {
    return { label: "Expired", className: "bg-gray-100 text-gray-500" };
  }
  return { label: "Active", className: "bg-green-100 text-green-700" };
}

// ─── Format date ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [discountPercent, setDiscountPercent] = useState(10);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState(1);
  const [note, setNote] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [creating, setCreating] = useState(false);

  // Copy state: tracks which code was just copied
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ─── Fetch coupons ───────────────────────────────────────────────────────────

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCoupons(data);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ─── Create coupon ───────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (discountPercent < 1 || discountPercent > 50) {
      toast.error("Discount must be between 1% and 50%");
      return;
    }
    if (maxUses < 1) {
      toast.error("Max uses must be at least 1");
      return;
    }

    setCreating(true);
    try {
      const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const body: Record<string, unknown> = {
        discountPercent,
        maxUses,
        expiresAt,
        note,
      };
      if (customCode.trim()) {
        body.code = customCode.trim().toUpperCase();
      }

      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create coupon");
      }

      const created: Coupon = await res.json();
      setCoupons((prev) => [created, ...prev]);
      toast.success(`Coupon ${created.code} created`);

      // Reset form
      setDiscountPercent(10);
      setExpiresInDays(7);
      setMaxUses(1);
      setNote("");
      setCustomCode("");
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  // ─── Copy to clipboard ───────────────────────────────────────────────────────

  const handleCopy = async (coupon: Coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Coupons</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage discount codes for customers
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Create Coupon Panel */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-[#84cc16]/10 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-[#65a30d]" />
            </div>
            <p className="text-sm font-bold text-gray-900">Create Coupon</p>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Discount % */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Discount %
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={discountPercent}
                  onChange={(e) =>
                    setDiscountPercent(Math.max(1, Math.min(50, Number(e.target.value))))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                />
              </div>

              {/* Expires In */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Expires In
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                >
                  {[3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      {d} day{d > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Max Uses */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Max Uses
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(Math.max(1, Number(e.target.value)))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                />
              </div>

              {/* Custom Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Custom Code{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] font-mono"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='Created for [customer name]'
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black transition disabled:opacity-50"
              >
                {creating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {creating ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* List header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#65a30d]" />
            <p className="text-sm font-bold text-gray-900">
              All Coupons
              {coupons.length > 0 && (
                <span className="ml-2 text-xs font-semibold text-gray-400">
                  ({coupons.length})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center">
            <RefreshCw className="w-5 h-5 text-gray-300 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-gray-400">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No coupons yet</p>
            <p className="text-xs text-gray-400 mt-1">Create one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Uses
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const isCopied = copiedId === coupon.id;

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition">
                      {/* Code */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#65a30d] bg-[#84cc16]/10 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon)}
                            className="p-1 rounded text-gray-400 hover:text-[#65a30d] hover:bg-[#84cc16]/10 transition"
                            title="Copy code"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#84cc16]/15 text-[#65a30d]">
                          {coupon.discountPercent}% off
                        </span>
                      </td>

                      {/* Uses */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          {coupon.usedCount}/{coupon.maxUses}
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-600">{formatDate(coupon.expiresAt)}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="px-4 py-3.5 max-w-[180px]">
                        <span
                          className="text-xs text-gray-500 truncate block"
                          title={coupon.note}
                        >
                          {coupon.note || <span className="text-gray-300">—</span>}
                        </span>
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
