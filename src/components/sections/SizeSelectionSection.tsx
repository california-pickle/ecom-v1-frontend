"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../CartContext";
import type { BackendProduct } from "@/app/page";

const STATIC_PRODUCT_ID = "69aab28f68caaa864f09c826";

const STATIC_SIZES = [
  {
    id: "60ml-12pack",
    variantId: "69aab28f68caaa864f09c827",
    name: "60ml Pack",
    sizeLabel: "60ml — Pack of 12",
    quantity: "12 Bottles",
    description: "Perfect for on-the-go performance.",
    price: 22,
    image: "/bottle.webp",
    popular: false,
  },
  {
    id: "halfgallon",
    variantId: "69aab28f68caaa864f09c828",
    name: "Half Gallon",
    sizeLabel: "Half Gallon",
    quantity: "64 fl oz",
    description: "Ideal for daily hydration & recovery.",
    price: 28,
    image: "/bottle.webp",
    popular: true,
  },
  {
    id: "1gallon",
    variantId: "69aab28f68caaa864f09c829",
    name: "1 Gallon",
    sizeLabel: "1 Gallon",
    quantity: "128 fl oz",
    description: "The bulk choice for serious athletes.",
    price: 38,
    image: "/bottle.webp",
    popular: false,
  },
];

interface SizeCard {
  id: string;
  variantId: string;
  name: string;
  sizeLabel: string;
  quantity: string;
  description: string;
  price: number;
  image: string;
  popular: boolean;
}

interface Props {
  product?: BackendProduct | null;
}

function buildSizesFromBackend(product: BackendProduct): SizeCard[] {
  return product.variants.map((variant, index) => ({
    id: variant._id,
    variantId: variant._id,
    name: variant.sizeLabel,
    sizeLabel: variant.sizeLabel,
    quantity: variant.subtitle ?? "",
    description: variant.subtitle ?? "",
    price: variant.price,
    image: variant.images?.[0]?.url ?? "/bottle.webp",
    popular: variant.badge === "POPULAR" || index === 1,
  }));
}

export default function SizeSelectionSection({ product }: Props) {
  const { addItem } = useCart();

  const productId = product?._id ?? STATIC_PRODUCT_ID;
  const sizes: SizeCard[] =
    product && product.variants?.length > 0
      ? buildSizesFromBackend(product)
      : STATIC_SIZES;

  return (
    <section id="sizes" className="bg-[#f5f5f0] py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-black/40 text-xs font-black tracking-[0.35em] uppercase mb-4">
            Available Formats
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-black leading-[0.9] tracking-tighter uppercase mb-4">
            Choose Your <span className="text-[#a3e635]">Size.</span>
          </h2>
          <p className="text-black/50 font-bold text-sm uppercase tracking-[0.15em]">
            Same formula. Different needs.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
          {sizes.map((size) => (
            <div
              key={size.id}
              className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                size.popular
                  ? "sm:scale-[1.04] z-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)]"
                  : "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]"
              }`}
              style={{
                background: size.popular
                  ? "linear-gradient(160deg, #c8f04a 0%, #a3e635 100%)"
                  : "rgba(255,255,255,0.85)",
                border: size.popular
                  ? "1.5px solid rgba(163,230,53,0.6)"
                  : "1.5px solid rgba(0,0,0,0.07)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Popular badge */}
              {size.popular && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black text-[#a3e635] text-[9px] font-black px-5 py-1.5 uppercase tracking-[0.25em] rounded-full">
                  Most Popular
                </div>
              )}

              {/* Image area — big, with bottom fade */}
              <div className="relative w-full h-[280px] sm:h-[300px] flex items-center justify-center pt-10 px-6">
                {/* Subtle radial glow behind image */}
                <div
                  className={`absolute inset-0 ${size.popular ? "opacity-30" : "opacity-20"}`}
                  style={{
                    background: "radial-gradient(ellipse 70% 60% at 50% 60%, #a3e635 0%, transparent 70%)",
                  }}
                />
                {/* Image with bottom fade */}
                <div
                  className="relative z-10 w-full h-full"
                  style={{
                    maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                  }}
                >
                  <Image
                    src={size.image}
                    alt={size.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 80vw, 33vw"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-8 pt-2 flex flex-col flex-1">
                {/* Name + quantity */}
                <div className="mb-3">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className={`text-xl font-black uppercase tracking-tight ${size.popular ? "text-black" : "text-black"}`}>
                      {size.name}
                    </h3>
                    {size.quantity && (
                      <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${size.popular ? "text-black/50" : "text-black/30"}`}>
                        {size.quantity}
                      </span>
                    )}
                  </div>
                  {size.description && size.description !== size.quantity && (
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${size.popular ? "text-black/60" : "text-black/40"}`}>
                      {size.description}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className={`text-5xl font-black tracking-tighter mb-6 ${size.popular ? "text-black" : "text-black"}`}>
                  ${size.price}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    onClick={() =>
                      addItem({
                        id: size.id,
                        productId,
                        variantId: size.variantId,
                        name: `${size.name}${size.quantity ? ` (${size.quantity})` : ""}`,
                        price: size.price,
                        image: size.image,
                        sizeLabel: size.sizeLabel,
                      })
                    }
                    className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-lg border-2 transition-all ${
                      size.popular
                        ? "bg-black text-[#a3e635] border-black hover:bg-black/80"
                        : "bg-black text-white border-black hover:bg-black/80"
                    }`}
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/product/${product?.slug ?? "california-pickle"}`}
                    className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-lg border-2 text-center transition-all ${
                      size.popular
                        ? "bg-transparent text-black border-black/30 hover:border-black"
                        : "bg-transparent text-black/50 border-black/10 hover:border-black/30 hover:text-black"
                    }`}
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
