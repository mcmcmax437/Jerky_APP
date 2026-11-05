import path from "node:path";
import { readFile } from "node:fs/promises";

const uploadRoot = path.join(process.cwd(), "storage", "uploads");

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isAllowedImageType(mimeType: string): boolean {
  return allowedTypes.has(mimeType);
}

export async function readPrivateUpload(relativePath: string): Promise<Buffer | null> {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes("\0")) {
    return null;
  }

  const resolved = path.resolve(uploadRoot, relativePath);
  const relative = path.relative(uploadRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;

  try {
    return await readFile(resolved);
  } catch {
    return null;
  }
}
