"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Truck, Clock } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

// Re-export from catalog so existing imports keep working
export type { SizeOption as SizeOptionDef } from "@/lib/products";

interface ProductActionsProps {
  productId: string;
  sizeOptions: import("@/lib/products").SizeOption[];
}

export default function ProductActions({ productId, sizeOptions }: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0].value);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  const currentOption = sizeOptions.find((o) => o.value === selectedSize)!;
  const total = currentOption.price * quantity;

  const handleAddToCart = () => {
    addItem(
      {
        id: selectedSize,
        productId: productId,
        variantId: currentOption.variantId,
        name: `California Pickle (${currentOption.label})`,
        price: currentOption.price,
        image: "/bottle.webp",
        sizeLabel: currentOption.label,
      },
      quantity
    );
    toast.success(`Added to cart — ${currentOption.label}`, {
      action: {
        label: "Checkout",
        onClick: () => router.push("/checkout"),
      },
    });
  };

  return (
    <>
      {/* Price */}
      <div className="flex items-baseline gap-4 mb-8">
        <span className="text-4xl sm:text-6xl font-black text-black tracking-tighter italic">
          ${total}
        </span>
        <span className="text-black/40 font-black text-[10px] uppercase tracking-widest">
          ${currentOption.price} × {quantity}
        </span>
      </div>

      {/* Size options */}
      <div className="mb-8">
        <p className="text-[9px] font-black text-black mb-3 tracking-[0.2em] uppercase">
          Select Size
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sizeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedSize(opt.value)}
              className={`relative border-2 rounded-sm p-3 text-left transition-all duration-200 ${
                selectedSize === opt.value
                  ? "border-black bg-[#a3e635] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
                  : "border-black/10 hover:border-black/20 bg-white"
              }`}
            >
              {opt.sublabel && (
                <span className="absolute -top-2 left-2 bg-black text-[#a3e635] text-[7px] font-black px-1.5 py-0.5 uppercase tracking-widest">
                  {opt.sublabel}
                </span>
              )}
              <p className="font-black text-black text-[10px] uppercase tracking-tight mb-0.5">
                {opt.label.split("—")[0]}
              </p>
              <p className="font-black text-black text-base tracking-tighter">
                ${opt.price}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-10">
        <p className="text-[9px] font-black text-black mb-3 tracking-[0.2em] uppercase">
          Quantity
        </p>
        <div className="inline-flex items-center border-[3px] border-black rounded-sm overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-3 bg-white hover:bg-[#a3e635] transition-colors border-r-[3px] border-black"
            aria-label="Decrease"
          >
            <Minus size={14} strokeWidth={4} />
          </button>
          <span className="px-8 py-3 font-black text-xl bg-white min-w-[60px] text-center italic">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-3 bg-white hover:bg-[#a3e635] transition-colors border-l-[3px] border-black"
            aria-label="Increase"
          >
            <Plus size={14} strokeWidth={4} />
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button onClick={handleAddToCart} className="btn-primary flex-1 py-4 text-base">
          Add to Cart
        </button>
        <Link
          href="/checkout"
          onClick={() =>
            addItem(
              {
                id: selectedSize,
                productId: productId,
                variantId: currentOption.variantId,
                name: `California Pickle (${currentOption.label})`,
                price: currentOption.price,
                image: "/bottle.webp",
                sizeLabel: currentOption.label,
              },
              quantity
            )
          }
          className="btn-outline flex-1 py-4 text-base text-center"
        >
          Buy Now
        </Link>
      </div>

      {/* Shipping note */}
      <div className="flex flex-wrap items-center gap-6 text-[9px] font-black uppercase tracking-widest text-black/60 mb-10">
        <span className="flex items-center gap-2">
          <Truck size={12} className="text-[#a3e635]" strokeWidth={3} />
          Ships within 24 hours
        </span>
        <span className="flex items-center gap-2">
          <Clock size={12} className="text-[#a3e635]" strokeWidth={3} />
          Relief in &lt;80 seconds
        </span>
      </div>
    </>
  );
}
