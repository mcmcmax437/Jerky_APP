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
    <section className="bg-ink-950 text-text-light">
      <div className="mx-auto grid max-w-6xl lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="flex items-center px-5 py-12 md:px-10 lg:py-14">
          <div className="rise max-w-md">
            <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
              {eyebrow}
              <span className="h-px w-12 bg-copper" aria-hidden="true" />
            </p>
            <h1 className="mt-5 font-display text-6xl leading-[0.92] font-medium md:text-7xl">{title}</h1>
            {lede ? <p className="mt-5 max-w-sm text-base leading-relaxed text-text-light/75">{lede}</p> : null}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home/hero-jerky.jpg"
          alt=""
          className="aspect-[16/10] w-full object-cover object-[72%_center] lg:aspect-auto lg:h-full lg:max-h-[420px]"
        />
      </div>
    </section>
  );
}
