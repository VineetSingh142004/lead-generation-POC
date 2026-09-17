import type { Metadata } from "next";
import { DM_Mono, Manrope, Playfair_Display } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

/**
 * Self-hosted via next/font (audit finding #11). The stylesheet previously pulled three
 * families with an @import, which blocks rendering and is serialised behind the CSS —
 * the worst-case path for LCP on a page whose whole job is conversion.
 */
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: site.metaTitle,
  description: site.metaDescription,
  openGraph: { title: site.metaTitle, description: site.metaDescription, type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
