"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap, Leaf, FlaskConical, Star } from "lucide-react";
import hero from "../../../public/hero.jpg";
import mobilehero from "../../../public/mobilehero.jpg";

const TICKER_ITEMS = [
  "HIGH ELECTROLYTES",
  "VEGAN & GLUTEN-FREE",
  "NATURAL FORMULA",
  "FAST HYDRATION",
  "PERFORMANCE DRIVEN",
  "STOP CRAMPS FAST",
  "0G SUGAR",
  "REAL PICKLE BRINE",
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   DESKTOP HERO  (lg+)
   Cinematic full-width background. White-fade overlay on left half.
───────────────────────────────────────────────────────────────────────────── */
function DesktopHero({ productSlug }: { productSlug: string }) {
  return (
    <div className="hidden lg:flex relative h-[calc(100vh-5rem)] items-center">
      <Image
        src={hero}
        alt="The California Pickle Sports Drink"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        quality={90}
      />
      {/* Left-fade gradient for text readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.64) 36%, rgba(255,255,255,0.10) 56%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 xl:px-12 py-24">
        <div className="max-w-[520px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#a3e635] border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="font-black text-black uppercase tracking-widest text-[10px]">
              #1 Performance Pickle Juice
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-black leading-[0.85] tracking-tighter mb-8 uppercase">
            Stop&nbsp;Muscle
            <br />
            <span className="text-[#a3e635] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Cramps</span>
            <br />
            <span className="whitespace-nowrap">in Seconds</span>
          </h1>

          <p className="text-sm text-black font-medium max-w-md leading-tight mb-8 uppercase tracking-tight">
            Fast-acting electrolyte shot powered by real pickle brine. Science-backed cramp relief that works in under
            80 seconds.
          </p>

          <div className="flex gap-4 mb-12">
            <Link href={`/product/${productSlug}`} className="btn-primary text-center min-w-[200px]">
              Buy Now
            </Link>
            <button onClick={() => scrollTo("why-it-works")} className="btn-outline min-w-[200px]">
              Learn More
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6">
            {[
              { icon: FlaskConical, label: "0g Sugar" },
              { icon: Zap, label: "Fast Relief" },
              { icon: Leaf, label: "Natural" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="bg-[#a3e635] rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2">
                  <Icon size={14} className="text-black" />
                </div>
                <span className="text-xs font-black text-black uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE + TABLET HERO  (below lg)

   Full-screen hero-mobile.jpg as background.
   Palette pulled from the image:
     - Background: lime-green → golden-yellow gradient
     - Text: white (#ffffff)
     - Accent / highlights: #e8f55a (bright lime from image foreground)
     - CTA primary bg: white, text: #1a2f00 (deep olive from bottle label)
     - CTA secondary border: white, text: white

   No product image rendered — bottle is already in the background image.
   No navbar — floating cart icon only at top-right.
───────────────────────────────────────────────────────────────────────────── */
function MobileHero({ productSlug }: { productSlug: string }) {
  return (
    <div className="lg:hidden relative h-[calc(100svh-5rem)] flex flex-col">
      {/* ── Background image — full viewport, portrait ── */}
      <Image
        src={mobilehero}
        alt="The California Pickle Sports Drink"
        fill
        priority
        sizes="(max-width: 1024px) 100vw"
        className="object-cover object-center"
        quality={88}
      />

      {/* ── Dark bottom scrim so text pops over the lighter yellow bottom ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to top, rgba(20,40,0,0.72) 0%, rgba(20,40,0,0.38) 42%, rgba(0,0,0,0.08) 68%, transparent 100%)",
        }}
      />

      {/* Spacer for navbar + pushes content to bottom */}
      <div className="flex-1 min-h-[100px]" />

      {/* ── Content overlay — anchored to bottom ── */}
      <div className="relative z-10 px-5 sm:px-7 md:px-10 pb-8 sm:pb-10 md:pb-14">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-5 sm:mb-6">
          <div className="flex items-center gap-1.5 bg-[#e8f55a]/20 border border-[#e8f55a]/60 backdrop-blur-sm rounded-sm px-3 py-1.5">
            <Star size={10} fill="#e8f55a" className="text-[#e8f55a]" />
            <span className="font-black text-[#e8f55a] uppercase tracking-widest text-[10px] sm:text-xs">
              #1 Performance Pickle Juice
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-[2.6rem] sm:text-5xl md:text-6xl font-black text-white leading-[0.88] tracking-tighter mb-4 sm:mb-5 uppercase"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.35)" }}
        >
          Stop Muscle
          <br />
          <span className="text-[#e8f55a]">Cramps</span>
          <br />
          in Seconds.
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-white/85 font-medium leading-snug mb-6 sm:mb-8 uppercase tracking-tight max-w-sm">
          Fast-acting electrolyte shot. Real pickle brine. Works in under 80&nbsp;seconds.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
          {/* Primary — white bg, deep olive text, matches bottle label dark green */}
          <Link
            href={`/product/${productSlug}`}
            className="inline-flex items-center justify-center bg-white text-[#1a3300] font-black uppercase tracking-widest px-7 py-4 border-2 border-white hover:bg-[#e8f55a] hover:text-[#1a3300] transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none text-sm sm:min-w-[180px]"
          >
            Buy Now
          </Link>
          {/* Secondary — white outline */}
          <button
            onClick={() => scrollTo("why-it-works")}
            className="inline-flex items-center justify-center border-2 border-white/80 bg-white/10 backdrop-blur-sm text-white font-black uppercase tracking-widest px-7 py-4 hover:bg-white hover:text-[#1a3300] transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none text-sm sm:min-w-[180px]"
          >
            Learn More
          </button>
        </div>

        {/* Trust badges — white icons + labels */}
        <div className="flex flex-wrap gap-5 sm:gap-7">
          {[
            { icon: FlaskConical, label: "0g Sugar" },
            { icon: Zap, label: "Fast Relief" },
            { icon: Leaf, label: "Natural" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="bg-white/15 border border-white/40 rounded-sm p-1.5 backdrop-blur-sm">
                <Icon size={13} className="text-white" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function HeroSection({ productSlug = "california-pickle" }: { productSlug?: string }) {
  return (
    <section id="hero" className="relative overflow-hidden flex flex-col">
      <DesktopHero productSlug={productSlug} />
      <MobileHero productSlug={productSlug} />
      {/* Ticker — first thing visible after scrolling past hero */}
      <div className="w-full bg-black text-white overflow-hidden py-3.5 border-t-2 border-white/10">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-8 text-xs font-black tracking-[0.2em] uppercase whitespace-nowrap"
            >
              <span className="text-[#a3e635] text-base leading-none">★</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
