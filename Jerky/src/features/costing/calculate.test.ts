import assert from "node:assert/strict";
import { test } from "node:test";
import {
  costPer100gPack,
  lineCost,
  packCount100g,
  recipeCost,
  remainderG,
  sumCosts,
  yieldPercent,
} from "./calculate";

test("yield is finished weight over raw meat", () => {
  assert.equal(yieldPercent(450, 1000), 45);
  assert.equal(yieldPercent(100, 0), null);
});

test("full 100 g packs ignore the remainder", () => {
  assert.equal(packCount100g(250), 2);
  assert.equal(remainderG(250), 50);
  assert.equal(packCount100g(0), 0);
});

test("pack cost is hidden when a batch makes no full pack", () => {
  assert.equal(costPer100gPack(80, 0), null);
  assert.equal(costPer100gPack(80, 2), 40);
});

test("recipe cost multiplies each quantity by the purchase price", () => {
  assert.equal(lineCost(20, 0.5), 10);
  assert.equal(lineCost(20, null), null);
  assert.deepEqual(
    recipeCost([
      { quantity: 1000, unitPrice: 0.04 },
      { quantity: 20, unitPrice: 0.5 },
      { quantity: 5, unitPrice: null },
    ]),
    { total: 50, missing: 1 },
  );
});

test("direct cost leaves labour out until the extended total", () => {
  const lines = [
    { amount: 30, included: true, direct: true },
    { amount: 10, included: true, direct: false },
    { amount: 5, included: false, direct: true },
  ];
  assert.equal(sumCosts(lines, "direct"), 30);
  assert.equal(sumCosts(lines, "extended"), 40);
});
