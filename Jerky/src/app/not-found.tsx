import Link from "next/link";
import { LogoLockup } from "@/components/brand/LogoLockup";
import { defaultLocale, locales } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/request";

const copy = {
  pl: { title: "Nie ma takiej strony.", back: "Wróć na start" },
  uk: { title: "Такої сторінки немає.", back: "На головну" },
  en: { title: "This page is not here.", back: "Back home" },
} as const;

export default async function NotFound() {
  const { dict } = await readLocale(Promise.resolve({ locale: defaultLocale }));
  const line = copy[defaultLocale];

  return (
    <main className="min-h-screen flex flex-col justify-center bg-ink-950 px-6 text-text-light">
      <div className="flex items-center gap-3 pb-6">
        <LogoLockup compact />
        <span className="text-[10px] font-semibold tracking-[0.22em] text-[#b7a898] uppercase">JERKY</span>
      </div>
      <div className="flex flex-col gap-4 max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">404</p>
        <h1 className="font-display text-[42px] leading-[1.05] font-medium">{line.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href={`/${defaultLocale}`} className="text-sm text-[#e7d3bc] underline">
            {line.back}
          </Link>
          <Link href={`/${defaultLocale}/shop`} className="text-sm text-[#e7d3bc] underline">
            {dict.shop.title}
          </Link>
          <Link href={`/${defaultLocale}/contact`} className="text-sm text-[#e7d3bc] underline">
            {dict.contact.title}
          </Link>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-3">
        {locales.map((item) => (
          <Link key={item} href={`/${item}`} className="text-[13px] font-semibold uppercase tracking-[1.5px] text-[#b7aa9d]">
            {item.toUpperCase()}
          </Link>
        ))}
      </div>
    </main>
  );
}
