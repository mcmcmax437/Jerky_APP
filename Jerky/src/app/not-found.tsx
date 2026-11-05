import Link from "next/link";

const copy = {
  pl: { title: "Nie ma takiej strony.", back: "Wróć na start" },
  uk: { title: "Такої сторінки немає.", back: "На головну" },
  en: { title: "This page is not here.", back: "Back home" },
} as const;

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-ink-950 px-6 text-text-light">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">404</p>
      <ul className="mt-6 grid max-w-xl gap-4">
        {(Object.keys(copy) as Array<keyof typeof copy>).map((locale) => (
          <li key={locale}>
            <p className="font-display text-4xl">{copy[locale].title}</p>
            <Link href={`/${locale}`} className="mt-2 inline-block text-sm uppercase tracking-[0.16em] text-ivory-200">
              {copy[locale].back}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
