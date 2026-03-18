import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.webp";

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t-8 border-[#a3e635]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <div className="mb-3 sm:mb-10 text-center">
            <Image
              src={logo}
              alt="The California Pickle"
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto filter brightness-110 mb-8"
            />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-none uppercase tracking-tighter italic max-w-3xl mx-auto">
              Performance <span className="text-[#a3e635]">Engineering.</span>{" "}
              <br /> Built for Athletes.
            </h2>
          </div>

          {/* Address */}
          <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-3">
            The California Pickle LLC &nbsp;·&nbsp; 1999 Harrison Street Suite 1800 &nbsp;·&nbsp; Oakland CA 94612
          </p>
          <a
            href="mailto:support@thecaliforniapickle.com"
            className="text-white/40 hover:text-[#a3e635] text-xs font-black uppercase tracking-widest mb-8 transition-colors"
          >
            support@thecaliforniapickle.com
          </a>

          {/* Social Icons */}
          <div className="flex items-center gap-6 sm:mb-12">
            <a
              href="https://www.facebook.com/share/1At5j9AjcE/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white/30 hover:text-[#a3e635] transition-colors"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.instagram.com/thecaliforniapickle?igsh=MTBqcXBvd2k1ZXRvcg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/30 hover:text-[#a3e635] transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.tiktok.com/@thecaliforniapick5?_r=1&_t=ZP-94k4ch2cZdH"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-white/30 hover:text-[#a3e635] transition-colors"
            >
              <TikTokIcon />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-12 border-t border-white/5 gap-3 sm:gap-8">
            <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} The California Pickle. Performance
              Protocol.
            </p>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
