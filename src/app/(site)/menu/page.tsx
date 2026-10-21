import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { CtaButton, CtaPair } from "@/components/cta";
import { Ornament } from "@/components/ornament";
import { OpenStatus } from "@/components/open-status";
import { MENU, euro } from "@/lib/menu";
import { delay } from "@/lib/reveal";

// SEO-keyword van deze pagina: "friet bestellen Bredene"
export const metadata: Metadata = {
  title: "Friet bestellen in Bredene — menu & prijzen",
  description:
    "Friet bestellen in Bredene? Bekijk het volledige menu van Bie Nonkel Steve met prijzen: frieten, snacks, burgers, sauzen en meer. Afhalen of leveren.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <>
      <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-14 pt-12 text-center sm:px-6 md:pt-20">
        <div className="reveal">
          <OpenStatus />
        </div>
        <p className="reveal font-script mt-8 text-4xl text-bronze sm:text-5xl" style={delay(100)}>
          Het menu
        </p>
        <h1 className="reveal font-display mt-2 text-5xl text-coal sm:text-6xl" style={delay(200)}>
          Friet bestellen in Bredene
        </h1>
        <Ornament className="mt-6" />
        <p className="reveal mt-6 max-w-2xl text-lg text-ink/80" style={delay(300)}>
          Het volledige menu van Bie Nonkel Steve, met alle prijzen. Stel je bestelling samen, bestel online en haal
          ze warm af aan de Buurtspoorwegstraat 109.
        </p>
        <CtaPair primary="order" secondary="call" center delayMs={450} className="mt-9 w-full sm:w-auto" />
      </section>

      {/* Categorie-tabs */}
      <nav
        className="sticky top-[71px] md:top-[74px] z-40 border-y border-coal/10 bg-cream/95 backdrop-blur"
        aria-label="Menucategorieën"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-center">
          {MENU.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="shrink-0 rounded-full bg-white px-4 py-2 font-semibold text-coal ring-1 ring-coal/10 transition hover:-translate-y-0.5 hover:bg-gold hover:ring-gold"
            >
              {c.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="reveal mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-3xl bg-gold/25 p-6 text-center ring-1 ring-gold">
          <Lightbulb className="size-6 shrink-0 text-coal" aria-hidden="true" />
          <p className="text-coal">
            <strong>Tip:</strong> bestel vooraf online en kies je afhaaluur. Zo staat je bestelling vers klaar en sla
            je de wachtrij over, ook op vrijdag- en zaterdagavond. Liever laten leveren? Bel ons.
          </p>
        </div>

        {MENU.map((c, idx) => (
          <section key={c.id} id={c.id} className="scroll-mt-12 pt-16" aria-labelledby={`${c.id}-title`}>
            <div className="reveal text-center">
              <h2 id={`${c.id}-title`} className="font-display text-4xl text-coal sm:text-5xl">
                {c.title}
              </h2>
              <Ornament className="mt-4" />
              <p className="mt-4 text-ink/70">{c.intro}</p>
            </div>
            <ul className="reveal mx-auto mt-8 grid max-w-5xl gap-x-12 md:grid-cols-2" style={delay(100)}>
              {c.items.map((item) => (
                <li key={item.name} className="price-row border-b border-dashed border-coal/15 py-3.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold text-ink">{item.name}</span>
                    <span className="font-display tabular-nums text-bronze">{euro(item.price)}</span>
                  </div>
                  {item.description && <p className="mt-1 text-sm text-ink/65">{item.description}</p>}
                </li>
              ))}
            </ul>
            {/* Elke sectie 2 keuzes; afwisselend om herhaling te beperken */}
            <CtaPair primary="order" secondary={idx % 2 ? "call" : "contact"} center className="mt-10" />
          </section>
        ))}

        <p className="mt-16 text-center text-sm text-ink/60">
          Prijzen onder voorbehoud van wijzigingen. Allergenen of vragen? Vraag het gerust bij het bestellen.
        </p>
      </div>

      {/* Sticky bestel-bar op mobiel */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-coal/10 bg-cream/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2 [&_.btn]:w-full [&_.btn]:px-3">
          <CtaButton kind="order" />
          <CtaButton kind="call" variant="secondary" label="Bel ons" />
        </div>
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
