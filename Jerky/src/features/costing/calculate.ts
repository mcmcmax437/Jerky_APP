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
