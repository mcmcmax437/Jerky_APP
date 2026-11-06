import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const maxBytes = 4 * 1024 * 1024;
const uploadPrefix = "/catalog/uploads/";

export function photoIsInvalid(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return false;
  return file.size > maxBytes || !(file.type in extensions);
}

export async function saveProductPhoto(file: File): Promise<string | null | "invalid"> {
  if (file.size === 0) return null;
  if (file.size > maxBytes) return "invalid";
  const extension = extensions[file.type as keyof typeof extensions];
  if (!extension) return "invalid";
  const name = `${randomBytes(16).toString("hex")}.${extension}`;
  const directory = path.join(process.cwd(), "public", "catalog", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
  return `${uploadPrefix}${name}`;
}

export async function removeUploadedPhoto(publicPath: string | null | undefined) {
  if (!publicPath?.startsWith(uploadPrefix)) return;
  const name = path.basename(publicPath);
  if (name !== publicPath.slice(uploadPrefix.length)) return;
  await unlink(path.join(process.cwd(), "public", "catalog", "uploads", name)).catch(() => undefined);
}
