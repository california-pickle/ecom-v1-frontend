const INGREDIENTS = [
  {
    name: "Vinegar",
    description:
      "The core active ingredient. Acetic acid triggers your nervous system to stop cramps fast.",
    highlight: true,
  },
  {
    name: "Water",
    description:
      "Pure hydration base that helps your body absorb electrolytes efficiently.",
    highlight: false,
  },
  {
    name: "Salt",
    description:
      "High-quality sodium replenishes the primary electrolyte lost in sweat.",
    highlight: false,
  },
  {
    name: "Dill Oil",
    description:
      "Authentic pickle brine flavor. Natural and clean—no artificial flavoring.",
    highlight: false,
  },
  {
    name: "Vitamins C & E",
    description:
      "Antioxidant support to reduce oxidative stress from intense exercise.",
    highlight: false,
  },
  {
    name: "Zinc",
    description:
      "Essential mineral for muscle function, immune support, and recovery.",
    highlight: false,
  },
];

export default function IngredientsSection() {
  return (
    <section
      id="ingredients"
      className="bg-[#f2f2f2] py-16 sm:py-24 lg:py-32 border-y-2 border-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16 lg:mb-20">
          <p className="text-black text-xs font-black tracking-[0.3em] uppercase mb-4">
            What&apos;s Inside
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-black leading-[0.9] tracking-tighter uppercase mb-5 sm:mb-8">
            Clean Ingredients.
            <br />
            <span className="text-[#a3e635] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              Nothing Hidden.
            </span>
          </h2>
          <p className="text-black font-bold text-lg max-w-2xl mx-auto uppercase tracking-tight">
            We print every ingredient on the label. No fillers, no mystery
            compounds. Just what works.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {INGREDIENTS.map((ing) => (
            <div
              key={ing.name}
              className={`rounded-sm p-7 sm:p-10 border-2 transition-all duration-300 ${
                ing.highlight
                  ? "bg-[#a3e635] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:scale-105 z-10"
                  : "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#a3e635] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:scale-105"
              }`}
            >
              <div className="flex flex-col gap-6">
                <div
                  className={`w-12 h-12 rounded-sm border-2 border-black flex items-center justify-center font-black text-xl ${
                    ing.highlight
                      ? "bg-black text-[#a3e635]"
                      : "bg-[#a3e635] text-black"
                  }`}
                >
                  {ing.name[0]}
                </div>
                <div>
                  <h3 className="font-black text-2xl mb-3 uppercase tracking-tighter text-black">
                    {ing.name}
                  </h3>
                  <p className="text-black font-medium text-sm leading-tight uppercase tracking-tight opacity-80">
                    {ing.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications row */}
        <div className="mt-12 sm:mt-20 flex flex-wrap justify-center gap-3 sm:gap-6">
          {[
            "Vegan",
            "Gluten-Free",
            "No Artificial Colors",
            "0g Sugar",
            "Non-GMO",
          ].map((cert) => (
            <div
              key={cert}
              className="flex items-center gap-3 bg-black border border-black rounded-sm px-6 py-3 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]"
            >
              <span className="text-[#a3e635] font-black text-lg">✓</span>
              <span className="text-sm font-black text-white uppercase tracking-widest">
                {cert}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
