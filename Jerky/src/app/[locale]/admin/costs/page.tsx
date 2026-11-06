import type { Metadata } from "next";
import { ModuleNote } from "@/components/admin/ModuleNote";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.costs };
}

export default async function AdminCostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { dict } = await readLocale(params);
  return <ModuleNote title={dict.admin.terminal.costs} lede={dict.admin.terminal.moduleEmpty} />;
}
