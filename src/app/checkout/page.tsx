"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Truck, Lock, ChevronRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, updateQuantity, total, clearCart } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "", // Added phone
  });

  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
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
            state: form.state,
            zipCode: form.zip,
            phone: form.phone.replace(/\D/g, ""), // Strip non-digits
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
        // Jodi backend theke specific validation errors ase
        if (data.errors) {
          const msg = data.errors.map((e: any) => e.message).join(", ");
          toast.error(msg);
        } else {
          toast.error(data.message || data.error || "Order failed");
        }
        return;
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout!
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
          <main className="pt-20 sm:pt-32 md:pt-40 bg-white min-h-screen">
          {/* Breadcrumb */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-black/40">
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <ChevronRight size={8} className="text-black" strokeWidth={5} />
              <Link href="/product" className="hover:text-black transition-colors">
                Product
              </Link>
              <ChevronRight size={8} className="text-black" strokeWidth={5} />
              <span className="text-black">Checkout</span>
            </nav>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-8 sm:mb-10 uppercase tracking-tighter italic">Checkout</h1>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
                {/* Left: Forms — appears second on mobile */}
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
                            placeholder="JOHN"
                            className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
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
                            placeholder="SMITH"
                            className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
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
                          placeholder="JOHN@EXAMPLE.COM"
                          className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
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
                          placeholder="123 MAIN STREET"
                          className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
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
                            placeholder="LOS ANGELES"
                            className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                            State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={form.state}
                            onChange={handleFormChange}
                            required
                            placeholder="CA"
                            className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            name="zip"
                            value={form.zip}
                            onChange={handleFormChange}
                            required
                            placeholder="90210"
                            className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleFormChange}
                            required
                            placeholder="2135550198"
                            className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-bold focus:outline-none focus:bg-[#a3e635] transition-all uppercase placeholder:opacity-30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-black mb-1.5 uppercase tracking-[0.2em]">
                          Country
                        </label>
                        <select
                          name="country"
                          value={form.country}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 border-2 border-black rounded-sm text-sm font-black focus:outline-none focus:bg-[#a3e635] transition-all bg-white uppercase"
                        >
                          <option value="US">UNITED STATES</option>
                          <option value="CA">CANADA</option>
                          <option value="GB">UNITED KINGDOM</option>
                          <option value="AU">AUSTRALIA</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Payment Note */}
                  <div className="bg-[#f9f9f9] border-2 border-black rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-black text-black uppercase tracking-tighter italic">Payment</h2>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/40">
                        <Lock size={10} strokeWidth={3} />
                        SECURE STRIPE CHECKOUT
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-relaxed">
                      YOU WILL BE REDIRECTED TO A SECURE STRIPE PAGE TO COMPLETE YOUR PURCHASE. WE NEVER STORE YOUR CARD DETAILS.
                    </p>
                  </div>
                </div>

                {/* Right: Order summary — appears FIRST on mobile */}
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
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                    className="px-1.5 py-0.5 hover:bg-[#a3e635] border-r border-black transition-colors"
                                  >
                                    <Minus size={10} strokeWidth={4} />
                                  </button>
                                  <span className="px-3 py-0.5 text-[10px] font-black italic">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="px-1.5 py-0.5 hover:bg-[#a3e635] border-l border-black transition-colors"
                                  >
                                    <Plus size={10} strokeWidth={4} />
                                  </button>
                                </div>
                                <span className="font-black text-black text-base tracking-tighter italic">
                                  ${item.price * item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {items.length > 0 && (
                      <div className="border-t-2 border-black mt-6 pt-6 space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-black/40">Subtotal</span>
                          <span className="text-black">${total}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-black/40">Shipping</span>
                          <span className="text-[#a3e635] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">Free</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black border-t border-black pt-4 mt-3 uppercase tracking-tighter italic">
                          <span>Total</span>
                          <span>${total}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipping note */}
                  <div className="flex items-center gap-3 bg-[#a3e635] border-2 border-black rounded-sm px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Truck size={16} className="text-black flex-shrink-0" strokeWidth={3} />
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">
                      Ships within 24 hours
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="btn-secondary w-full py-5 text-lg"
                  >
                    {submitting ? "PROCESSING..." : `DEPLOY ORDER · $${total}`}
                  </button>

                  <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-black/40 flex items-center justify-center gap-2">
                    <Lock size={10} strokeWidth={3} />
                    Secure checkout · 256-bit encrypted
                  </p>
                </div>
              </div>
            </form>
          </div>
        </main>
    </>
  );
}
