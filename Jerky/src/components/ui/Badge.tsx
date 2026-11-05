const tones = {
  bone: "bg-bone",
  teriyaki: "bg-teriyaki",
  chili: "bg-chili",
} as const;

export function Badge({
  accent,
  label,
}: {
  accent: keyof typeof tones;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-light/80">
      <span className={`h-2 w-2 shrink-0 ${tones[accent]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
