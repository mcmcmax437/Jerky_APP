import assert from "node:assert/strict";
import test from "node:test";
import { rateDecision, type RateRule } from "./limit";

const rule: RateRule = { limit: 3, windowMs: 1_000, lockMs: 5_000 };

test("rate limit allows attempts inside the window and locks the next one", () => {
  const first = rateDecision(null, 0, rule);
  const second = rateDecision(first, 100, rule);
  const third = rateDecision(second, 200, rule);
  const fourth = rateDecision(third, 300, rule);
  assert.equal(first.allow, true);
  assert.equal(second.allow, true);
  assert.equal(third.allow, true);
  assert.equal(fourth.allow, false);
  assert.equal(fourth.lockedUntil, 5_300);
});

test("a lock stays closed until it expires, then the window starts over", () => {
  const locked = rateDecision({ hits: 4, windowStart: 0, lockedUntil: 5_000 }, 1_000, rule);
  assert.equal(locked.allow, false);
  const again = rateDecision(locked, 5_000, rule);
  assert.equal(again.allow, true);
  assert.equal(again.hits, 1);
});
