"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Package } from "lucide-react";
import { useCart } from "./CartContext";
import BulkOrderModal from "./BulkOrderModal";
import logo from "../../public/logo.webp";

const NAVBAR_OFFSET = 97;

const NAV_LINKS = [
  { label: "Home", href: "/#hero" },
  { label: "Benefits", href: "/#benefits" },
  { label: "Ingredients", href: "/#ingredients" },
  { label: "Products", href: "/#sizes" },
  { label: "Comparison", href: "/#comparison" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = useCallback((id: string, smooth = true) => {
    const el = document.getElementById(id);
    console.log(el?.id);
    if (el) {
      const top =
        el.getBoundingClientRect().top + window.scrollY - (el?.id === "hero" ? NAVBAR_OFFSET : -(NAVBAR_OFFSET / 5));
      window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
    }
  }, []);

  // Handle hash-based scrolling when arriving from another page
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && pathname === "/") {
      // Small delay to let the page render before scrolling
      const timer = setTimeout(() => scrollToSection(hash, false), 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, scrollToSection]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const sectionId = href.slice(2);
      if (pathname === "/") {
        e.preventDefault();
        scrollToSection(sectionId);
      }
      // When on another page, the default Link behavior navigates to /#section-id,
      // then the browser handles the hash scroll on page load.
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          mobileOpen
            ? "bg-white/90 backdrop-blur-xl border-b border-black/10 shadow-sm"
            : scrolled
              ? "bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-sm"
              : pathname === "/"
                ? "backdrop-blur-md"
                : "bg-white shadow-sm"
        }`}
        style={
          !mobileOpen && !scrolled && pathname === "/"
            ? {
                background:
                  "linear-gradient(to right, rgba(245,249,220,0.55) 0%, rgba(238,235,137,0.5) 33%, rgba(247,229,95,01) 66%, rgba(248,217,81,01) 100%)",
              }
            : undefined
        }
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
            <Image
              src={logo}
              alt="The California Pickle Sports Drink"
              width={120}
              height={120}
              className="w-16 h-16 md:w-24 md:h-24 object-contain"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[14px] lg:text-[16px] font-black uppercase tracking-widest text-black hover:text-[#65a30d] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Cart icon */}
            <Link
              href="/checkout"
              className="relative p-2 rounded-sm hover:bg-black/10 transition-colors group"
              aria-label="Cart"
            >
              <ShoppingCart size={28} className="text-black group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-[#a3e635] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Bulk Order CTA */}
            <button
              onClick={() => setBulkOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 bg-black text-[#a3e635] text-[13px] md:text-[14px] font-black uppercase tracking-wider px-5 py-3 border-2 border-black hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]"
            >
              <Package size={15} strokeWidth={3} />
              Bulk Order
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-sm hover:bg-black/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={28} className="text-black" /> : <Menu size={28} className="text-black" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-black/10 px-4 pb-6 pt-3 space-y-1 shadow-lg animate-in slide-in-from-top duration-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block py-3 text-sm font-black uppercase tracking-widest text-black hover:text-[#65a30d] border-b border-black/5 last:border-0 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                setBulkOpen(true);
              }}
              className="block w-full mt-3 bg-black text-[#a3e635] text-sm font-black uppercase tracking-widest py-3.5 hover:bg-white hover:text-black transition-all active:scale-95 text-center border-2 border-black"
            >
              Bulk Order
            </button>
          </div>
        )}
      </header>

      <BulkOrderModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </>
  );
}
