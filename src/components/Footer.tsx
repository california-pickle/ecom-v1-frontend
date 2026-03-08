import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.webp";
export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t-8 border-[#a3e635]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <div className="mb-10 text-center">
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

          <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-12 border-t border-white/5 gap-8">
            <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} The California Pickle. Performance
              Protocol.
            </p>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
