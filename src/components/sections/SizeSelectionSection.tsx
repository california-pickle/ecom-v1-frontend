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
    <section id="sizes" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8 items-start">
          {sizes.map((size) => (
            <div
              key={size.id}
              className={`relative flex flex-col border-4 border-black rounded-sm p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 ${
                size.popular
                  ? "bg-[#a3e635] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:scale-105 z-10"
                  : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
              }`}
            >
              {size.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-[#a3e635] text-[10px] font-black px-6 py-2 uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex-1">
                <div className="product-image-container !max-w-[200px] mb-8">
                  <Image
                    src={size.image}
                    alt={size.name}
                    width={200}
                    height={200}
                    className="product-image"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-3xl font-black text-black uppercase tracking-tighter italic">
                      {size.name}
                    </h3>
                    <span className="text-xs font-black text-black/40 uppercase tracking-widest mb-1">
                      {size.quantity}
                    </span>
                  </div>
                  <p className="text-black font-bold text-sm uppercase tracking-tight opacity-70 mb-4">
                    {size.description}
                  </p>
                  <div className="text-4xl font-black text-black tracking-tighter">
                    ${size.price}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={() =>
                    addItem({
                      id: size.id,
                      productId: productId,
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
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
