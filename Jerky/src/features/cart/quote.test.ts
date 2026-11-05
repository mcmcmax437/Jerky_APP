import assert from "node:assert/strict";
import { test } from "node:test";
import { buildQuote, type QuoteProduct } from "./quote";

const products: QuoteProduct[] = [
  {
    id: "1",
    slug: "original",
    name: "ORIGINAL",
    netWeightG: 100,
    priceMinor: 2500,
    currency: "PLN",
    image: null,
  },
  {
    id: "2",
    slug: "teriyaki",
    name: "TERIYAKI",
    netWeightG: 100,
    priceMinor: null,
    currency: "PLN",
    image: null,
  },
];

test("priced lines use the database unit price, not the client total", () => {
  const quote = buildQuote([{ slug: "original", quantity: 3 }], products);
  assert.equal(quote.lines[0]?.lineTotalMinor, 7500);
  assert.equal(quote.totalMinor, 7500);
  assert.equal(quote.pricePending, false);
});

test("a missing retail price blocks the monetary total", () => {
  const quote = buildQuote(
    [
      { slug: "original", quantity: 1 },
      { slug: "teriyaki", quantity: 2 },
    ],
    products,
  );
  assert.equal(quote.pricePending, true);
  assert.equal(quote.totalMinor, null);
  assert.equal(quote.lines[1]?.quantity, 2);
  assert.equal(quote.lines[1]?.unitPriceMinor, null);
});

test("unknown products and empty quantities are dropped", () => {
  const quote = buildQuote(
    [
      { slug: "missing", quantity: 4 },
      { slug: "original", quantity: 0 },
    ],
    products,
  );
  assert.equal(quote.lines.length, 0);
  assert.equal(quote.totalMinor, null);
});

test("quantity is capped", () => {
  const quote = buildQuote([{ slug: "original", quantity: 99 }], products);
  assert.equal(quote.lines[0]?.quantity, 20);
  assert.equal(quote.totalMinor, 50000);
});
