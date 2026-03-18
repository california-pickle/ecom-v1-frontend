import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { CartProvider } from "@/components/CartContext";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { Toaster } from "sonner";
import Script from "next/script";
import QueryProvider from "@/providers/QueryProvider";
import StaleDeploymentBanner from "@/components/StaleDeploymentBanner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thecaliforniapickle.com"),
  title: {
    default: "The California Pickle | Sports Drink — Stop Cramps in Seconds",
    template: "%s | The California Pickle",
  },
  description:
    "Stop muscle cramps in seconds. Fast-acting electrolyte shot powered by real pickle brine. 0g Sugar. Science-backed cramp relief in under 80 seconds. Vegan, gluten-free.",
  keywords: ["pickle juice", "sports drink", "electrolytes", "cramp relief", "muscle cramps", "hydration", "workout drink"],
  authors: [{ name: "The California Pickle" }],
  creator: "The California Pickle",
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
    type: "website",
    siteName: "The California Pickle",
    title: "The California Pickle — Stop Cramps in Seconds",
    description: "Fast-acting electrolyte shot powered by real pickle brine. 0g Sugar, vegan, science-backed.",
    url: "https://thecaliforniapickle.com",
    images: [
      {
        url: "/bottle.webp",
        width: 1200,
        height: 630,
        alt: "The California Pickle Sports Drink — Pickle Juice Electrolyte Shot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The California Pickle — Stop Cramps in Seconds",
    description: "Fast-acting electrolyte shot powered by real pickle brine. 0g Sugar, science-backed cramp relief.",
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
              <StaleDeploymentBanner />
            </CartProvider>
          </AdminAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
