import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { BackendProduct } from "@/app/page";

interface Props {
  product?: BackendProduct | null;
}

export default function ProductPreviewSection({ product }: Props) {
  // Derive display values — fall back to hardcoded when backend is unavailable
  const productName = product?.name ?? "The California Pickle";
  const productDescription =
    product?.description ?? "60ml of pure performance. Real pickle brine, high electrolytes, zero sugar.";
  const firstVariant = product?.variants?.[0];
  const startingPrice = firstVariant?.price ?? 22;
  const priceSubLabel = firstVariant?.sizeLabel ?? "Pack of 12 · 60ml each";

  // Build slug for the product detail link -
  const productSlug = product?.slug ?? "california-pickle";

  // Split name for two-line heading (last word accented)
  const nameParts = productName.split(" ");
  const nameStart = nameParts.slice(0, -1).join(" ");
  const nameLast = nameParts[nameParts.length - 1];

  return (
    <section id="product-preview" className="bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-sm overflow-hidden border-4 border-black shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)]"
          style={{ background: "#A2B971" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Text */}
            <div className="p-8 sm:p-12 lg:p-20 order-2 lg:order-1">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-black text-black" />
                ))}
                <span className="text-xs font-black text-black ml-3 uppercase tracking-widest italic">
                  5.0 / 5.0 Rating
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-black leading-[0.85] tracking-tighter mb-6 sm:mb-8 uppercase">
                {nameStart}
                <br />
                {nameLast}.
              </h2>
              <p className="text-black font-bold text-lg leading-tight mb-8 uppercase tracking-tight">
                {productDescription}
              </p>
              <div className="flex items-baseline gap-3 mb-8 sm:mb-10">
                <span className="text-5xl sm:text-7xl font-black text-black tracking-tighter">${startingPrice}</span>
                <span className="text-[#4a5e2a] font-black text-xs uppercase tracking-widest">{priceSubLabel}</span>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href={`/product/${productSlug}`} className="btn-secondary px-10">
                  Buy Now
                </Link>
                <Link href="#sizes" className="btn-outline px-10 border-black/40 text-black/70 hover:bg-black/10">
                  View All Sizes
                </Link>
              </div>
            </div>

            {/* Product image — use explicit width/height (Next.js standard), let CSS handle responsiveness */}
            <div className="order-1 lg:order-2 flex items-center justify-center p-6 lg:p-10">
              <div
                style={{
                  maskImage: "linear-gradient(to top, transparent 0%, black 1%, black 100%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 1%, black 100%)",
                }}
              >
                <Image
                  src="/ingredients.webp"
                  alt={productName}
                  width={700}
                  height={840}
                  className="w-full h-auto max-h-[520px] object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
