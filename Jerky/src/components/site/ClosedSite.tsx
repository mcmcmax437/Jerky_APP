import Link from "next/link";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export function ClosedSite({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <main id="content" className="grid min-h-screen place-items-center bg-ink-950 px-6 text-text-light">
      <div className="w-full max-w-lg">
        <LanguageSwitcher locale={locale} label={dict.nav.language} />
        <h1 className="mt-8 font-display text-[42px] leading-[1.05] font-medium md:text-[48px]">{dict.closed.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-text-light/75">{dict.closed.body}</p>
        <Link href={`/${locale}/login`} className="mt-8 inline-block text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">
          {dict.closed.login}
        </Link>
      </div>
    </main>
  );
}
