import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import WhyItWorksSection from "@/components/sections/WhyItWorksSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import IngredientsSection from "@/components/sections/IngredientsSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import ProductPreviewSection from "@/components/sections/ProductPreviewSection";
import SizeSelectionSection from "@/components/sections/SizeSelectionSection";
import Footer from "@/components/Footer";

export const revalidate = false;

export default function HomePage() {
  return (
    <>
      {/* Navbar visible on desktop only — mobile hero has its own floating bar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <main className="lg:pt-40">
        <HeroSection />
        <WhyItWorksSection />
        <SizeSelectionSection />
        <BenefitsSection />
        <IngredientsSection />
        <ComparisonSection />
        <ProductPreviewSection />
      </main>
      <Footer />
    </>
  );
}
