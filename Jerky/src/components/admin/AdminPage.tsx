import type { ReactNode } from "react";

export function AdminPage({
  title,
  lede,
  action,
  children,
}: {
  title: string;
  lede?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
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
