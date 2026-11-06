import type { ReactNode } from "react";
import { Container } from "./Container";

export function PageIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="bg-ink-950 text-text-light">
      <Container className="rise py-16 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] font-medium md:text-7xl">{title}</h1>
        {lede ? <p className="mt-6 max-w-xl text-base leading-relaxed text-text-light/75">{lede}</p> : null}
      </Container>
    </section>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <section className="bg-ivory-100 text-text-dark">
      <Container className="grid gap-6 py-16 md:py-20">{children}</Container>
    </section>
  );
}
