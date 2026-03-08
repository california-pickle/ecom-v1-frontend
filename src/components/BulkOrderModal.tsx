"use client";

import { useState } from "react";
import { X, Package, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BulkOrderModal({ open, onClose }: Props) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.quantity) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bulk-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to submit. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", company: "", quantity: "", message: "" });
  };

  const inputClass =
    "w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30 placeholder:normal-case";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(163,230,53,1)] rounded-sm z-10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-black bg-[#a3e635] flex-shrink-0">
          <div className="flex items-center gap-3">
            <Package size={22} className="text-black" strokeWidth={3} />
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight italic">
                Bulk Order Inquiry
              </h2>
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                Get wholesale pricing · Priority handling
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/10 rounded-sm transition text-black"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
              <div className="w-16 h-16 bg-[#a3e635] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle size={28} className="text-black" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-tight italic">
                Inquiry Received!
              </h3>
              <p className="text-[11px] font-black text-black/50 uppercase tracking-widest leading-relaxed max-w-xs">
                We&apos;ll review your request and contact you within 24 hours with pricing and availability.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-8 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#a3e635] hover:text-black transition-all border-2 border-black rounded-sm"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Highlight Banner */}
              <div className="flex items-start gap-3 bg-black text-white p-4 rounded-sm border-2 border-black">
                <AlertCircle size={16} className="text-[#a3e635] flex-shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Bulk orders get PRIORITY fulfillment. We offer custom wholesale pricing for gyms, retailers, and brands. No minimum order size — tell us what you need.
                </p>
              </div>

              {/* Name + Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Smith"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                    Company / Gym
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="FitLife Gym"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="john@gym.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="3105550198"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                  Quantity Needed *
                </label>
                <select
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">SELECT QUANTITY RANGE</option>
                  <option value="Under 100 units">Under 100 units</option>
                  <option value="100–250 units">100–250 units</option>
                  <option value="250–500 units">250–500 units</option>
                  <option value="500–1,000 units">500–1,000 units</option>
                  <option value="1,000–5,000 units">1,000–5,000 units</option>
                  <option value="5,000+ units / Monthly">5,000+ units / Monthly recurring</option>
                  <option value="Custom / Not sure yet">Custom — I&apos;ll describe in message</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                  Additional Details
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us about your use case, delivery frequency, or special requirements..."
                  className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all resize-none normal-case placeholder:opacity-40 placeholder:normal-case placeholder:font-normal"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-black text-white text-[13px] font-black uppercase tracking-widest hover:bg-[#a3e635] hover:text-black transition-all border-2 border-black rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(163,230,53,1)] hover:shadow-none active:scale-95"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT BULK INQUIRY →"}
              </button>

              <p className="text-center text-[9px] font-black text-black/30 uppercase tracking-widest">
                We respond within 24 hours · No commitment required
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
