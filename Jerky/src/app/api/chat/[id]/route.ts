import { NextResponse } from "next/server";
import { getChatMessages } from "@/features/chat/queries";

/** The client widget polls this every few seconds, so nothing here may be cached. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!/^[0-9a-z]{20,40}$/.test(id)) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const messages = await getChatMessages(id);
  const body = messages.map((item) => ({
    id: item.id,
    body: item.body,
    admin: item.admin,
    author: item.author?.name ?? "",
    at: item.createdAt.toISOString(),
  }));

  return new NextResponse(
    JSON.stringify({ messages: body }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}
