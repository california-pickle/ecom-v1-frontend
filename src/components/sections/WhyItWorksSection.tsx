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
    <section id="why-it-works" className="bg-[#0a0a0a] text-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Image side */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-[#a3e635]/10 rounded-3xl blur-3xl" />
            <div className="relative z-10 border-2 border-[#a3e635]/40 rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(163,230,53,0.2)] p-5 bg-white/5 w-full">
              <Image
                src="/bottleIng.png"
                alt="California Pickle bottle"
                width={700}
                height={840}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col justify-center">
            <p className="text-[#a3e635] text-xs font-black tracking-[0.25em] uppercase mb-4">The Science</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tighter mb-4 sm:mb-6 uppercase">
              Why It Works
              <br />
              <span className="text-[#a3e635]">Differently.</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              Most sports drinks flood your body with sugar and hope for the best. We target the problem at the source—your nervous system.
            </p>

            <div className="space-y-5">
              {POINTS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/3 hover:border-[#a3e635]/20 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#a3e635]/10 border border-[#a3e635]/30 rounded-lg flex items-center justify-center">
                    <Icon size={17} className="text-[#a3e635]" />
                  </div>
                  <div>
                    <h3 className="font-black text-white mb-1 text-sm uppercase tracking-wide">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
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
