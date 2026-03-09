import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import WhyItWorksSection from "@/components/sections/WhyItWorksSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import IngredientsSection from "@/components/sections/IngredientsSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import ProductPreviewSection from "@/components/sections/ProductPreviewSection";
import SizeSelectionSection from "@/components/sections/SizeSelectionSection";
import Footer from "@/components/Footer";

export const revalidate = 60;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4200/api";

// BackendProduct mirrors the shape returned by GET /products/storefront
export interface BackendVariant {
  _id: string;
  sizeLabel: string;
  subtitle?: string;
  price: number;
  images?: { url: string }[];
  stock?: number;
  stockStatus?: string;
  badge?: string;
}

export interface BackendProduct {
  _id: string;
  name: string;
  description?: string;
  flavor?: string;
  slug?: string;
  variants: BackendVariant[];
}

async function fetchActiveProduct(): Promise<BackendProduct | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/products/storefront`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Storefront endpoint may return an array or a single object
    if (Array.isArray(data)) {
      return data[0] ?? null;
    }
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const product = await fetchActiveProduct();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection productSlug={product?.slug ?? "california-pickle"} />
        <WhyItWorksSection />
        <SizeSelectionSection product={product} />
        <BenefitsSection />
        <IngredientsSection />
        <ComparisonSection />
        <ProductPreviewSection product={product} />
      </main>
      <Footer />
    </>
  );
}
