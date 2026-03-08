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
            <div className="absolute inset-0 bg-[#a3e635]/10 rounded-3xl blur-2xl" />
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/4ef024bb-072e-480b-91d4-ef3902131183/Gemini_Generated_Image_nd4zttnd4zttnd4z_upscayl_2x_digital-art-4x-resized-1772356018290.webp?width=8000&height=8000&resize=contain"
              alt="California Pickle bottle"
              width={380}
              height={460}
              className="relative z-10 w-[200px] sm:w-[280px] lg:w-[420px] h-auto object-contain drop-shadow-[0_0_40px_rgba(163,230,53,0.3)]"
            />
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
