import { packSizes, type PackSize } from "@/features/cart/quote";

const mark: Record<PackSize, number> = { S: 12, M: 14, L: 16, XL: 18 };

export function SizeMark({ size }: { size: PackSize }) {
  const box = mark[size];
  return (
    <svg viewBox="0 0 16 16" width={box} height={box} aria-hidden="true">
      <path d="M3.2 5.4 8 3.2l4.8 2.2v6.2L8 13.8 3.2 11.6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.2 5.4 8 7.6l4.8-2.2M8 7.6v6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function PackSizeButton({
  size,
  pressed,
  onClick,
  tone,
}: {
  size: PackSize;
  pressed: boolean;
  onClick: () => void;
  tone: "light" | "dark";
}) {
  const active = pressed
    ? tone === "light"
      ? "border-[#c4a574] bg-[#c4a574] text-[#1b1714]"
      : "border-ink-950 bg-ink-950 text-ivory-100"
    : tone === "light"
      ? "border-white/20 text-[#f6f1ea] hover:border-white/50"
      : "border-ink-800/15 text-text-dark hover:border-ink-800/40";
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={size}
      onClick={onClick}
      className={`press flex h-11 w-11 flex-col items-center justify-center rounded-xl border ${active}`}
    >
      <SizeMark size={size} />
      <span className="mt-0.5 text-[9px] font-semibold leading-none tracking-wide">{size}</span>
    </button>
  );
}

export function PackSizePicker({
  value,
  onChange,
  label,
  tone,
  choices = packSizes,
}: {
  value: PackSize;
  onChange: (size: PackSize) => void;
  label: string;
  tone: "light" | "dark";
  choices?: readonly PackSize[];
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {choices.map((size) => (
        <PackSizeButton key={size} size={size} pressed={value === size} tone={tone} onClick={() => onChange(size)} />
      ))}
    </div>
  );
}
