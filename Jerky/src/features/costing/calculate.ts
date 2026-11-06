export type CostLine = {
  amount: number;
  included: boolean;
  direct: boolean;
};

export function yieldPercent(finishedWeightG: number, rawMeatWeightG: number): number | null {
  if (rawMeatWeightG <= 0) return null;
  return (finishedWeightG / rawMeatWeightG) * 100;
}

export function packCount100g(saleableWeightG: number): number {
  if (saleableWeightG <= 0) return 0;
  return Math.floor(saleableWeightG / 100);
}

export function remainderG(saleableWeightG: number): number {
  if (saleableWeightG <= 0) return 0;
  return saleableWeightG % 100;
}

export function sumCosts(lines: CostLine[], mode: "direct" | "extended"): number {
  return lines.reduce((sum, line) => {
    if (!line.included) return sum;
    if (mode === "direct" && !line.direct) return sum;
    return sum + line.amount;
  }, 0);
}

export function costPer100gPack(totalBatchCost: number, packs: number): number | null {
  if (packs <= 0) return null;
  return totalBatchCost / packs;
}

export function lineCost(quantity: number, unitPrice: number | null): number | null {
  if (unitPrice == null) return null;
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice) || quantity < 0 || unitPrice < 0) return null;
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function recipeCost(lines: { quantity: number; unitPrice: number | null }[]) {
  let total = 0;
  let missing = 0;
  for (const line of lines) {
    const cost = lineCost(line.quantity, line.unitPrice);
    if (cost == null) {
      missing += 1;
      continue;
    }
    total += cost;
  }
  return { total: Math.round(total * 100) / 100, missing };
}
