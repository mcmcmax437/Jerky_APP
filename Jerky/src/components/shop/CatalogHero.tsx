export function CatalogHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-text-light">
      <picture>
        <source media="(min-width: 1600px)" srcSet="/home/hero-jerky-21x9.jpg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/hero-jerky-16x9.jpg" alt="" className="hero-frame w-full object-cover object-[72%_center] md:object-center" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-10">
          <div className="rise max-w-md">
            <p className="flex items-center gap-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">
              {eyebrow}
              <span className="h-px w-12 bg-copper" aria-hidden="true" />
            </p>
            <h1 className="mt-5 font-display text-[64px] leading-[0.95] font-medium md:text-[76px]">{title}</h1>
            {lede ? <p className="mt-5 max-w-sm text-lg leading-relaxed text-text-light/75">{lede}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
