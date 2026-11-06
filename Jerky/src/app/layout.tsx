import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JERKY",
    template: "%s · JERKY",
  },
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#101010",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const locale = headerList.get("x-locale") ?? "pl";

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="stylesheet" href="https://use.hugeicons.com/font/icons.css" />
      </head>
      <body className="min-h-screen bg-ivory-100 font-sans text-text-dark antialiased">{children}</body>
    </html>
  );
}
