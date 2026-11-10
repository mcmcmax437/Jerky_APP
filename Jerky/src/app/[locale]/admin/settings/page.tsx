import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { setPanelLocale } from "@/features/admin/settings-actions";
import { getPanelLocale } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";
import { locales } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.settings };
}

export default async function AdminSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const saved = await getPanelLocale();
  const copy = dict.admin.terminal;

  return (
    <AdminPage title={copy.settings} lede={copy.settingsLede}>
      {query.saved ? <p className="text-sm text-emerald-300">{dict.admin.saved}</p> : null}
      <p className="mt-4 text-sm text-[#b7aa9d]">
        {copy.language}: {saved ?? locale}
      </p>
      <div className="mt-6 flex flex-wrap gap-x-3 gap-y-3">
        {locales.map((item) => (
          <form key={item} action={setPanelLocale} className="flex items-center gap-2">
            <input type="hidden" name="locale" value={item} />
            <button
              type="submit"
              className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                item === locale ? "bg-[#e7d3bc] text-[#1a1612]" : "border border-white/15 text-[#b7aa9d]"
              }`}
            >
              {item.toUpperCase()}
            </button>
          </form>
        ))}
      </div>
    </AdminPage>
  );
}
