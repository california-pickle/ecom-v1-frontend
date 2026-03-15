import Image from "next/image";
import { Zap, Brain, Activity } from "lucide-react";

const POINTS = [
  {
    icon: Zap,
    title: "Electrolytes + Acetic Acid",
    body: "Pickle brine contains sodium, potassium, and acetic acid—a powerful combination that replenishes what you lose during intense exercise.",
  },
  {
    icon: Brain,
    title: "Fast Neural Response",
    body: "Acetic acid triggers receptors in your mouth and throat, sending signals to your nervous system that rapidly interrupt the cramp reflex.",
  },
  {
    icon: Activity,
    title: "Relief in Under 80 Seconds",
    body: "Clinical research shows cramp relief can occur in as little as 35 seconds—far faster than any sugar-loaded sports drink.",
  },
];

export default function WhyItWorksSection() {
  return (
    <section
      id="why-it-works"
      className="bg-[#0a0a0a] text-white py-16 sm:py-20 lg:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Image side */}
          <div className="relative flex justify-center">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-[#a3e635]/10 rounded-3xl blur-3xl scale-90" />
            {/* Card container */}
            <div className="relative rounded-3xl border border-[#a3e635]/10 bg-white/5 backdrop-blur-sm overflow-hidden p-6 shadow-[0_0_60px_rgba(163,230,53,0.08)]">
              <Image
                src="/bottleIng.png"
                alt="California Pickle bottle ingredients"
                width={560}
                height={660}
                className="relative z-10 w-[290px] sm:w-[380px] lg:w-[540px] h-auto object-contain drop-shadow-[0_0_50px_rgba(163,230,53,0.35)]"
              />
              {/* Bottom fade blend into section bg */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20" />
            </div>
          </div>

          {/* Text side */}
          <div>
            <p className="text-[#a3e635] text-sm font-bold tracking-widest uppercase mb-4">
              The Science
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5 sm:mb-6">
              Why It Works
              <br />
              <span className="text-[#a3e635]">Differently.</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
              Most sports drinks flood your body with sugar and hope for the
              best. We target the problem at the source—your nervous system.
            </p>

            <div className="space-y-6 sm:space-y-7">
              {POINTS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-[#a3e635]/10 border border-[#a3e635]/30 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-[#a3e635]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 text-sm sm:text-base">
                      {title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
