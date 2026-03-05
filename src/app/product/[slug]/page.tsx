import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductActions from "@/components/ProductActions";
import { PRODUCTS, getProductBySlug } from "@/lib/products";

// ─── ISR — pre-render all slugs at build time, revalidate every 60 seconds ───
export const revalidate = 60;

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

// ─── Dynamic metadata per product ────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle,
    description: product.seoDescription,
  };
}

// ─── Page — Server Component (no "use client") ────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20 sm:pt-32 md:pt-40 bg-white">

        {/* Breadcrumb — pure static HTML */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-black/40">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight size={8} className="text-black" strokeWidth={5} />
            <span className="text-black">{product.name}</span>
          </nav>
        </div>

        {/* Product hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start">

            {/* Sticky product image — static HTML */}
            <div className="lg:sticky lg:top-40">
              <div className="product-image-container !max-w-full bg-[#f2f2f2] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={560}
                  height={560}
                  className="product-image"
                  priority
                />
                <div className="absolute top-4 right-4 bg-[#a3e635] text-black text-[9px] font-black px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-widest uppercase">
                  {product.badge}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="pt-2">
              {/* Static badge + heading — baked into HTML */}
              <div className="mb-4">
                <span className="text-[9px] font-black tracking-[0.3em] uppercase text-black bg-[#a3e635] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {product.tagline}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black leading-[0.8] tracking-tighter mb-4 uppercase">
                {product.name.split(" ").slice(0, -1).join(" ")}
                <br />
                <span className="text-[#a3e635] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {product.name.split(" ").slice(-1)[0]}
                </span>
              </h1>

              <p className="text-black font-black text-[10px] uppercase tracking-widest opacity-40 mb-8 italic">
                Flavor: <span className="text-black opacity-100">{product.flavor}</span>
              </p>

              {/* ── Interactive island: price / size / qty / cart / buy ── */}
              <ProductActions sizeOptions={product.sizeOptions} />

              {/* Key features — static HTML */}
              <div className="border-t-2 border-black pt-8">
                <p className="text-[9px] font-black text-black mb-4 tracking-[0.2em] uppercase">
                  Performance Metrics
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.keyFeatures.map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 bg-[#f2f2f2] border-2 border-black rounded-sm p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <div className="w-8 h-8 bg-[#a3e635] border-2 border-black rounded-sm flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <Icon size={14} className="text-black" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-black text-black text-[11px] uppercase tracking-tight">{label}</p>
                        <p className="text-black font-medium text-[8px] uppercase tracking-widest opacity-60 mt-0.5 leading-tight">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications — 100% static HTML */}
        <section className="bg-[#0a0a0a] py-24 lg:py-32 border-y-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-10 sm:mb-16 text-center uppercase tracking-tighter">
                Technical <span className="text-[#a3e635]">Specs</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.specs.map((spec) => (
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

        {/* How to use — 100% static HTML */}
        <section className="bg-white py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-black text-black mb-10 sm:mb-20 text-center uppercase tracking-tighter">
                How to <span className="text-[#a3e635]">Deploy</span>
              </h2>
              <div className="space-y-8">
                {product.howToUse.map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col sm:flex-row items-start gap-5 sm:gap-8 bg-[#f2f2f2] border-4 border-black rounded-sm p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-[#a3e635] border-4 border-black rounded-sm flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <span className="font-black text-black text-3xl italic">{step.step}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-black text-2xl mb-3 uppercase tracking-tighter italic">
                        {step.title}
                      </h3>
                      <p className="text-black font-medium text-base sm:text-lg leading-tight uppercase tracking-tight opacity-70">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
