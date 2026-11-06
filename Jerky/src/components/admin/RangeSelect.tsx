"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/brand/Icon";

export function RangeSelect({
  value,
  label,
  options,
}: {
  value: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161412] px-3 py-2 text-sm text-[#d9cfc4]">
      <Icon name="calendar-03" size={15} />
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => router.push(`?range=${event.target.value}`)}
        className="bg-transparent outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#161412]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
