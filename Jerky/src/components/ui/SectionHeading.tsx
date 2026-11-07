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
        <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">{eyebrow}</p>
      ) : null}
      <h2 className={`mt-3 font-display text-[42px] leading-[1.05] font-medium md:text-[48px] ${titleColor}`}>
        {title}
      </h2>
      {lede ? <p className={`mt-5 max-w-xl text-lg leading-relaxed ${ledeColor}`}>{lede}</p> : null}
    </div>
  );
}
