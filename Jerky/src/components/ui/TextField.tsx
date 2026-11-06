export function TextField({
  id,
  label,
  type = "text",
  multiline = false,
  placeholder,
}: {
  id: string;
  label: string;
  type?: "text" | "email";
  multiline?: boolean;
  placeholder?: string;
}) {
  const className =
    "mt-2 w-full border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base text-text-dark outline-none placeholder:text-text-dark/40 focus-visible:border-ink-800";

  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.16em] text-text-dark">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} name={id} rows={5} placeholder={placeholder} className={className} />
      ) : (
        <input id={id} name={id} type={type} placeholder={placeholder} className={className} />
      )}
    </div>
  );
}
