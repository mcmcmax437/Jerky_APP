"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/locales";

const labels: Record<Locale, string> = {
  pl: "PL",
  uk: "UA",
  en: "EN",
};

const order: Locale[] = ["pl", "en", "uk"];

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(pl|uk|en)(?=\/|$)/, "") || "";

  return (
    <nav aria-label={label} className="flex items-center gap-1 text-[11px] tracking-[0.18em]">
      {order.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={`/${item}${rest}`}
            hrefLang={item === "uk" ? "uk" : item}
            aria-current={active ? "page" : undefined}
            className={`px-1.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
              active
                ? "text-text-light underline decoration-copper underline-offset-4"
                : "text-text-light/45 hover:text-text-light"
            }`}
          >
            {labels[item]}
          </Link>
        );
      })}
    </nav>
  );
}
