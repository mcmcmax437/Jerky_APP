import assert from "node:assert/strict";
import { test } from "node:test";
import { moveShopItem, slotAssignments } from "./slots";

test("shop slots stay ahead of products that are not published", () => {
  assert.deepEqual(slotAssignments(["b", "a"], ["x"]), [
    { id: "b", sortOrder: 1 },
    { id: "a", sortOrder: 2 },
    { id: "x", sortOrder: 3 },
  ]);
});

test("dragging a card inserts it at the target slot", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(
    moveShopItem(items, "a", "c").map((item) => item.id),
    ["b", "c", "a"],
  );
  assert.deepEqual(moveShopItem(items, "a", "a"), items);
});
