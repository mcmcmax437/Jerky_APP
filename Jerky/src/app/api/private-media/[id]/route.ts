import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isAllowedImageType, readPrivateUpload } from "@/lib/storage/uploads";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset?.isPrivate || !isAllowedImageType(asset.mimeType)) {
    return new NextResponse(null, { status: 404 });
  }

  const file = await readPrivateUpload(asset.relativePath);
  if (!file) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": asset.mimeType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
