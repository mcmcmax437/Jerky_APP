import assert from "node:assert/strict";
import test from "node:test";
import { formatPriceInput, parsePriceMinor } from "./price";

test("empty price stays unset", () => {
  assert.equal(parsePriceMinor("  "), null);
});

test("zloty input becomes grosz", () => {
  assert.equal(parsePriceMinor("24.90"), 2490);
  assert.equal(parsePriceMinor("24,9"), 2490);
  assert.equal(parsePriceMinor("0"), 0);
});

test("invented precision and words are rejected", () => {
  assert.equal(parsePriceMinor("24.901"), "invalid");
  assert.equal(parsePriceMinor("soon"), "invalid");
  assert.equal(parsePriceMinor("-1"), "invalid");
});

test("stored grosz renders as a price field", () => {
  assert.equal(formatPriceInput(2490), "24.90");
  assert.equal(formatPriceInput(null), "");
});
