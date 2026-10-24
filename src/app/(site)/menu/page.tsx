import type { Metadata } from "next";
import { ArrowDown, Lightbulb, PauseCircle } from "lucide-react";
import { CtaButton } from "@/components/cta";
import { Ornament } from "@/components/ornament";
import { OpenStatus } from "@/components/open-status";
import { AddToCart, OpenCartButton } from "@/components/order/cart-drawer";
import { getMenu, getSettings } from "@/lib/menu";
import { euro } from "@/lib/money";
import { delay } from "@/lib/reveal";

// SEO-keyword van deze pagina: "friet bestellen Bredene"
export const metadata: Metadata = {
  title: "Friet bestellen in Bredene — menu & prijzen",
  description:
    "Friet bestellen in Bredene? Bekijk het volledige menu van Bie Nonkel Steve met prijzen en bestel meteen online: frieten, snacks, burgers, sauzen en meer. Afhalen of leveren.",
  alternates: { canonical: "/menu" },
};

// Menu komt uit de database; admin-wijzigingen verversen deze pagina meteen (revalidatePath).
export const revalidate = 300;

export default async function MenuPage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);
  const canOrder = settings.orderingEnabled;

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
          Stel je bestelling samen met de <strong>+</strong>-knop, betaal veilig online en haal ze warm af aan de
          Buurtspoorwegstraat 109, of laat ze aan huis leveren.
        </p>
        <div className="reveal mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center" style={delay(450)}>
          {menu[0] && (
            <a href={`#${menu[0].slug}`} className="btn btn-primary">
              <ArrowDown className="size-5" strokeWidth={2.4} aria-hidden="true" />
              Kies je gerechten
            </a>
          )}
          <CtaButton kind="call" variant="secondary" />
        </div>
      </section>

      {/* Categorie-tabs */}
      <nav
        className="sticky top-[71px] z-40 border-y border-coal/10 bg-cream/95 backdrop-blur md:top-[74px]"
        aria-label="Menucategorieën"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-center">
          {menu.map((c) => (
            <a
              key={c.id}
              href={`#${c.slug}`}
              className="shrink-0 rounded-full bg-white px-4 py-2 font-semibold text-coal ring-1 ring-coal/10 transition hover:-translate-y-0.5 hover:bg-gold hover:ring-gold"
            >
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {canOrder ? (
          <div className="reveal mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-3xl bg-gold/25 p-6 text-center ring-1 ring-gold">
            <Lightbulb className="size-6 shrink-0 text-coal" aria-hidden="true" />
            <p className="text-coal">
              <strong>Tip:</strong> bestel vooraf en kies je tijdstip. Zo staat je bestelling vers klaar en sla je de
              wachtrij over, ook op vrijdag- en zaterdagavond.
            </p>
          </div>
        ) : (
          <div
            className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-3xl bg-ketchup/10 p-6 text-center ring-1 ring-ketchup/40"
            role="status"
          >
            <PauseCircle className="size-6 shrink-0 text-ketchup" aria-hidden="true" />
            <p className="font-semibold text-coal">{settings.pauseMessage}</p>
          </div>
        )}

        {menu.map((c) => (
          <section key={c.id} id={c.slug} className="scroll-mt-12 pt-16" aria-labelledby={`${c.slug}-title`}>
            <div className="reveal text-center">
              <h2 id={`${c.slug}-title`} className="font-display text-4xl text-coal sm:text-5xl">
                {c.name}
              </h2>
              <Ornament className="mt-4" />
              {c.intro && <p className="mt-4 text-ink/70">{c.intro}</p>}
            </div>
            <ul className="reveal mx-auto mt-8 grid max-w-5xl gap-x-12 md:grid-cols-2" style={delay(100)}>
              {c.products.map((p) => (
                <li
                  key={p.id}
                  className={`price-row flex items-center gap-4 border-b border-dashed border-coal/15 py-3 ${p.available ? "" : "opacity-55"}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold text-ink">{p.name}</span>
                      <span className="font-display tabular-nums text-bronze">{euro(p.price)}</span>
                    </div>
                    {p.description && <p className="mt-1 text-sm text-ink/65">{p.description}</p>}
                  </div>
                  {canOrder &&
                    (p.available ? (
                      <AddToCart product={{ id: p.id, name: p.name, price: p.price }} />
                    ) : (
                      <span className="w-9 shrink-0 text-center text-[10px] font-bold uppercase leading-tight text-ketchup">
                        Uitver&shy;kocht
                      </span>
                    ))}
                </li>
              ))}
            </ul>
            <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <OpenCartButton />
              <CtaButton kind="call" variant="secondary" />
            </div>
          </section>
        ))}

        <p className="mt-16 text-center text-sm text-ink/60">
          Prijzen onder voorbehoud van wijzigingen. Allergenen of vragen? Bel ons gerust.
        </p>
      </div>
    </>
  );
}
