import type { Metadata } from "next";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.legal.termsTitle };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await readLocale(params);

  return (
    <>
      <PageIntro eyebrow={dict.legal.draft} title={dict.legal.termsTitle} />
      <PageBody>
        {dict.legal.termsBody.map((paragraph) => (
          <p key={paragraph} className="max-w-2xl leading-relaxed">
            {paragraph}
          </p>
        ))}
      </PageBody>
    </>
  );
}
