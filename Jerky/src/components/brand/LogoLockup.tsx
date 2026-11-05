export function LogoMark({
  className = "h-7 w-7",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M2 6h28v4H2zm4 8h20v4H6zm4 8h12v4H10z" />
    </svg>
  );
}

export function LogoLockup({
  tone = "light",
  compact = false,
}: {
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${tone === "light" ? "text-text-light" : "text-text-dark"}`}>
      <LogoMark className={compact ? "h-4 w-4" : "h-7 w-7"} />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[13px] font-semibold tracking-[0.34em]">JERKY</span>
        {compact ? null : <span className="mt-1 text-[9px] tracking-[0.28em] text-muted">BRAND NAME</span>}
      </span>
    </span>
  );
}
