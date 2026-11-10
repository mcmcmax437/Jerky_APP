import type { OrderLine } from "@/features/admin/queries";
import type { Dictionary } from "@/lib/i18n/types";

export function OrderLines({ lines, dict }: { lines: OrderLine[]; dict: Dictionary }) {
  const copy = dict.admin.brief;
  const meats = dict.admin.terminal.recipe.meats;
  const units = dict.admin.terminal.recipe.units;

  return (
    <ul className="grid gap-2">
      {lines.map((line) => {
        const detail = [
          line.meat ? `${copy.meat}: ${meats[line.meat]}` : null,
          line.marinade ? `${copy.marinade}: ${line.marinade}` : null,
          `${line.grams} ${units.G} × ${line.quantity}`,
        ].filter(Boolean);
        return (
          <li key={line.id} className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={line.image} alt="" className="h-14 w-12 shrink-0 rounded-lg bg-black/40 object-cover" />
            <div className="min-w-0">
              <p className="font-medium">{line.name}</p>
              <p className="text-[#9c9186]">{detail.join(" · ")}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
