import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isAllowedImageType } from "@/lib/storage/uploads";

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const maxBytes = 4 * 1024 * 1024;
const uploadRoot = path.join(process.cwd(), "storage", "uploads");
const photoDirectory = path.join(uploadRoot, "recipes");

export function recipePhotoIsInvalid(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return false;
  return file.size > maxBytes || !isAllowedImageType(file.type);
}

export async function saveRecipePhoto(file: File): Promise<{ relativePath: string; mimeType: string; sizeBytes: number } | null> {
  if (file.size === 0 || file.size > maxBytes) return null;
  const extension = extensions[file.type as keyof typeof extensions];
  if (!extension) return null;
  const name = `${randomBytes(16).toString("hex")}.${extension}`;
  await mkdir(photoDirectory, { recursive: true });
  await writeFile(path.join(photoDirectory, name), Buffer.from(await file.arrayBuffer()));
  return { relativePath: `recipes/${name}`, mimeType: file.type, sizeBytes: Math.trunc(file.size) };
}

export async function removeRecipePhoto(relativePath: string) {
  const resolved = path.resolve(uploadRoot, relativePath);
  if (!relativePath || path.relative(uploadRoot, resolved).startsWith("..")) return;
  await unlink(resolved).catch(() => undefined);
}
