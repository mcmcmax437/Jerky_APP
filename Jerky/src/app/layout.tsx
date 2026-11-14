import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JERKY",
    template: "%s · JERKY",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
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
      <body className="min-h-screen bg-ivory-100 font-sans text-text-dark antialiased">
        <Script id="lock-page-pinch" strategy="beforeInteractive">
          {`document.addEventListener("gesturestart",function(event){event.preventDefault()},{passive:false});document.addEventListener("gesturechange",function(event){event.preventDefault()},{passive:false});`}
        </Script>
        {children}
      </body>
    </html>
  );
}
