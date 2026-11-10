import Link from "next/link";
import { Icon } from "@/components/brand/Icon";

/** Round help button that floats over shop and product pages. */
export function ChatFab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#c4a574] px-4 py-3 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#2a241f] hover:bg-[#d8b98d]"
    >
      <Icon name="message-01" size={18} />
      {label}
    </Link>
  );
}
