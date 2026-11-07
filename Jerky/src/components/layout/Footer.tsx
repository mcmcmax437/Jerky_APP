import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";
import { LogoMark } from "@/components/brand/LogoLockup";
import { Container } from "./Container";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t border-white/10 bg-ink-950 text-text-light">
      <Container className="flex flex-col items-center gap-5 py-8">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <LogoMark className="h-4 w-4" />
          <span className="hidden h-px w-10 bg-copper sm:block" aria-hidden="true" />
          <p className="text-center text-[13px] font-semibold uppercase tracking-[1.5px]">{dict.footer.tagline}</p>
        </div>
        <nav aria-label={dict.footer.privacy} className="flex gap-6 text-[13px] uppercase tracking-[1.5px] text-muted">
          <Link href={`/${locale}/privacy`} className="hover:text-text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper">
            {dict.footer.privacy}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper">
            {dict.footer.terms}
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
