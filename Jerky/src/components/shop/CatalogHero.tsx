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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/home/hero-jerky.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[68%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/15" />
      <div className="relative mx-auto flex min-h-[440px] max-w-6xl items-center px-5 py-14 md:px-10">
        <div className="rise max-w-md">
          <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
            {eyebrow}
            <span className="h-px w-12 bg-copper" aria-hidden="true" />
          </p>
          <h1 className="mt-5 font-display text-6xl leading-[0.92] font-medium md:text-7xl">{title}</h1>
          {lede ? <p className="mt-5 max-w-sm text-base leading-relaxed text-text-light/75">{lede}</p> : null}
        </div>
      </div>
    </section>
  );
}
