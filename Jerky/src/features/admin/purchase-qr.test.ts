import assert from "node:assert/strict";
import test from "node:test";
import { matchPurchaseQr, parsePurchaseQr } from "./purchase-qr";

const lines = [
  { recipeId: "beef", recipeTitle: "Яловичина", componentName: "сіль" },
  { recipeId: "chicken", recipeTitle: "Курка", componentName: "сіль" },
  { recipeId: "beef", recipeTitle: "Яловичина", componentName: "перець" },
];

test("plain qr is the component name", () => {
  assert.deepEqual(parsePurchaseQr("  сіль  "), { name: "сіль", recipe: null, component: "сіль" });
});

test("pipe and json qr carry the recipe", () => {
  assert.deepEqual(parsePurchaseQr("Сіль кам’яна|Яловичина|сіль"), {
    name: "Сіль кам’яна",
    recipe: "Яловичина",
    component: "сіль",
  });
  assert.deepEqual(parsePurchaseQr('{"name":"Сіль","recipe":"beef","component":"сіль"}'), {
    name: "Сіль",
    recipe: "beef",
    component: "сіль",
  });
});

test("a name that exists once is automatic and a shared name is not", () => {
  const salt = parsePurchaseQr("сіль");
  const pepper = parsePurchaseQr("перець");
  assert.ok(salt && pepper);
  assert.equal(matchPurchaseQr(lines, salt).length, 2);
  assert.deepEqual(matchPurchaseQr(lines, pepper).map((line) => line.recipeId), ["beef"]);
  assert.deepEqual(
    matchPurchaseQr(lines, { name: "Сіль", recipe: "Курка", component: "сіль" }).map((line) => line.recipeId),
    ["chicken"],
  );
});
