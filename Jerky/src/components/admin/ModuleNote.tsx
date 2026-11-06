import Link from "next/link";
import { AdminPage } from "./AdminPage";

export function ModuleNote({
  title,
  lede,
  actionHref,
  actionLabel,
}: {
  title: string;
  lede: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <AdminPage
      title={title}
      lede={lede}
      action={
        actionHref && actionLabel ? (
          <Link href={actionHref} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#e7d3bc]">
            {actionLabel}
          </Link>
        ) : null
      }
    />
  );
}
