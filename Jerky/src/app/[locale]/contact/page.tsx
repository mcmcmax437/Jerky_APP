import type { Metadata } from "next";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { TextField } from "@/components/ui/TextField";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.nav.contact, description: dict.contact.lede };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await readLocale(params);

  return (
    <>
      <PageIntro eyebrow={dict.contact.eyebrow} title={dict.contact.title} lede={dict.contact.lede} />
      <PageBody>
        <form className="max-w-xl" aria-describedby="contact-note">
          <fieldset disabled className="grid gap-5">
            <TextField id="name" label={dict.contact.name} placeholder={dict.contact.example.name} />
            <TextField id="email" label={dict.contact.email} type="email" placeholder={dict.contact.example.email} />
            <TextField id="message" label={dict.contact.message} multiline placeholder={dict.contact.example.message} />
          </fieldset>
          <p id="contact-note" className="mt-5 text-sm leading-relaxed text-text-dark/80">
            {dict.contact.disabledNote}
          </p>
        </form>
      </PageBody>
    </>
  );
}
