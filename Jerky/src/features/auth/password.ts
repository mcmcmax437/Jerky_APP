import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 32;

/** Used only when an email is not registered, so the check takes the same time as a wrong password. */
export const unknownPasswordHash =
  "scrypt$V-h0SHGhFgSaIKmDPuAVug$_S1FFhIvQsUBfOsMMjvFB5lKTrbnEof7WG52kLLxydA";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, keyLength)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const saltBuffer = Buffer.from(salt, "base64url");
  const expected = Buffer.from(hash, "base64url");
  if (expected.length === 0) return false;
  const actual = (await scrypt(password, saltBuffer, expected.length)) as Buffer;
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
