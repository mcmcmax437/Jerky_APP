import Link from "next/link";
import { Icon } from "@/components/brand/Icon";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";
import { LogoLockup } from "@/components/brand/LogoLockup";
import { CartLink } from "@/components/cart/CartLink";
import { Container } from "./Container";
import { MobileNav } from "./MobileNav";
import { SiteNav } from "./SiteNav";

export function Header({
  locale,
  dict,
  role,
}: {
  locale: Locale;
  dict: Dictionary;
  role: "CUSTOMER" | "ADMIN" | null;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950 text-text-light">
      <Container className="relative flex h-16 items-center justify-between gap-4 lg:h-[4.75rem]">
        <Link
          href={`/${locale}`}
          aria-label={dict.nav.home}
          className="relative z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
        >
          <LogoLockup compact />
        </Link>
        <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
          <SiteNav locale={locale} dict={dict} />
        </div>
        <div className="relative z-10 flex items-center gap-1 sm:gap-3">
          <div className="hidden lg:block">
            <LanguageSwitcher locale={locale} label={dict.nav.language} />
          </div>
          <span className="hidden h-5 w-px bg-white/15 lg:block" aria-hidden="true" />
          <Link
            href={role === "ADMIN" ? `/${locale}/admin` : `/${locale}/account`}
            aria-label={role === "ADMIN" ? dict.nav.admin : dict.nav.account}
            className="press inline-flex h-11 w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            <Icon name="user" size={18} />
          </Link>
          <CartLink
            locale={locale}
            label={dict.nav.cart}
            addedLabel={dict.product.added}
            title={dict.cart.title}
            emptyLabel={dict.cart.empty}
            quantityLabel={dict.cart.quantity}
            comingSoon={dict.price.comingSoon}
            totalLabel={dict.cart.total}
            viewLabel={dict.cart.view}
            toShopLabel={dict.cart.toShop}
            closeLabel={dict.cart.close}
            removeLabel={dict.cart.remove}
          />
          <MobileNav locale={locale} dict={dict} role={role} />
        </div>
      </Container>
    </header>
  );
}
