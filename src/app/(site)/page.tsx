import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Flame, MousePointerClick, ShoppingBag, Soup, Store, Truck } from "lucide-react";
import { CtaPair } from "@/components/cta";
import { Ornament } from "@/components/ornament";
import { OpenStatus } from "@/components/open-status";
import { HoursTable } from "@/components/hours-table";
import { MapEmbed } from "@/components/map-embed";
import { ContactForm } from "@/components/contact-form";
import { FaqJsonLd } from "@/components/json-ld";
import { MENU, euro } from "@/lib/menu";
import { site } from "@/lib/site";
import { delay } from "@/lib/reveal";

// SEO-keyword van deze pagina: "frituur Bredene"
export const metadata: Metadata = {
  title: { absolute: "Frituur Bredene — Bie Nonkel Steve | Afhalen & leveren" },
  description:
    "Zin in friet? Bie Nonkel Steve is dé frituur in Bredene: friet gebakken in ossenvet, bijna 30 sauzen, snacks en burgers. Afhalen of laten leveren.",
  alternates: { canonical: "/" },
};

const SPOTLIGHT = [
  {
    name: "Nonkel Burger",
    price: 9,
    image: "/images/nonkel-burger.webp",
    alt: "Nonkel Burger: rundvleesburger met sla, tomaat, rode ui en kaas op een sesambroodje",
    text: "De huisburger: sappig rundvlees, knapperige groenten en een smeuïge saus op een zacht broodje.",
  },
  {
    name: "Americaantje",
    price: 12,
    image: "/images/americaantje.webp",
    alt: "Americaantje: friet met gesmolten cheddar, pulled pork en saus in een frietbakje",
    text: "Knapperige frietjes met een Amerikaanse twist: cheddar, pulled pork en BBQ-saus. Een maaltijd in één bakje.",
  },
];

const FAVORITES = [
  {
    name: "Bicky burger",
    price: 4.5,
    text: "De Belgische klassieker onder de burgers. Snel, lekker en altijd een goed idee.",
    tag: "Klassieker",
  },
  {
    name: "Stoofvlees",
    price: 7.5,
    text: "Vlaams stoofvlees met een portie friet erbij: je avondmaal is geregeld.",
    tag: "Vlaamse klassieker",
  },
  {
    name: "Vol-au-vent",
    price: 7.5,
    text: "Romige vol-au-vent, comfortfood zoals het hoort. Heerlijk met een grote friet.",
    tag: "Comfortfood",
  },
];

const USPS = [
  { icon: Flame, title: "Gebakken in ossenvet", text: "Zoals een echte Belgische frituur: dat proef je aan elke friet." },
  { icon: Soup, title: "Bijna 30 sauzen", text: "Van klassieke mayo tot stoofvleessaus en tartaar maison." },
  { icon: Truck, title: "Afhalen of leveren", text: "Haal je bestelling warm af of laat ze aan huis brengen." },
  { icon: Store, title: "Echt Bredens", text: "Een frituur van hier, aan de Buurtspoorwegstraat 109." },
];

const STEPS = [
  { icon: MousePointerClick, title: "Kies online", text: "Stel je bestelling samen via onze bestelpagina." },
  { icon: Clock, title: "Kies je afhaaluur", text: "Wij bakken alles vers tegen het uur dat jij kiest." },
  { icon: ShoppingBag, title: "Haal warm af", text: "Kom langs, neem je zak mee en smakelijk!" },
];

const FAQ = [
  {
    q: "Kan ik bij Bie Nonkel Steve online bestellen?",
    a: "Ja. Via onze online bestelpagina kies je je friet, snacks en sauzen en een afhaaluur. Je bestelling ligt dan warm klaar.",
  },
  {
    q: "Leveren jullie aan huis?",
    a: `Ja, we leveren ook aan huis. Bel ons op ${site.phone} voor een levering. Liever zelf afhalen? Bestel online en haal je bestelling op aan de Buurtspoorwegstraat 109 in Bredene.`,
  },
  {
    q: "Wanneer is de frituur open?",
    a: "Maandag 11:30–20:30, dinsdag en donderdag 17:30–20:30, vrijdag en zaterdag 11:30–21:00 en zondag 17:30–21:00. Op woensdag zijn we gesloten.",
  },
  {
    q: "Waarin bakken jullie de friet?",
    a: "In ossenvet, op de traditionele Belgische manier. Dat geeft onze friet en snacks hun typische, volle smaak.",
  },
  {
    q: "Hebben jullie vegetarische opties?",
    a: "We hebben een veggie bicky burger en een veggie bicky cheeseburger. Let wel: alles uit onze frituur, ook de friet, wordt gebakken in ossenvet en is dus niet vegetarisch.",
  },
  {
    q: "Kan ik telefonisch bestellen?",
    a: `Ja, bel ons tijdens de openingsuren op ${site.phone}. Online bestellen is wel het snelst, zeker op drukke momenten.`,
  },
];

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="reveal mx-auto max-w-2xl text-center">
      <p className="font-script text-3xl text-bronze sm:text-4xl">{eyebrow}</p>
      <h2 className="font-display mt-2 text-4xl text-coal sm:text-5xl">{title}</h2>
      <Ornament className="mt-5" />
      {intro && <p className="mt-5 text-lg text-ink/75">{intro}</p>}
    </div>
  );
}

function HeroPhoto({
  src,
  alt,
  className,
  delayMs,
  stamp,
  stampClass = "",
}: {
  src: string;
  alt: string;
  className: string;
  delayMs: number;
  /** id voor de cirkeltekst van de stempel; leeg = geen stempel */
  stamp?: string;
  stampClass?: string;
}) {
  return (
    <div className={`reveal reveal-scale ${className}`} style={delay(delayMs)}>
      <div className="tilt-card overflow-hidden rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-4 ring-cream/90">
        <Image src={src} alt={alt} width={1120} height={630} sizes="(min-width: 1280px) 256px, 50vw" className="aspect-square w-full object-cover" />
      </div>
      {stamp && <OssenvetStamp id={stamp} className={stampClass} />}
    </div>
  );
}

/** Draaiende gouden stempel met cirkeltekst. */
function OssenvetStamp({ id, className }: { id: string; className: string }) {
  return (
    <div className={`absolute size-28 sm:size-32 ${className}`} aria-hidden="true">
      <div className="grid size-full place-items-center rounded-full bg-gold text-coal shadow-xl ring-4 ring-coal">
        <svg viewBox="0 0 100 100" className="stamp-spin absolute inset-0 size-full">
          <defs>
            <path id={id} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
          </defs>
          {/* textLength = omtrek (2π·36) zodat de tekst precies rond past */}
          <text className="fill-coal text-[9px] font-bold uppercase">
            <textPath href={`#${id}`} textLength="224" lengthAdjust="spacing">
              Gebakken in ossenvet • Bredene •{" "}
            </textPath>
          </text>
        </svg>
        <span className="font-script text-3xl leading-none">S</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-coal text-cream">
        <div
          className="absolute left-1/2 top-1/3 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="hero-grain absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 md:pb-28 md:pt-20">
          {/* Foto's links en rechts (desktop) */}
          <HeroPhoto
            src="/images/nonkel-burger.webp"
            alt="Nonkel Burger met sla, tomaat en rode ui op een sesambroodje"
            className="absolute left-6 top-20 hidden w-56 -rotate-8 xl:block 2xl:left-0 2xl:w-64"
            delayMs={500}
          />
          <HeroPhoto
            src="/images/americaantje.webp"
            alt="Americaantje: friet met cheddar en pulled pork"
            className="absolute right-6 top-40 hidden w-56 rotate-6 xl:block 2xl:right-0 2xl:w-64"
            delayMs={650}
            stamp="stamp-desktop"
            stampClass="-bottom-14 left-1/2 -translate-x-1/2"
          />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="reveal">
              <OpenStatus light />
            </div>
            <h1 className="font-display mt-8 text-5xl text-white sm:text-6xl lg:text-7xl">
              <span className="reveal block" style={delay(100)}>
                Frituur in Bredene
              </span>
              <span className="reveal font-script mt-3 block text-[1.15em] font-normal text-gold" style={delay(250)}>
                met een hart voor friet
              </span>
            </h1>
            <Ornament className="mt-6" />
            <p className="reveal mt-6 max-w-xl text-lg text-cream/80 sm:text-xl" style={delay(400)}>
              Verse friet, alle klassieke snacks, burgers en stoofvlees, gebakken in ossenvet zoals het hoort. Bestel
              online en haal warm af, of laat het aan huis leveren.
            </p>
            <CtaPair primary="order" secondary="menu" dark center delayMs={450} className="mt-9 w-full sm:w-auto" />
            <p className="reveal mt-5 text-sm text-cream/60" style={delay(150)}>
              {site.street}, {site.postalCode} {site.city} · Afhalen of leveren
            </p>
          </div>

          {/* Foto's onder de tekst (mobiel/tablet) */}
          <div className="relative mx-auto mt-14 flex max-w-md justify-center xl:hidden">
            <HeroPhoto
              src="/images/nonkel-burger.webp"
              alt="Nonkel Burger met sla, tomaat en rode ui op een sesambroodje"
              className="relative z-10 w-1/2 -rotate-6"
              delayMs={300}
            />
            <HeroPhoto
              src="/images/americaantje.webp"
              alt="Americaantje: friet met cheddar en pulled pork"
              className="relative -ml-6 mt-10 w-1/2 rotate-6"
              delayMs={450}
              stamp="stamp-mobile"
              stampClass="-bottom-8 -left-8"
            />
          </div>
        </div>
      </section>

      {/* USP's */}
      <section className="bg-white py-20" aria-labelledby="waarom">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="waarom" className="sr-only">
            Waarom Bie Nonkel Steve
          </h2>
          <div className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
            {USPS.map(({ icon: Icon, title, text }, idx) => (
              <div key={title} className="reveal card-hover flex flex-col items-center rounded-3xl p-6" style={delay(idx * 100)}>
                <span className="card-icon grid size-16 place-items-center rounded-full bg-coal text-gold">
                  <Icon className="size-7" strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 className="font-display mt-5 text-xl text-coal">{title}</h3>
                <p className="mt-2 max-w-60 text-ink/75">{text}</p>
              </div>
            ))}
          </div>
          <CtaPair primary="order" secondary="call" center className="mt-14" />
        </div>
      </section>

      {/* Uitgelicht: paradepaardjes met foto */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="reveal">
            <p className="font-script text-3xl text-bronze sm:text-4xl">De paradepaardjes</p>
            <h2 className="font-display mt-2 text-4xl text-coal sm:text-5xl">Nonkel Burger &amp; Americaantje</h2>
          </div>
          <Ornament className="mt-5" />
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            {SPOTLIGHT.map((item, idx) => (
              <article key={item.name} className="reveal reveal-scale group" style={delay(idx * 150)}>
                <figure className="relative overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-gold/30">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={1120}
                    height={630}
                    sizes="(min-width: 1152px) 540px, (min-width: 768px) 46vw, 100vw"
                    className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <figcaption className="absolute bottom-3 right-3 rounded-full bg-coal/90 px-3.5 py-1 font-display text-lg text-gold backdrop-blur sm:bottom-5 sm:right-5 sm:px-4 sm:py-1.5 sm:text-2xl">
                    {euro(item.price)}
                  </figcaption>
                </figure>
                <h3 className="font-display mt-7 text-3xl text-coal">{item.name}</h3>
                <p className="mx-auto mt-3 max-w-md text-lg text-ink/80">{item.text}</p>
              </article>
            ))}
          </div>
          <CtaPair primary="order" secondary="menu" center className="mt-14" />
        </div>
      </section>

      {/* Favorieten */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Favorieten van Nonkel Steve"
            title="Dit bestellen onze vaste klanten"
            intro="Nog meer klassiekers die vaak over de toog gaan. Daar ga je niet mee mis."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FAVORITES.map((f, idx) => (
              <article
                key={f.name}
                className="reveal card-hover flex flex-col items-center rounded-3xl bg-cream p-8 text-center ring-1 ring-coal/5"
                style={delay(idx * 120)}
              >
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-bronze">
                  {f.tag}
                </span>
                <h3 className="font-display mt-5 text-2xl text-coal">{f.name}</h3>
                <p className="mt-3 flex-1 text-ink/75">{f.text}</p>
                <p className="font-display mt-6 text-3xl text-bronze">{euro(f.price)}</p>
              </article>
            ))}
          </div>
          <CtaPair primary="order" secondary="menu" center className="mt-14" />
        </div>
      </section>

      {/* Zo werkt bestellen */}
      <section className="bg-coal py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="reveal">
            <p className="font-script text-3xl text-gold sm:text-4xl">Online bestellen</p>
            <h2 className="font-display mx-auto mt-2 max-w-2xl text-4xl sm:text-5xl">In 3 stappen je frietzak in handen</h2>
          </div>
          <Ornament className="mt-5" />
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, idx) => (
              <li
                key={title}
                className="reveal card-hover flex flex-col items-center rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 hover:bg-white/10"
                style={delay(idx * 150)}
              >
                <span className="font-display text-6xl text-gold">{idx + 1}</span>
                <span className="card-icon mt-3 grid size-12 place-items-center rounded-full text-white/70">
                  <Icon className="size-7" strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 className="font-display mt-4 text-xl">{title}</h3>
                <p className="mt-2 max-w-64 text-white/75">{text}</p>
              </li>
            ))}
          </ol>
          <CtaPair primary="order" secondary="call" dark center className="mt-14" />
        </div>
      </section>

      {/* Menu teaser */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Het menu"
            title="Van kinderfriet tot familiezak"
            intro="Alle prijzen staan gewoon online. Kies een categorie en ontdek het volledige aanbod."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MENU.map((c, idx) => {
              const min = Math.min(...c.items.map((i) => i.price));
              return (
                <Link
                  key={c.id}
                  href={`/menu#${c.id}`}
                  className="reveal card-hover group checker flex flex-col items-center rounded-3xl bg-sand p-7 text-center hover:bg-gold"
                  style={delay((idx % 3) * 100)}
                >
                  <h3 className="font-display text-2xl text-coal">{c.title}</h3>
                  <p className="mt-1 text-sm text-ink/70">
                    {c.items.length} items · vanaf {euro(min)}
                  </p>
                  <ArrowRight
                    className="mt-3 size-5 text-coal transition group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
          <CtaPair primary="menu" secondary="order" center className="mt-14" />
        </div>
      </section>

      {/* Uren & locatie */}
      <section id="uren" className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading eyebrow="Openingsuren & ligging" title="Kom langs in Bredene" />
          <div className="reveal mt-8 flex justify-center">
            <OpenStatus />
          </div>
          <div className="reveal mx-auto mt-8 max-w-md text-lg" style={delay(100)}>
            <HoursTable />
          </div>
          <p className="reveal mx-auto mt-8 max-w-xl text-center text-ink/75">
            Je vindt ons aan de <strong>{site.street}</strong> in {site.postalCode} {site.city}, vlak bij Oostende en
            De Haan.
          </p>
          <CtaPair primary="order" secondary="route" center className="mt-8" />
          <div className="mt-12">
            <MapEmbed />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading eyebrow="Veelgestelde vragen" title="Goed om te weten" />
          <div className="reveal mt-12 divide-y divide-coal/10 rounded-3xl bg-white px-6 shadow-sm">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-coal transition-colors hover:text-bronze">
                  {q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full text-2xl text-bronze ring-1 ring-gold/50 transition duration-300 group-open:rotate-45 group-open:bg-gold group-open:text-coal" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-ink/75">{a}</p>
              </details>
            ))}
          </div>
          <CtaPair primary="order" secondary="contact" center className="mt-12" />
        </div>
      </section>

      {/* Contact */}
      <section className="bg-sand py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Vraag of opmerking?"
            title="Laat iets weten"
            intro="Heb je een vraag over allergenen, een grote bestelling of iets anders? Stuur ons een bericht of bel tijdens de openingsuren."
          />
          <CtaPair primary="order" secondary="call" center className="mt-8" />
          <div className="mt-12">
            <ContactForm page="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}
