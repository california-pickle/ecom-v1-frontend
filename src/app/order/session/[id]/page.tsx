"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Clock, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/components/CartContext";

interface SafeOrder {
  _id: string;
  items: {
    name: string;
    sizeLabel: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: string;
  customerFirstName: string;
  shippingCity: string;
  createdAt: string;
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<SafeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/session/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          if (data.paymentStatus === "paid") {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
    interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (order && !loading) {
      clearCart();
    }
  }, [order, loading, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#a3e635] rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
          <p className="font-black text-[10px] uppercase tracking-widest text-black/40 italic">Verifying Payment...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black text-black mb-4 uppercase tracking-tighter italic">Order Not Found</h1>
          <p className="text-gray-500 mb-8 font-medium">We couldn&apos;t find your order details. If you&apos;ve been charged, don&apos;t worry — check your email for a confirmation.</p>
          <Link href="/" className="btn-primary inline-block px-10">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 sm:pt-32 md:pt-40 min-h-screen bg-white pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#a3e635] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <ShieldCheck size={36} className="text-black" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black mb-2 uppercase tracking-tighter italic">
              Deployment{" "}
              <span className="text-[#a3e635] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Confirmed!</span>
            </h1>

            <div className="mb-4">
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">
                Hey {order.customerFirstName}! Your order is on its way to {order.shippingCity}.
              </p>
            </div>

            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
              Payment Status:
              <span className={order.paymentStatus === "paid" ? "text-[#84cc16]" : "text-orange-500"}>
                {order.paymentStatus.toUpperCase()}
              </span>
              {order.paymentStatus === "pending" && (
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* Left Column: Receipt */}
            <div className="bg-[#f9f9f9] border-2 border-black rounded-sm p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center mb-8 border-b-2 border-black/5 pb-4">
                <h2 className="text-xl font-black text-black uppercase tracking-tighter italic">Order Summary</h2>
                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest font-mono">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 bg-white border-2 border-black rounded-sm flex-shrink-0 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(163,230,53,1)]">
                      <Package size={24} className="text-black/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-black text-xs uppercase tracking-tight truncate">{item.name}</p>
                      <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mt-0.5">{item.sizeLabel}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] font-black text-black/60 uppercase">Qty: {item.quantity}</span>
                        <span className="font-black text-black text-sm italic">
                          ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black mt-8 pt-6 space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-black/40">Subtotal</span>
                  <span className="text-black">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-3xl font-black border-t-2 border-black pt-4 mt-3 uppercase tracking-tighter italic">
                  <span>Total Paid</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="space-y-6">
              <div className="bg-[#a3e635] border-2 border-black rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-black text-black mb-4 uppercase tracking-widest">Next Steps</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Truck size={18} className="text-black flex-shrink-0" strokeWidth={3} />
                    <p className="text-[10px] font-black text-black uppercase tracking-widest leading-tight">
                      Ships within 24 hours via your selected carrier.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Clock size={18} className="text-black flex-shrink-0" strokeWidth={3} />
                    <p className="text-[10px] font-black text-black uppercase tracking-widest leading-tight">
                      Tracking number will be sent to your email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-black rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-[9px] font-black text-black/40 mb-3 uppercase tracking-widest">Shipping To</h3>
                <div className="text-[10px] font-black text-black uppercase tracking-widest space-y-1">
                  <p>{order.customerFirstName}</p>
                  <p>{order.shippingCity}</p>
                  <p className="text-black/40 text-[9px]">Full address sent to your email</p>
                </div>
              </div>

              <Link href="/" className="btn-outline w-full py-4 text-center block">Back to Home</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
