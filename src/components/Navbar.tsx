"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "./CartContext";
import logo from "../../public/logo.webp";
const NAV_LINKS = [
  { label: "Home", href: "/#hero" },
  { label: "Benefits", href: "/#benefits" },
  { label: "Ingredients", href: "/#ingredients" },
  { label: "Product", href: "/#product-preview" },
  { label: "Comparison", href: "/#comparison" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("/#")) {
      const sectionId = href.slice(2);
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-1"
            : "bg-white py-4"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24 md:h-32">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <Image
              src={logo}
              alt="The California Pickle Sports Drink"
              width={120}
              height={120}
              className="w-20 h-20 md:w-28 md:h-28 object-contain"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[16px] lg:text-[18px] font-black uppercase tracking-widest text-black hover:text-[#a3e635] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-8">
            <Link
              href="/checkout"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group"
              aria-label="Cart"
            >
              <ShoppingCart
                size={32}
                className="group-hover:scale-110 transition-transform"
              />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#a3e635] text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link
              href="/checkout"
              className="hidden sm:inline-flex items-center bg-black text-white text-[15px] md:text-[16px] font-black uppercase tracking-wider px-10 py-4 rounded-sm hover:bg-[#a3e635] hover:text-black hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Shop Now
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-8 pt-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block py-4 text-base font-black uppercase tracking-widest text-black hover:text-[#a3e635] border-b border-gray-50 last:border-0 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/checkout"
              onClick={() => setMobileOpen(false)}
              className="block w-full mt-6 bg-black text-white text-base font-black uppercase tracking-widest py-4 rounded-sm hover:bg-[#a3e635] hover:text-black transition-all active:scale-95 text-center"
            >
              Shop Now
            </Link>
          </div>
        )}
      </header>

    </>
  );
}
