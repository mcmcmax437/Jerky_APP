import type { Metadata } from "next";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.faq.title, description: dict.faq.lede };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await readLocale(params);

  return (
    <>
      <PageIntro eyebrow={dict.faq.eyebrow} title={dict.faq.title} lede={dict.faq.lede} />
      <PageBody>
        <div className="max-w-3xl divide-y divide-ink-800/10 border-y border-ink-800/10">
          {dict.faq.items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none font-display text-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper">
                {item.q}
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-text-dark/80">{item.a}</p>
            </details>
          ))}
        </div>
      </PageBody>
    </>
  );
}
