import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epoxy Atelier | Premium Flooring",
  description: "Professional epoxy flooring for spaces worth looking after.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" /></body></html>;
}
