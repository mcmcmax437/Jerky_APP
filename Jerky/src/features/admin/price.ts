export function parsePriceMinor(raw: string): number | null | "invalid" {
  const value = raw.trim().replace(",", ".");
  if (!value) return null;
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value)) return "invalid";
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function formatPriceInput(amountMinor: number | null): string {
  if (amountMinor == null) return "";
  const whole = Math.trunc(amountMinor / 100);
  const fraction = String(Math.abs(amountMinor % 100)).padStart(2, "0");
  return `${whole}.${fraction}`;
}
