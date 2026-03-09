"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Truck, Lock, ChevronRight, RefreshCw, CheckCircle, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

interface ShippingRate {
  rateId: string;
  carrier: string;
  service: string;
  amount: number;
  currency: string;
  estimatedDays: number;
  durationTerms: string;
}

export default function CheckoutPage() {
  const { items, updateQuantity, total } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<null | { code: string; discountPercent: number }>(null);
  const [couponError, setCouponError] = useState("");

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let value = e.target.value;

    // Enforce per-field rules — block invalid chars and cap length
    switch (name) {
      case "firstName":
      case "lastName":
        value = value.replace(/[^a-zA-Z\s'-]/g, "").slice(0, 50);
        break;
      case "email":
        value = value.slice(0, 100);
        break;
      case "address":
        value = value.slice(0, 100);
        break;
      case "city":
        value = value.replace(/[^a-zA-Z\s'-]/g, "").slice(0, 50);
        break;
      case "state":
        value = value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
        break;
      case "zip":
        value = value.replace(/\D/g, "").slice(0, 5);
        break;
      case "phone":
        value = value.replace(/\D/g, "").slice(0, 10);
        break;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => { const next = {...prev}; delete next[name]; return next; });
    // Reset rates when address changes
    if (["address", "city", "state", "zip"].includes(name)) {
      setRatesLoaded(false);
      setSelectedRate(null);
      setRates([]);
    }
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    if (form.firstName.trim().length < 2) errors.firstName = true;
    if (form.lastName.trim().length < 2) errors.lastName = true;
    if (!form.email.includes("@") || form.email.length < 5) errors.email = true;
    if (form.address.trim().length < 5) errors.address = true;
    if (form.city.trim().length < 2) errors.city = true;
    if (form.state.length !== 2) errors.state = true;
    if (!/^\d{5}$/.test(form.zip)) errors.zip = true;
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) errors.phone = true;
    return errors;
  };

  const fetchShippingRates = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setFormErrors({});

    setFetchingRates(true);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAddress: {
            name: `${form.firstName} ${form.lastName}`,
            street: form.address,
            city: form.city,
            state: form.state.toUpperCase(),
            zip: form.zip,
          },
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Could not get shipping rates. Please try again.");
        return;
      }

      if (!data.rates || data.rates.length === 0) {
        toast.error("No shipping options available for this address.");
        return;
      }

      setRates(data.rates);
      setSelectedRate(data.rates[0]);
      setRatesLoaded(true);
    } catch {
      toast.error("Failed to fetch shipping rates. Please try again.");
    } finally {
      setFetchingRates(false);
    }
  };

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
        setCouponError("");
        toast.success(`Coupon applied — ${data.discountPercent}% off!`);
      } else {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon. Try again.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!selectedRate) {
      toast.error("Please select a shipping option.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            street: form.address,
            city: form.city,
            state: form.state.toUpperCase(),
            zipCode: form.zip,
            phone: form.phone.replace(/\D/g, ""),
          },
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          shippoRateId: selectedRate.rateId,
          shippingCost: selectedRate.amount,
          couponCode: appliedCoupon?.code ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const msg = data.errors.map((e: any) => e.message).join(", ");
          toast.error(msg);
        } else {
          toast.error(data.message || data.error || "Order failed. Please try again.");
        }
        return;
      }

      if (data.checkoutUrl) {
        // Store coupon for redemption after Stripe payment succeeds
        if (appliedCoupon) {
          sessionStorage.setItem("pendingCoupon", appliedCoupon.code);
        }
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("No checkout URL received. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const discount = appliedCoupon ? (total * appliedCoupon.discountPercent / 100) : 0;
  const grandTotal = total - discount + (selectedRate?.amount ?? 0);

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-black/40">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={8} className="text-black" strokeWidth={5} />
            <Link href="/product" className="hover:text-black transition-colors">Product</Link>
            <ChevronRight size={8} className="text-black" strokeWidth={5} />
            <span className="text-black">Checkout</span>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-8 sm:mb-10 uppercase tracking-tighter italic">
            Checkout
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
              {/* Left: Forms */}
              <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">

                {/* Customer info */}
                <div className="bg-[#f9f9f9] border-2 border-black rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-xl font-black text-black mb-6 uppercase tracking-tighter italic">
                    Customer Information
                  </h2>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleFormChange}
                          required
                          minLength={2}
                          maxLength={50}
                          placeholder="JOHN"
                          className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.firstName ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleFormChange}
                          required
                          minLength={2}
                          maxLength={50}
                          placeholder="SMITH"
                          className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.lastName ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleFormChange}
                        required
                        maxLength={100}
                        placeholder="JOHN@EXAMPLE.COM"
                        className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.email ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping address */}
                <div className="bg-[#f9f9f9] border-2 border-black rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-xl font-black text-black mb-6 uppercase tracking-tighter italic">
                    Shipping Address
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleFormChange}
                        required
                        minLength={5}
                        maxLength={100}
                        placeholder="123 MAIN STREET"
                        className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.address ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleFormChange}
                          required
                          minLength={2}
                          maxLength={50}
                          placeholder="LOS ANGELES"
                          className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.city ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                          State * (2-letter)
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={form.state}
                          onChange={handleFormChange}
                          required
                          maxLength={2}
                          minLength={2}
                          placeholder="CA"
                          className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.state ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                          ZIP Code * (5 digits)
                        </label>
                        <input
                          type="text"
                          name="zip"
                          value={form.zip}
                          onChange={handleFormChange}
                          onBlur={() => {
                            if (form.zip.length === 4) {
                              setForm((prev) => ({ ...prev, zip: "0" + prev.zip }));
                            }
                          }}
                          required
                          pattern="\d{5}"
                          maxLength={5}
                          inputMode="numeric"
                          placeholder="90210"
                          className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.zip ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                          Phone * (10 digits)
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleFormChange}
                          required
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="2135550198"
                          className={`w-full px-4 py-3 border-2 rounded-sm text-sm font-bold focus:outline-none transition-all uppercase placeholder:opacity-30 ${formErrors.phone ? "border-red-500 bg-red-50 focus:bg-red-50" : "border-black focus:bg-[#a3e635]"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Rate Selection */}
                <div className="bg-[#f9f9f9] border-2 border-black rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-black uppercase tracking-tighter italic">
                      Shipping
                    </h2>
                    {ratesLoaded && (
                      <button
                        type="button"
                        onClick={fetchShippingRates}
                        className="text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black flex items-center gap-1"
                      >
                        <RefreshCw size={10} /> Refresh
                      </button>
                    )}
                  </div>

                  {!ratesLoaded ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-relaxed">
                        Fill in your address above, then click below to see live shipping rates.
                      </p>
                      <button
                        type="button"
                        onClick={fetchShippingRates}
                        disabled={fetchingRates || items.length === 0}
                        className="w-full py-3 border-2 border-black rounded-sm text-[11px] font-black uppercase tracking-widest bg-white hover:bg-[#a3e635] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {fetchingRates ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            Fetching Rates...
                          </>
                        ) : (
                          <>
                            <Truck size={12} strokeWidth={3} />
                            Get Shipping Rates
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(
                        rates.reduce<Record<string, ShippingRate[]>>((acc, r) => {
                          (acc[r.carrier] ??= []).push(r);
                          return acc;
                        }, {})
                      ).map(([carrier, carrierRates]) => (
                        <div key={carrier}>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 mb-1.5 px-1">
                            {carrier}
                          </p>
                          <div className="space-y-1.5">
                            {carrierRates.map((rate) => (
                              <button
                                key={rate.rateId}
                                type="button"
                                onClick={() => setSelectedRate(rate)}
                                className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-sm transition-all text-left ${
                                  selectedRate?.rateId === rate.rateId
                                    ? "border-black bg-[#a3e635] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    : "border-black/20 hover:border-black bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${selectedRate?.rateId === rate.rateId ? "bg-black" : "bg-white"}`}>
                                    {selectedRate?.rateId === rate.rateId && (
                                      <div className="w-2 h-2 rounded-full bg-[#a3e635]" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-black text-black uppercase tracking-tight">
                                      {rate.service}
                                    </p>
                                    <p className="text-[9px] font-black text-black/50 uppercase tracking-widest mt-0.5">
                                      {rate.estimatedDays ? `Est. ${rate.estimatedDays} day${rate.estimatedDays > 1 ? "s" : ""}` : rate.durationTerms || ""}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-base font-black text-black tracking-tighter italic">
                                  ${rate.amount.toFixed(2)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right: Order summary */}
              <div className="lg:sticky lg:top-40 space-y-5 order-1 lg:order-2">
                <div className="bg-white border-2 border-black rounded-sm p-6 shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]">
                  <h2 className="text-xl font-black text-black mb-6 uppercase tracking-tighter italic">Order Summary</h2>

                  {items.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-black/40 font-black text-[9px] uppercase tracking-widest mb-5">Your cart is empty</p>
                      <Link
                        href="/product"
                        className="inline-block border-2 border-black px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#a3e635] transition-colors"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 border-b border-black/5 pb-5 last:border-0 last:pb-0">
                          <div className="w-16 h-16 bg-[#f9f9f9] border border-black rounded-sm flex-shrink-0 flex items-center justify-center">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={50}
                              className="w-10 h-12 object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-black text-xs uppercase tracking-tight truncate">
                              California Pickle
                            </p>
                            <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mt-0.5">
                              {item.sizeLabel}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="inline-flex items-center border border-black rounded-sm overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-1.5 py-0.5 hover:bg-[#a3e635] border-r border-black transition-colors"
                                >
                                  <Minus size={10} strokeWidth={4} />
                                </button>
                                <span className="px-3 py-0.5 text-[10px] font-black italic">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-1.5 py-0.5 hover:bg-[#a3e635] border-l border-black transition-colors"
                                >
                                  <Plus size={10} strokeWidth={4} />
                                </button>
                              </div>
                              <span className="font-black text-black text-base tracking-tighter italic">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coupon Section */}
                  {items.length > 0 && (
                    <div className="mt-4">
                      {!couponOpen && !appliedCoupon ? (
                        <button
                          type="button"
                          onClick={() => setCouponOpen(true)}
                          className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={10} strokeWidth={3} /> Apply Coupon Code
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {!appliedCoupon && (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                                placeholder="ENTER CODE"
                                className="flex-1 border-2 border-black rounded-sm px-3 py-2 text-xs font-black uppercase tracking-wider focus:outline-none focus:bg-[#a3e635]/20 transition"
                              />
                              <button
                                type="button"
                                onClick={applyCoupon}
                                disabled={couponLoading || !couponCode.trim()}
                                className="border-2 border-black px-3 py-2 text-xs font-black uppercase bg-white hover:bg-[#a3e635] transition disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {couponLoading ? "..." : "Apply"}
                              </button>
                            </div>
                          )}
                          {couponError && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                              {couponError}
                            </p>
                          )}
                          {appliedCoupon && (
                            <div className="flex items-center justify-between bg-[#a3e635]/20 border-2 border-[#a3e635] rounded-sm px-3 py-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-black">
                                {appliedCoupon.code} applied — {appliedCoupon.discountPercent}% off
                              </span>
                              <button
                                type="button"
                                onClick={removeCoupon}
                                className="text-black/60 hover:text-black transition"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="border-t-2 border-black mt-6 pt-6 space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-black/40">Subtotal</span>
                        <span className="text-black">${total.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-[#65a30d]">Discount ({appliedCoupon.discountPercent}%)</span>
                          <span className="text-[#65a30d]">-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-black/40">Shipping</span>
                        {selectedRate ? (
                          <span className="text-black">${selectedRate.amount.toFixed(2)}</span>
                        ) : (
                          <span className="text-black/30 italic">Select above</span>
                        )}
                      </div>
                      <div className="flex justify-between text-2xl font-black border-t border-black pt-4 mt-3 uppercase tracking-tighter italic">
                        <span>Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedRate && (
                  <div className="flex items-center gap-3 bg-[#a3e635] border-2 border-black rounded-sm px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle size={16} className="text-black flex-shrink-0" strokeWidth={3} />
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">
                      {selectedRate.carrier} {selectedRate.service} selected
                    </p>
                  </div>
                )}

                {/* No Return / No Refund Policy */}
                <div className="border-2 border-black bg-black text-white rounded-sm p-4 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#a3e635] mb-1.5">
                    ⚠ Important Policy — Please Read
                  </p>
                  <p className="text-[10px] font-bold leading-relaxed text-white/80">
                    <span className="text-white font-black">ALL SALES ARE FINAL.</span> Due to the perishable and consumable nature of our food &amp; beverage products, we do not accept returns or issue refunds once an order has been placed. By completing this purchase, you acknowledge and agree to this no-return, no-refund policy. If your order arrives damaged, please contact us within 48 hours with photos at{" "}
                    <span className="text-[#a3e635]">support@californiapickle.com</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0 || !selectedRate}
                  className="btn-secondary w-full py-5 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "PROCESSING..." : !selectedRate ? "SELECT SHIPPING FIRST" : `DEPLOY ORDER · $${grandTotal.toFixed(2)}`}
                </button>

                <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-black/40 flex items-center justify-center gap-2">
                  <Lock size={10} strokeWidth={3} />
                  Secure checkout · 256-bit encrypted · No refunds on food products
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
