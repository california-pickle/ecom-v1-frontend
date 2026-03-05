import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export default function ProductPreviewSection() {
  return (
    <section id="product-preview" className="bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm bg-[#a3e635] overflow-hidden border-4 border-black shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Text */}
            <div className="p-8 sm:p-12 lg:p-20 order-2 lg:order-1">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-black text-black" />
                ))}
                <span className="text-xs font-black text-black ml-3 uppercase tracking-widest italic">5.0 / 5.0 Rating</span>
              </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-black leading-[0.85] tracking-tighter mb-6 sm:mb-8 uppercase">
                The California
                <br />
                Pickle Shot.
              </h2>
              <p className="text-black font-bold text-lg leading-tight mb-8 uppercase tracking-tight">
                60ml of pure performance. Real pickle brine, high electrolytes,
                zero sugar.
              </p>
              <div className="flex items-baseline gap-3 mb-8 sm:mb-10">
                <span className="text-5xl sm:text-7xl font-black text-black tracking-tighter">$22</span>
                <span className="text-black/60 font-black text-xs uppercase tracking-widest">Pack of 12 · 60ml each</span>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/product"
                  className="btn-secondary px-10"
                >
                  View Product
                </Link>
                <Link
                  href="/product"
                  className="btn-outline px-10 bg-white/20 border-black/20"
                >
                  Add to Cart
                </Link>
              </div>
            </div>

            {/* Product image */}
              <div className="order-1 lg:order-2 flex justify-center items-center p-8 sm:p-12 lg:p-20 bg-black/5 h-full">
              <div className="product-image-container !max-w-[200px] sm:!max-w-[320px] lg:!max-w-[400px]">
                <Image
                  src="/bottle.webp"
                  alt="California Pickle bottle"
                  width={560}
                  height={560}
                  className="product-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
