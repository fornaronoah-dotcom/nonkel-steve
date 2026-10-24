import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { CtaPair } from "@/components/cta";
import { Ornament } from "@/components/ornament";
import { ContactForm } from "@/components/contact-form";
import { HoursTable } from "@/components/hours-table";
import { MapEmbed } from "@/components/map-embed";
import { OpenStatus } from "@/components/open-status";
import { site } from "@/lib/site";
import { delay } from "@/lib/reveal";

// SEO-keyword van deze pagina: "Bie Nonkel Steve contact"
export const metadata: Metadata = {
  title: { absolute: "Contact Bie Nonkel Steve — adres, telefoon & openingsuren" },
  description:
    "Contact met Bie Nonkel Steve in Bredene: Buurtspoorwegstraat 109, tel. 0469 16 96 19. Bekijk de openingsuren of stuur ons een bericht.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const cards = [
    { icon: Phone, label: "Bellen", value: site.phone, href: site.phoneHref },
    { icon: Mail, label: "Mailen", value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: "Langskomen", value: `${site.street}, ${site.postalCode} ${site.city}`, href: site.mapsUrl },
  ];

  return (
    <>
      <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-12 text-center sm:px-6 md:pt-20">
        <div className="reveal">
          <OpenStatus />
        </div>
        <p className="reveal font-script mt-8 text-4xl text-bronze sm:text-5xl" style={delay(100)}>
          Zeg het maar
        </p>
        <h1 className="reveal font-display mt-2 text-5xl text-coal sm:text-6xl" style={delay(200)}>
          Contact Bie Nonkel Steve
        </h1>
        <Ornament className="mt-6" />
        <p className="reveal mt-6 max-w-2xl text-lg text-ink/80" style={delay(300)}>
          Wil je bestellen? Dat gaat het snelst online of telefonisch. Voor andere vragen kan je ons altijd een bericht
          sturen.
        </p>
        <CtaPair primary="order" secondary="call" center delayMs={450} className="mt-9 w-full sm:w-auto" />

        <ul className="mt-14 grid w-full gap-4 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value, href }, idx) => (
            <li key={label} className="reveal" style={delay(idx * 120)}>
              <a
                href={href}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                className="card-hover flex h-full flex-col items-center rounded-3xl bg-white p-6 shadow-sm ring-1 ring-coal/5"
              >
                <span className="card-icon grid size-12 place-items-center rounded-full bg-coal text-gold">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-3 text-sm font-semibold uppercase tracking-wider text-ink/60">{label}</span>
                <span className="mt-1 break-all font-semibold text-coal">{value}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="reveal text-center">
            <p className="font-script text-3xl text-bronze sm:text-4xl">Een vraag?</p>
            <h2 className="font-display mt-2 text-4xl text-coal">Stuur ons een bericht</h2>
            <Ornament className="mt-5" />
            <p className="mt-5 text-ink/75">We antwoorden zo snel mogelijk, meestal binnen één werkdag.</p>
            <CtaPair primary="order" secondary="route" center className="mt-8" />
          </div>
          <div className="mt-12">
            <ContactForm page="contact" />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="reveal text-center">
            <p className="font-script text-3xl text-bronze sm:text-4xl">Wanneer</p>
            <h2 className="font-display mt-2 text-4xl text-coal">Openingsuren</h2>
            <Ornament className="mt-5" />
          </div>
          <div className="reveal mx-auto mt-8 max-w-md text-lg">
            <HoursTable />
          </div>
          <CtaPair primary="order" secondary="call" center className="mt-8" />
          <div className="mt-12">
            <MapEmbed />
          </div>
        </div>
      </section>
    </>
  );
}
