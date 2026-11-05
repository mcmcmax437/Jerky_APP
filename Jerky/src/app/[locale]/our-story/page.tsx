import type { Metadata } from "next";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.story.title };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await readLocale(params);

  return (
    <>
      <PageIntro eyebrow={dict.story.eyebrow} title={dict.story.title} />
      <PageBody>
        {dict.story.paragraphs.map((paragraph) => (
          <p key={paragraph} className="max-w-2xl text-lg leading-relaxed">
            {paragraph}
          </p>
        ))}
      </PageBody>
    </>
  );
}
