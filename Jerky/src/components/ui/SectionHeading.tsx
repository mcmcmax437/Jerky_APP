export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  tone?: "light" | "dark";
}) {
  const titleColor = tone === "dark" ? "text-text-light" : "text-text-dark";
  const ledeColor = tone === "dark" ? "text-text-light/75" : "text-text-dark/80";

  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">{eyebrow}</p>
      ) : null}
      <h2 className={`mt-3 font-display text-4xl leading-[0.95] font-medium md:text-6xl ${titleColor}`}>
        {title}
      </h2>
      {lede ? <p className={`mt-5 max-w-xl text-base leading-relaxed ${ledeColor}`}>{lede}</p> : null}
    </div>
  );
}
