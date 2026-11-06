import type { Metadata } from "next";
import { Desk } from "@/components/admin/Desk";
import { RangeSelect } from "@/components/admin/RangeSelect";
import { adminPulse } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";

const ranges = [7, 30, 90] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.overviewTitle };
}

export default async function AdminHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const days = ranges.find((item) => String(item) === query.range) ?? 30;
  const pulse = await adminPulse(days);
  const copy = dict.admin.terminal;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none font-medium">{dict.admin.overviewTitle}</h1>
          <p className="mt-2 text-sm text-[#b7aa9d]">{dict.admin.overviewLede}</p>
        </div>
        <RangeSelect
          value={String(days)}
          label={copy.ranges["30"]}
          options={ranges.map((item) => ({ value: String(item), label: copy.ranges[String(item) as "7" | "30" | "90"] }))}
        />
      </div>
      <div className="mt-6">
        <Desk locale={locale} dict={dict} pulse={pulse} />
      </div>
    </div>
  );
}
