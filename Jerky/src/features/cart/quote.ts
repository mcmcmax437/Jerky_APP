export const MAX_QUANTITY = 20;

export type CartLine = {
  slug: string;
  quantity: number;
};

export type QuoteProduct = {
  id: string;
  slug: string;
  name: string;
  netWeightG: number;
  priceMinor: number | null;
  currency: string;
  image: string | null;
};

export type QuoteLine = {
  productId: string;
  slug: string;
  name: string;
  netWeightG: number;
  quantity: number;
  unitPriceMinor: number | null;
  lineTotalMinor: number | null;
  currency: string;
  image: string | null;
};

export type Quote = {
  lines: QuoteLine[];
  subtotalMinor: number | null;
  totalMinor: number | null;
  currency: "PLN";
  pricePending: boolean;
};

export function buildQuote(requests: CartLine[], products: QuoteProduct[]): Quote {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const lines: QuoteLine[] = [];

  for (const request of requests) {
    const product = bySlug.get(request.slug);
    const quantity = Math.floor(request.quantity);
    if (!product || quantity < 1) continue;

    const safeQuantity = Math.min(quantity, MAX_QUANTITY);
    const lineTotalMinor =
      product.priceMinor == null ? null : product.priceMinor * safeQuantity;

    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      netWeightG: product.netWeightG,
      quantity: safeQuantity,
      unitPriceMinor: product.priceMinor,
      lineTotalMinor,
      currency: product.currency,
      image: product.image,
    });
  }

  const pricePending = lines.some((line) => line.unitPriceMinor == null);
  const subtotalMinor =
    lines.length === 0 || pricePending
      ? null
      : lines.reduce((sum, line) => sum + (line.lineTotalMinor ?? 0), 0);

  return {
    lines,
    subtotalMinor,
    totalMinor: subtotalMinor,
    currency: "PLN",
    pricePending,
  };
}
