import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { RangeSelect } from "@/components/admin/RangeSelect";
import { listVisitCounts } from "@/features/site/visits";
import { readLocale } from "@/lib/i18n/request";
import { locales } from "@/lib/i18n/locales";

const ranges = [7, 30, 90] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.visitors };
}

export default async function AdminVisitorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const days = ranges.find((item) => String(item) === query.range) ?? 30;
  const counts = await listVisitCounts(days);
  const copy = dict.admin.terminal;

  const total = counts.reduce((sum, item) => sum + item.hits, 0);
  const byPath = new Map<string, number>();
  for (const item of counts) byPath.set(item.path, (byPath.get(item.path) ?? 0) + item.hits);
  const paths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const byLocale = locales.map((item) => ({
    locale: item,
    hits: counts.reduce((sum, entry) => (entry.locale === item ? sum + entry.hits : sum), 0),
  }));

  return (
    <AdminPage title={copy.visitors} lede={copy.visitorsLede}>
      <RangeSelect
        value={String(days)}
        label={copy.ranges["30"]}
        options={ranges.map((item) => ({ value: String(item), label: copy.ranges[String(item) as "7" | "30" | "90"] }))}
      />
      <p className="mt-4 text-sm text-[#f3efe6]">
        {copy.visits}: {total}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-3 text-xs uppercase tracking-[0.14em] text-[#9c9186]">
        {byLocale.map((item) => (
          <span key={item.locale}>
            {item.locale.toUpperCase()} {item.hits}
          </span>
        ))}
      </div>
      {paths.length === 0 ? <p className="mt-4 text-sm text-[#b7aa9d]">{copy.visitorsEmpty}</p> : null}
      {paths.length === 0 ? null : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-[#9c9186]">
              <tr>
                <th className="py-2 pr-4 font-medium">{copy.paths}</th>
                <th className="py-2 font-medium">{copy.visits}</th>
              </tr>
            </thead>
            <tbody className="rise-rows">
              {paths.map(([path, hits]) => (
                <tr key={path} className="border-t border-white/10 align-top">
                  <td className="py-3 pr-4">{path}</td>
                  <td className="py-3 text-right">{hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}
