"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useCart } from "../CartContext";
import type { BackendProduct } from "@/app/page";

const STATIC_PRODUCT_ID = "69aab28f68caaa864f09c826";

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
    stock:
      variant.stockStatus === "IN_STOCK" ? "In Stock"
      : variant.stockStatus === "LOW_STOCK" ? "Low Stock"
      : variant.stockStatus === "OUT_OF_STOCK" ? "Out of Stock"
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
    <section id="sizes" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-black text-xs font-black tracking-[0.3em] uppercase mb-4">
            Available Formats
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-black leading-[0.9] tracking-tighter uppercase mb-4 sm:mb-6">
            Choose Your <span className="text-[#a3e635]">Size.</span>
          </h2>
          <p className="text-black font-bold text-lg uppercase tracking-tight opacity-60">
            Same formula. Different needs.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8 items-start">
          {sizes.map((size) => (
            <div
              key={size.id}
              className={`relative flex flex-col rounded-sm transition-all duration-300 hover:-translate-y-1 ${
                size.popular
                  ? "bg-[#a3e635] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:scale-105 z-10"
                  : "bg-white border-4 border-black/20 hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              {/* Popular badge */}
              {size.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-[#a3e635] text-[10px] font-black px-6 py-2 uppercase tracking-widest shadow-lg whitespace-nowrap">
                  Most Popular
                </div>
              )}

              {/* Image */}
              <div className="relative w-full flex items-center justify-center pt-10 px-6 pb-4">
                <Image
                  src={size.image}
                  alt={size.name}
                  width={220}
                  height={220}
                  className="w-full max-w-[200px] h-auto object-contain"
                />
              </div>

              {/* Divider */}
              <div className={`mx-6 h-[2px] ${size.popular ? "bg-black/15" : "bg-black/6"}`} />

              {/* Content */}
              <div className="p-6 sm:p-8 flex flex-col flex-1">

                {/* Stock */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    size.stock === "In Stock" ? "bg-emerald-500" :
                    size.stock === "Low Stock" ? "bg-amber-500" : "bg-red-400"
                  }`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${size.popular ? "text-black/60" : "text-black/40"}`}>
                    {size.stock}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-2xl font-black text-black uppercase tracking-tighter italic mb-0.5">
                  {size.name}
                </h3>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${size.popular ? "text-black/50" : "text-black/30"}`}>
                  {size.sizeLabel}
                </p>
                {size.description && size.description !== size.quantity && (
                  <p className={`text-xs font-bold uppercase tracking-tight mb-5 ${size.popular ? "text-black/60" : "text-black/40"}`}>
                    {size.description}
                  </p>
                )}

                {/* Perks */}
                <ul className="space-y-2 mb-6">
                  {PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5">
                      <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${
                        size.popular
                          ? "bg-black border-black"
                          : "bg-[#a3e635] border-black"
                      }`}>
                        <Check size={8} className={size.popular ? "text-[#a3e635]" : "text-black"} strokeWidth={4} />
                      </span>
                      <span className={`text-[11px] font-black uppercase tracking-wide ${size.popular ? "text-black/70" : "text-black/50"}`}>
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className={`h-[2px] mb-5 ${size.popular ? "bg-black/15" : "bg-black/6"}`} />

                {/* Price */}
                <div className="flex items-baseline justify-between mb-6">
                  <span className="text-5xl font-black text-black tracking-tighter">
                    ${size.price}
                  </span>
                  {size.perUnit && (
                    <span className={`text-[9px] font-black uppercase tracking-widest ${size.popular ? "text-black/40" : "text-black/25"}`}>
                      {size.perUnit}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 mt-auto">
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
                    className={size.popular ? "btn-secondary" : "btn-primary"}
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/product/${product?.slug ?? "california-pickle"}`}
                    className="btn-outline text-center py-3 text-xs"
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
