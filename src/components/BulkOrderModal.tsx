"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface BulkOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BulkOrderModal({ open, onClose }: BulkOrderModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    quantity: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const res = await fetch("/api/bulk-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed");
        setSubmitted(true);
        toast.success("Request received! We'll be in touch within 24 hours.");
        setTimeout(() => {
          setForm({ name: "", email: "", phone: "", company: "", quantity: "", message: "" });
          setSubmitted(false);
          onClose();
        }, 2000);
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    };

  return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
        <div
          className="relative bg-white border-4 border-black rounded-t-2xl sm:rounded-sm w-full sm:max-w-lg shadow-[8px_8px_0px_0px_rgba(163,230,53,1)] sm:shadow-[16px_16px_0px_0px_rgba(163,230,53,1)] max-h-[92vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b-4 border-black bg-[#a3e635] flex-shrink-0">
          <div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter italic">Bulk Deployment</h2>
            <p className="text-[10px] font-black text-black uppercase tracking-widest mt-1 opacity-60">
              Get pricing for large quantities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-black text-[#a3e635] rounded-sm hover:scale-110 active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={20} strokeWidth={4} />
          </button>
        </div>

          {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">

            {submitted && (
              <div className="bg-[#a3e635]/20 border-2 border-[#84cc16] rounded-sm px-4 py-4 text-center">
                <p className="text-lg font-black text-black uppercase tracking-tight">Request Sent!</p>
                <p className="text-xs font-bold text-black/60 mt-1 uppercase tracking-widest">We&apos;ll be in touch within 24 hours.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-[0.2em]">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="YOUR NAME"
                  className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635]/10 transition-all uppercase placeholder:opacity-20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-[0.2em]">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635]/10 transition-all uppercase placeholder:opacity-20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-[0.2em]">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="YOU@EXAMPLE.COM"
                className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635]/10 transition-all uppercase placeholder:opacity-20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-[0.2em]">
                Company <span className="opacity-40">(Optional)</span>
              </label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="YOUR COMPANY NAME"
                className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635]/10 transition-all uppercase placeholder:opacity-20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-[0.2em]">
                Quantity Needed *
              </label>
              <input
                type="text"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="E.G. 500 UNITS, 50 CASES..."
                className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635]/10 transition-all uppercase placeholder:opacity-20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-[0.2em]">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="TELL US ABOUT YOUR DEPLOYMENT TIMELINE..."
                className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635]/10 transition-all resize-none uppercase placeholder:opacity-20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || submitted}
              className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "SENDING..." : submitted ? "SENT ✓" : "SUBMIT REQUEST"}
            </button>

            <p className="text-center text-[10px] font-black uppercase tracking-widest text-black/40 italic">
              Deployment response within 24 hours.
            </p>
          </form>
      </div>
    </div>

  );
}
