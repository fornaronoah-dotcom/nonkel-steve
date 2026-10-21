import { CtaPair } from "@/components/cta";
import { Ornament } from "@/components/ornament";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="reveal text-center">
        <h1 className="font-display text-4xl text-coal sm:text-5xl">{title}</h1>
        <Ornament className="mt-5" />
        <p className="mt-4 text-sm text-ink/60">Laatst bijgewerkt: {updated}</p>
      </header>
      <div className="mt-10 space-y-4 text-ink/85 [&_a]:font-semibold [&_a]:text-bronze [&_a]:underline [&_h2]:font-display [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:text-coal [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
      <CtaPair primary="order" secondary="contact" center className="mt-12" />
    </article>
  );
}
