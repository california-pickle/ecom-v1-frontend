"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Eye,
  Pencil,
  Check,
  X,
  RefreshCw,
  Clock,
  ChevronDown,
  Tag,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmailTemplate {
  id: string;
  name: string;
  type: "order_confirmation" | "shipping_update" | "custom";
  subject: string;
  fields: Record<string, string>;
  body: string;
  locked: boolean;
}

interface SentEmail {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  sentAt: string;
}

type Tab = "templates" | "compose" | "sent";

// ─── Component ──────────────────────────────────────────────────────────────

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeName, setComposeName] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);

  // Coupon state (compose tab)
  const [couponOpen, setCouponOpen] = useState(false);
  const [attachedCoupon, setAttachedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<{ _id: string; code: string; discountPercent: number; maxUses: number; usedCount: number; expiresAt: string; active: boolean }[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Sent state
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loadingSent, setLoadingSent] = useState(false);
  const [selectedSent, setSelectedSent] = useState<SentEmail | null>(null);

  // ─── Fetch templates ────────────────────────────────────────────────────────

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/emails/templates");
      const data = await res.json();
      // Only show locked (pre-designed) templates
      setTemplates(data.filter((t: EmailTemplate) => t.locked));
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // ─── Fetch sent emails ──────────────────────────────────────────────────────

  const fetchSent = useCallback(async () => {
    setLoadingSent(true);
    try {
      const res = await fetch("/api/emails/send");
      const data = await res.json();
      setSentEmails(data);
    } catch {
      toast.error("Failed to load sent emails");
    } finally {
      setLoadingSent(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "sent") fetchSent();
  }, [activeTab, fetchSent]);

  // ─── Template actions ───────────────────────────────────────────────────────

  const startEdit = (t: EmailTemplate) => {
    setEditingId(t.id);
    setEditSubject(t.subject);
    setEditFields({ ...t.fields });
    setPreviewId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveTemplate = async (t: EmailTemplate) => {
    setSavingId(t.id);
    try {
      const res = await fetch("/api/emails/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id, subject: editSubject, fields: editFields }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTemplates((prev) => prev.map((tp) => (tp.id === updated.id ? updated : tp)));
      setEditingId(null);
      toast.success("Template saved");
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSavingId(null);
    }
  };

  // ─── Fetch Available Coupons ──────────────────────────────────────────────────

  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        // Only show active, non-expired, non-maxed coupons
        const now = new Date();
        const active = data.filter((c: any) => c.active && new Date(c.expiresAt) > now && c.usedCount < c.maxUses);
        setAvailableCoupons(active);
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoadingCoupons(false);
    }
  };

  // ─── Compose / Send ────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!composeTo || !composeSubject) {
      toast.error("Email address and subject are required");
      return;
    }
    setSending(true);
    try {
      // Append coupon info to body if one was generated
      const finalBody = attachedCoupon
        ? `${composeBody}\n\n---\nHere is your exclusive discount coupon: ${attachedCoupon.code}\nSave ${attachedCoupon.discountPercent}% on your next order at checkout.`
        : composeBody;

      // The branded email boilerplate (logo, Hi name, footer) is built server-side.
      const sendRes = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          toName: composeName,
          subject: composeSubject,
          body: finalBody,
        }),
      });
      if (!sendRes.ok) throw new Error("Failed to send email");

      toast.success("Email sent successfully");

      // Reset form
      setComposeTo("");
      setComposeName("");
      setComposeSubject("");
      setComposeBody("");
      setAttachedCoupon(null);
      setCouponOpen(false);
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  // ─── Template Preview Rendering ─────────────────────────────────────────────

  const BrandedEmailShell = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#f3f4f6] rounded-xl p-4">
      <div className="mx-auto max-w-[480px] bg-white border-[3px] border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="bg-[#8CE000] border-b-[3px] border-black px-6 py-5 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dngag0zog/image/upload/pickle-logo_mp20aq.png"
            alt="The California Pickle"
            className="h-10 w-auto object-contain"
          />
        </div>
        {/* Body */}
        <div className="px-7 py-6 space-y-4">
          {children}
        </div>
        {/* Footer */}
        <div className="bg-black px-6 py-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-white" style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}>
            © {new Date().getFullYear()} The California Pickle.<br />All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );

  const renderOrderConfirmationPreview = (t: EmailTemplate) => {
    const greeting = editingId === t.id ? editFields.greeting : t.fields.greeting;
    const closing = editingId === t.id ? editFields.closing : t.fields.closing;
    return (
      <BrandedEmailShell>
        <p className="text-lg font-black text-gray-900" style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}>
          Hi Marcus,
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">{greeting || <span className="text-gray-300 italic">Greeting message...</span>}</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Order Details</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-semibold text-gray-800">ORD-1001</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Product</span>
            <span className="font-semibold text-gray-800">60ml Pack (x12)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-gray-800">$59.98</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{closing || <span className="text-gray-300 italic">Closing message...</span>}</p>
      </BrandedEmailShell>
    );
  };

  const renderShippingUpdatePreview = (t: EmailTemplate) => {
    const message = editingId === t.id ? editFields.message : t.fields.message;
    const closing = editingId === t.id ? editFields.closing : t.fields.closing;
    return (
      <BrandedEmailShell>
        <p className="text-lg font-black text-gray-900" style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}>
          Hi Marcus,
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">{message || <span className="text-gray-300 italic">Custom message...</span>}</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Details</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-semibold text-gray-800">ORD-1001</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tracking #</span>
            <span className="font-semibold text-gray-800">1Z999AA10123456784</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Est. Delivery</span>
            <span className="font-semibold text-gray-800">March 15, 2026</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{closing || <span className="text-gray-300 italic">Closing message...</span>}</p>
      </BrandedEmailShell>
    );
  };

  // ─── Tab UI ─────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string }[] = [
    { key: "templates", label: "Templates" },
    { key: "compose", label: "Compose" },
    { key: "sent", label: "Sent" },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Emails</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage templates and send emails to customers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ──────────────── Templates Tab ──────────────── */}
      {activeTab === "templates" && (
        <div className="space-y-3">
          {loadingTemplates ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400">No templates found</p>
            </div>
          ) : (
            templates.map((t) => {
              const isEditing = editingId === t.id;
              const isPreviewing = previewId === t.id;

              return (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Collapsed header */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#84cc16]/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-[#65a30d]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{t.subject}</p>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(t)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-[#65a30d] hover:bg-[#84cc16]/10 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Expanded edit form */}
                  {isEditing && (
                    <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                      {/* Subject */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject Line</label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                        />
                      </div>

                      {/* Template-specific fields */}
                      {t.type === "order_confirmation" && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Greeting Message</label>
                            <textarea
                              value={editFields.greeting || ""}
                              onChange={(e) => setEditFields((f) => ({ ...f, greeting: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-y"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Closing Message</label>
                            <textarea
                              value={editFields.closing || ""}
                              onChange={(e) => setEditFields((f) => ({ ...f, closing: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-y"
                            />
                          </div>
                        </>
                      )}

                      {t.type === "shipping_update" && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Custom Message</label>
                            <textarea
                              value={editFields.message || ""}
                              onChange={(e) => setEditFields((f) => ({ ...f, message: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-y"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Closing Message</label>
                            <textarea
                              value={editFields.closing || ""}
                              onChange={(e) => setEditFields((f) => ({ ...f, closing: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-y"
                            />
                          </div>
                        </>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => setPreviewId(isPreviewing ? null : t.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> {isPreviewing ? "Hide Preview" : "Preview"}
                        </button>
                        <button
                          onClick={() => saveTemplate(t)}
                          disabled={savingId === t.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black transition disabled:opacity-50"
                        >
                          {savingId === t.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Save
                        </button>
                      </div>

                      {/* Preview */}
                      {isPreviewing && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Email Preview</p>
                          {t.type === "order_confirmation" && renderOrderConfirmationPreview(t)}
                          {t.type === "shipping_update" && renderShippingUpdatePreview(t)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ──────────────── Compose Tab ──────────────── */}
      {activeTab === "compose" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#65a30d]" />
              <p className="text-sm font-bold text-gray-900">Compose Email</p>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            {/* To */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">To</label>
              <input
                type="email"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Customer Name</label>
              <input
                type="text"
                value={composeName}
                onChange={(e) => setComposeName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
              <input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Body</label>
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={8}
                placeholder="Write your email..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-y"
              />
            </div>

            {/* Live preview */}
            {(composeBody || composeName) && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Email Preview</p>
                <BrandedEmailShell>
                  <p className="text-lg font-black text-gray-900" style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}>
                    Hi {composeName || "there"},
                  </p>
                  {composeBody ? (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{composeBody}</p>
                  ) : (
                    <p className="text-sm text-gray-300 italic">Your message will appear here...</p>
                  )}
                </BrandedEmailShell>
              </div>
            )}

            {/* Coupon Section */}
            <div className="border-t border-gray-100 pt-4">
              {!couponOpen ? (
                <button
                  type="button"
                  onClick={() => { setCouponOpen(true); fetchAvailableCoupons(); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#65a30d] hover:underline"
                >
                  <Tag className="w-3.5 h-3.5" /> Attach Coupon to Email
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#65a30d]" />
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Attach Existing Coupon</p>
                    </div>
                    <button
                      onClick={() => { setCouponOpen(false); setAttachedCoupon(null); }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {attachedCoupon ? (
                    <div className="flex items-center justify-between bg-[#84cc16]/20 border border-[#84cc16] rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-black text-gray-900 font-mono">{attachedCoupon.code}</p>
                        <p className="text-xs text-[#65a30d] font-semibold">{attachedCoupon.discountPercent}% off — will be appended to email</p>
                      </div>
                      <button onClick={() => setAttachedCoupon(null)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : loadingCoupons ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading coupons...
                    </div>
                  ) : availableCoupons.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">No active coupons available. Create one in the Coupons page first.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {availableCoupons.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => setAttachedCoupon({ code: c.code, discountPercent: c.discountPercent })}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 hover:border-[#84cc16] hover:bg-[#84cc16]/5 transition text-left"
                        >
                          <div>
                            <span className="text-xs font-mono font-bold text-gray-900">{c.code}</span>
                            <span className="text-xs text-gray-400 ml-2">{c.discountPercent}% off</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{c.usedCount}/{c.maxUses} used · expires {new Date(c.expiresAt).toLocaleDateString()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || !composeTo || !composeSubject}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── Sent Tab ──────────────── */}
      {activeTab === "sent" && (
        <div className="space-y-3">
          {loadingSent ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400">Loading sent emails...</p>
            </div>
          ) : sentEmails.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">No emails sent yet</p>
              <p className="text-xs text-gray-400 mt-1">Compose and send your first email from the Compose tab</p>
            </div>
          ) : (
            <>
              {/* Detail overlay */}
              {selectedSent && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">Email Detail</p>
                    <button
                      onClick={() => setSelectedSent(null)}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition"
                    >
                      <X className="w-3.5 h-3.5" /> Close
                    </button>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-semibold text-gray-500 w-16">To</span>
                      <span className="text-gray-800">
                        {selectedSent.toName ? `${selectedSent.toName} <${selectedSent.to}>` : selectedSent.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-semibold text-gray-500 w-16">Subject</span>
                      <span className="text-gray-800 font-semibold">{selectedSent.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-semibold text-gray-500 w-16">Date</span>
                      <span className="text-gray-600">{selectedSent.sentAt}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-3">Preview</p>
                      <BrandedEmailShell>
                        <p className="text-lg font-black text-gray-900" style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}>
                          Hi {selectedSent.toName || "there"},
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedSent.body}</p>
                      </BrandedEmailShell>
                    </div>
                  </div>
                </div>
              )}

              {/* Email list */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {sentEmails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => setSelectedSent(selectedSent?.id === email.id ? null : email)}
                    className="w-full text-left px-5 py-3.5 hover:bg-gray-50 transition flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {email.toName || email.to}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{email.subject}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{email.sentAt}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
