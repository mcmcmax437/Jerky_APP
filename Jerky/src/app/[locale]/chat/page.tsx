import type { Metadata } from "next";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { ChatPanel } from "@/components/site/ChatPanel";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.chat.title, description: dict.chat.lede };
}

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string; error?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const requested = query.t ?? "";
  const id = /^[0-9a-z]{20,40}$/.test(requested) ? requested : "";
  const copy = dict.chat;
  const errors = dict.account.errors;

  const notice =
    query.error === "message"
      ? errors.message
      : query.error === "locked"
        ? errors.locked
        : query.error === "failed"
          ? errors.failed
          : "";

  return (
    <>
      <PageIntro eyebrow={copy.open} title={copy.title} lede={copy.lede} />
      <PageBody>
        <ChatPanel id={id} locale={locale} copy={copy} notice={notice} />
      </PageBody>
    </>
  );
}
