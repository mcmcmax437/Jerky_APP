import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./password";

test("password hash verifies the same password and rejects another", async () => {
  const stored = await hashPassword("local-pass-2026");
  assert.equal(await verifyPassword("local-pass-2026", stored), true);
  assert.equal(await verifyPassword("other-pass-2026", stored), false);
  assert.equal(await verifyPassword("local-pass-2026", "plain"), false);
});
