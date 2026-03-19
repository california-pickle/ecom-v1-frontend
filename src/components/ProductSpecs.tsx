"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Spec {
  label: string;
  value: string;
}

interface Variant {
  variantId: string;
  label: string;
}

interface ProductSpecsProps {
  specs: Spec[];
  variants: Variant[];
}

function getVariantSpecs(specs: Spec[], variant: Variant): Spec[] {
  const labelLower = variant.label.toLowerCase();
  return specs.map((spec) => {
    if (spec.label === "Volume") {
      if (labelLower.includes("half gallon")) return { ...spec, value: "64 fl oz" };
      if (labelLower.includes("1 gallon") || labelLower.includes("gallon")) return { ...spec, value: "128 fl oz" };
      return spec;
    }
    if (spec.label === "Pack Size") {
      if (labelLower.includes("half gallon") || labelLower.includes("gallon")) return { ...spec, value: "1" };
      return spec;
    }
    return spec;
  });
}

function ProductSpecsInner({ specs, variants }: ProductSpecsProps) {
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variant");
  const selected = variants.find((v) => v.variantId === variantId) ?? variants[0];
  const dynamicSpecs = getVariantSpecs(specs, selected);

  return (
    <section className="bg-[#0a0a0a] py-24 lg:py-32 border-y-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-10 sm:mb-16 text-center uppercase tracking-tighter">
            Technical <span className="text-[#a3e635]">Specs</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dynamicSpecs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between bg-white/5 border-2 border-white/10 hover:border-[#a3e635] rounded-sm px-8 py-6 transition-colors group"
              >
                <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                  {spec.label}
                </span>
                <span className="text-sm font-black text-[#a3e635] uppercase tracking-widest italic">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductSpecs(props: ProductSpecsProps) {
  return (
    <Suspense fallback={null}>
      <ProductSpecsInner {...props} />
    </Suspense>
  );
}
