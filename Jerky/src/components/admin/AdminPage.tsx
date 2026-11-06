import type { ReactNode } from "react";
import Link from "next/link";

export function AdminPage({
  title,
  lede,
  action,
  back,
  children,
}: {
  title: string;
  lede?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      {back ? (
        <Link href={back.href} className="press mb-4 inline-flex items-center gap-2 text-sm text-[#e7d3bc]">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
            <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none font-medium">{title}</h1>
          {lede ? <p className="mt-2 text-sm text-[#b7aa9d]">{lede}</p> : null}
        </div>
        {action}
      </div>
      {children ? <div className="mt-6 grid gap-4">{children}</div> : null}
    </div>
  );
}
