import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { getLang } from "@/lib/lang";
import "./globals.css";

const serif = Cormorant({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["300", "400", "500", "600"], variable: "--font-serif", display: "swap" });
const sans = Montserrat({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "MOYA BAKU",
  description: "MOYA BAKU — Bakı / Баку. @moya.baku",
  openGraph: { title: "MOYA BAKU", description: "@moya.baku · Bakı", type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0A0A0A" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
