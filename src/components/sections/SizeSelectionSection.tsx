"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useCart } from "../CartContext";
import type { BackendProduct } from "@/app/page";

const STATIC_PRODUCT_ID = "69aab28f68caaa864f09c826";

// These perks are the same across all variants (same formula)
const PERKS = ["0g Sugar", "Real Pickle Brine", "High Electrolytes", "Vegan & Gluten-Free"];

const STATIC_SIZES = [
  {
    id: "60ml-12pack",
    variantId: "69aab28f68caaa864f09c827",
    name: "60ml Pack",
    sizeLabel: "60ml — Pack of 12",
    quantity: "12 Bottles",
    description: "Perfect for on-the-go performance.",
    price: 22,
    perUnit: "$1.83 / bottle",
    image: "/bottle.webp",
    popular: false,
    stock: "In Stock",
  },
  {
    id: "halfgallon",
    variantId: "69aab28f68caaa864f09c828",
    name: "Half Gallon",
    sizeLabel: "Half Gallon",
    quantity: "64 fl oz",
    description: "Ideal for daily hydration & recovery.",
    price: 28,
    perUnit: "$0.44 / fl oz",
    image: "/bottle.webp",
    popular: true,
    stock: "In Stock",
  },
  {
    id: "1gallon",
    variantId: "69aab28f68caaa864f09c829",
    name: "1 Gallon",
    sizeLabel: "1 Gallon",
    quantity: "128 fl oz",
    description: "The bulk choice for serious athletes.",
    price: 38,
    perUnit: "$0.30 / fl oz",
    image: "/bottle.webp",
    popular: false,
    stock: "In Stock",
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
  perUnit: string;
  image: string;
  popular: boolean;
  stock: string;
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
    perUnit: "",
    image: variant.images?.[0]?.url ?? "/bottle.webp",
    popular: variant.badge === "POPULAR" || index === 1,
    stock: variant.stockStatus === "IN_STOCK"
      ? "In Stock"
      : variant.stockStatus === "LOW_STOCK"
      ? "Low Stock"
      : variant.stockStatus === "OUT_OF_STOCK"
      ? "Out of Stock"
      : "Coming Soon",
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
                  : "rgba(255,255,255,0.9)",
                border: size.popular
                  ? "1.5px solid rgba(163,230,53,0.5)"
                  : "1.5px solid rgba(0,0,0,0.07)",
              }}
            >
              {/* Popular badge */}
              {size.popular && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black text-[#a3e635] text-[9px] font-black px-5 py-1.5 uppercase tracking-[0.25em] rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              {/* Image — clean, no fade */}
              <div className="relative w-full h-[260px] sm:h-[280px] flex items-center justify-center pt-12 px-8">
                <div
                  className="absolute inset-0"
                  style={{
                    background: size.popular
                      ? "radial-gradient(ellipse 65% 55% at 50% 65%, rgba(0,0,0,0.08) 0%, transparent 70%)"
                      : "radial-gradient(ellipse 65% 55% at 50% 65%, rgba(163,230,53,0.15) 0%, transparent 70%)",
                  }}
                />
                <Image
                  src={size.image}
                  alt={size.name}
                  width={220}
                  height={220}
                  className="relative z-10 w-full max-w-[220px] h-auto object-contain drop-shadow-xl"
                />
              </div>

              {/* Divider */}
              <div className={`mx-6 h-px ${size.popular ? "bg-black/10" : "bg-black/6"}`} />

              {/* Content */}
              <div className="px-6 pb-7 pt-5 flex flex-col flex-1">

                {/* Stock dot + label */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    size.stock === "In Stock" ? "bg-emerald-500" :
                    size.stock === "Low Stock" ? "bg-amber-500" : "bg-red-400"
                  }`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${size.popular ? "text-black/50" : "text-black/35"}`}>
                    {size.stock}
                  </span>
                </div>

                {/* Name + size */}
                <h3 className="text-2xl font-black text-black uppercase tracking-tight leading-none mb-1">
                  {size.name}
                </h3>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${size.popular ? "text-black/50" : "text-black/30"}`}>
                  {size.sizeLabel}
                </p>
                {size.description && size.description !== size.quantity && (
                  <p className={`text-[11px] font-medium mb-4 ${size.popular ? "text-black/60" : "text-black/40"}`}>
                    {size.description}
                  </p>
                )}

                {/* Perks */}
                <ul className="space-y-1.5 mb-5">
                  {PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        size.popular ? "bg-black" : "bg-[#a3e635]"
                      }`}>
                        <Check size={9} className={size.popular ? "text-[#a3e635]" : "text-black"} strokeWidth={3.5} />
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${size.popular ? "text-black/70" : "text-black/50"}`}>
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className={`h-px mb-4 ${size.popular ? "bg-black/10" : "bg-black/6"}`} />

                {/* Price row */}
                <div className="flex items-baseline justify-between mb-5">
                  <span className="text-4xl font-black text-black tracking-tighter">
                    ${size.price}
                  </span>
                  {size.perUnit && (
                    <span className={`text-[10px] font-black uppercase tracking-widest ${size.popular ? "text-black/40" : "text-black/30"}`}>
                      {size.perUnit}
                    </span>
                  )}
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
                    className={`w-full py-2.5 text-xs font-black uppercase tracking-widest rounded-lg border-2 text-center transition-all ${
                      size.popular
                        ? "bg-transparent text-black border-black/20 hover:border-black/60"
                        : "bg-transparent text-black/40 border-black/8 hover:border-black/25 hover:text-black/70"
                    }`}
                  >
                    View Details
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
