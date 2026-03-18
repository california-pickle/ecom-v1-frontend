import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Item Unavailable | The California Pickle",
};

export default function OutOfStockPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full text-center">
          <div className="border-4 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-4">
              Order Unavailable
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black mb-4 leading-tight">
              Sorry, This Item<br />
              <span className="text-[#a3e635]">Sold Out</span>
            </h1>
            <p className="text-sm font-medium text-black/60 leading-relaxed mb-8">
              By the time you clicked, this item was purchased by someone else.
              No payment was taken. Head back and check what&apos;s available.
            </p>
            <Link
              href="/product/california-pickle"
              className="btn-primary inline-block px-8 py-3 text-xs font-black uppercase tracking-widest"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
