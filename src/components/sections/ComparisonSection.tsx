import { X, Check } from "lucide-react";

const OTHER_BRANDS = [
  "High sugar content",
  "Slow recovery time",
  "Artificial ingredients",
  "Bloating side effects",
  "Weak electrolyte profile",
];

const OUR_PRODUCT = [
  "0g Sugar",
  "Fast hydration in seconds",
  "Real pickle brine",
  "Clean gut support",
  "High-density electrolytes",
];

export default function ComparisonSection() {
  return (
    <section id="comparison" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-black text-xs font-black tracking-[0.3em] uppercase mb-4">
            How We Compare
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-black leading-[0.9] tracking-tighter uppercase mb-4">
            Not All Sports Drinks
            <br />
            <span className="text-[#a3e635] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Are Equal.</span>
          </h2>
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 max-w-4xl mx-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          {/* Other brands */}
          <div className="bg-[#f2f2f2] p-7 sm:p-10 border-b-4 sm:border-b-0 sm:border-r-4 border-black">
            <div className="mb-10">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-black/40 mb-2">
                The Competition
              </p>
              <h3 className="text-3xl font-black text-black uppercase tracking-tighter italic">Other Brands</h3>
            </div>
            <ul className="space-y-6">
              {OTHER_BRANDS.map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center flex-shrink-0">
                    <X size={16} className="text-white" strokeWidth={4} />
                  </div>
                  <span className="text-black font-bold text-sm uppercase tracking-tight opacity-40 line-through decoration-black decoration-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Our product */}
          <div className="bg-[#a3e635] p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-black text-[#a3e635] text-[10px] font-black px-4 py-1 uppercase tracking-widest -rotate-0 shadow-lg">
              The Winner
            </div>
            <div className="mb-10">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-black mb-2">
                California Pickle
              </p>
              <h3 className="text-3xl font-black text-black uppercase tracking-tighter italic">Our Formula</h3>
            </div>
            <ul className="space-y-6">
              {OUR_PRODUCT.map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center flex-shrink-0">
                    <Check size={16} className="text-[#a3e635]" strokeWidth={4} />
                  </div>
                  <span className="text-black font-black text-sm uppercase tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
