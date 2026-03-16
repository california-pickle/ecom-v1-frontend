import { Zap, Droplets, Battery, Leaf } from "lucide-react";

const BENEFITS = [
  {
    icon: Zap,
    title: "Instant Cramp Relief",
    body: "Targets the neural reflex that causes cramps. Feel relief in under 80 seconds—not minutes.",
    accent: "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    iconColor: "text-black",
    iconBg: "bg-[#a3e635]",
  },
  {
    icon: Droplets,
    title: "Hydration Boost",
    body: "High sodium content replenishes electrolytes lost through sweat, restoring proper hydration fast.",
    accent: "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    iconColor: "text-black",
    iconBg: "bg-[#a3e635]",
  },
  {
    icon: Battery,
    title: "High Electrolytes",
    body: "Dense concentration of sodium and potassium—more per ounce than traditional sports drinks.",
    accent: "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    iconColor: "text-black",
    iconBg: "bg-[#a3e635]",
  },
  {
    icon: Leaf,
    title: "Natural Formula",
    body: "Real ingredients. No artificial colors, no synthetic additives. Just what your body actually needs.",
    accent: "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    iconColor: "text-black",
    iconBg: "bg-[#a3e635]",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="bg-white py-7 sm:py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-black text-xs font-black tracking-[0.3em] uppercase mb-4">
            Performance Benefits
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-black leading-[0.9] tracking-tighter uppercase">
            Built for Performance.
            <br />
            <span className="text-[#a3e635] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              Not Marketing.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {BENEFITS.map(
            ({ icon: Icon, title, body, accent, iconColor, iconBg }) => (
              <div
                key={title}
                className={`border-2 rounded-sm p-6 sm:p-8 ${accent} flex flex-col gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] hover:border-[#a3e635]`}
              >
                <div
                  className={`w-14 h-14 rounded-sm border-2 border-black flex items-center justify-center ${iconBg} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  <Icon size={24} className={iconColor} />
                </div>
                <div>
                  <h3 className="font-black text-black text-xl mb-3 uppercase tracking-tight">
                    {title}
                  </h3>
                  <p className="text-black font-medium text-sm leading-tight uppercase tracking-tight opacity-80">
                    {body}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
