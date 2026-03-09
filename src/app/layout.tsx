import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { CartProvider } from "@/components/CartContext";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { Toaster } from "sonner";
import Script from "next/script";
import QueryProvider from "@/providers/QueryProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The California Pickle | Sports Drink",
  description:
    "Stop muscle cramps in seconds. Fast-acting electrolyte shot powered by real pickle brine. 0g Sugar. Natural ingredients.",
  // Comprehensive Icon Setup
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "The California Pickle Sports Drink",
    description: "Fast-acting electrolyte shot powered by real pickle brine.",
    images: ["/bottle.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased font-sans`}>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="4ef024bb-072e-480b-91d4-ef3902131183"
        />
        <QueryProvider>
          <AdminAuthProvider>
            <CartProvider>
              {children}
              <Toaster position="top-right" richColors />
              <VisualEditsMessenger />
            </CartProvider>
          </AdminAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
