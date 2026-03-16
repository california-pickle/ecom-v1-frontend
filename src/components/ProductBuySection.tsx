"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, Truck, Clock } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

interface VariantOption {
  variantId: string;
  value: string;
  label: string;
  price: number;
  sublabel?: string;
  images: string[];
}

interface ProductBuySectionProps {
  productId: string;
  productName: string;
  badge: string;
  variants: VariantOption[];
}

export default function ProductBuySection({ productId, productName, badge, variants }: ProductBuySectionProps) {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("variant");
  const initialVariant = variants.find((v) => v.variantId === preselect)?.value ?? variants[0].value;
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addItem } = useCart();
  const router = useRouter();

  const currentVariant = variants.find((v) => v.value === selectedVariantId)!;
  const activeImages = currentVariant.images;
  const total = currentVariant.price * quantity;

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setActiveImageIndex(0);
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: selectedVariantId,
        productId,
        variantId: currentVariant.variantId,
        name: `California Pickle (${currentVariant.label})`,
        price: currentVariant.price,
        image: currentVariant.images[0] ?? "/bottle.webp",
        sizeLabel: currentVariant.label,
      },
      quantity,
    );
    toast.success(`Added to cart — ${currentVariant.label}`, {
      action: {
        label: "Checkout",
        onClick: () => router.push("/checkout"),
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start">
      {/* Left: sticky image gallery */}
      <div className="lg:sticky lg:top-40">
        {/* Main image */}
        <div className="product-image-container !max-w-full bg-[#FFFFFF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {activeImages[activeImageIndex] ? (
            <Image
              src={activeImages[activeImageIndex]}
              alt={productName}
              width={560}
              height={560}
              className="product-image"
              priority
            />
          ) : (
            <Image src="/bottle.webp" alt={productName} width={560} height={560} className="product-image" priority />
          )}
          <div className="absolute top-4 right-4 bg-[#a3e635] text-black text-[9px] font-black px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-widest uppercase">
            {badge}
          </div>
        </div>

        {/* Thumbnail strip — only show if more than 1 image */}
        {activeImages.length > 1 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {activeImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`w-16 h-16 border-2 rounded-sm overflow-hidden transition-all ${
                  i === activeImageIndex
                    ? "border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "border-black/20 hover:border-black/60"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: price / variant selector / qty / CTA */}
      <div className="pt-2">
        {/* Price */}
        <div className="flex items-baseline gap-4 mb-8">
          <span className="text-4xl sm:text-6xl font-black text-black tracking-tighter italic">${total}</span>
          <span className="text-black/40 font-black text-[10px] uppercase tracking-widest">
            ${currentVariant.price} × {quantity}
          </span>
        </div>

        {/* Size options */}
        <div className="mb-8">
          <p className="text-[9px] font-black text-black mb-3 tracking-[0.2em] uppercase">Select Size</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {variants.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleVariantChange(opt.value)}
                className={`relative border-2 rounded-sm p-3 text-left transition-all duration-200 ${
                  selectedVariantId === opt.value
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
                <p className="font-black text-black text-base tracking-tighter">${opt.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-10">
          <p className="text-[9px] font-black text-black mb-3 tracking-[0.2em] uppercase">Quantity</p>
          <div className="inline-flex items-center border-[3px] border-black rounded-sm overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-3 bg-white hover:bg-[#a3e635] transition-colors border-r-[3px] border-black"
              aria-label="Decrease"
            >
              <Minus size={14} strokeWidth={4} />
            </button>
            <span className="px-8 py-3 font-black text-xl bg-white min-w-[60px] text-center italic">{quantity}</span>
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
                  id: selectedVariantId,
                  productId,
                  variantId: currentVariant.variantId,
                  name: `California Pickle (${currentVariant.label})`,
                  price: currentVariant.price,
                  image: currentVariant.images[0] ?? "/bottle.webp",
                  sizeLabel: currentVariant.label,
                },
                quantity,
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
            Real-time tracked shipping
          </span>
          <span className="flex items-center gap-2">
            <Clock size={12} className="text-[#a3e635]" strokeWidth={3} />
            Relief in &lt;80 seconds
          </span>
        </div>
      </div>
    </div>
  );
}
