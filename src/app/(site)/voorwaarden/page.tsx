import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Voorwaarden online bestellen",
  robots: { index: false, follow: true },
  alternates: { canonical: "/voorwaarden" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Voorwaarden online bestellen" updated="24 oktober 2026">
      <h2>Wie zijn we?</h2>
      <p>
        {site.legalName}, {site.street}, {site.postalCode} {site.city}. BTW {site.vat}. Tel. {site.phone}, e-mail{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Bestellen en betalen</h2>
      <ul>
        <li>Alle prijzen op de website zijn in euro en inclusief btw.</li>
        <li>Je bestelling is definitief zodra de online betaling via onze betaalpartner Mollie geslaagd is.</li>
        <li>Je ontvangt een bevestiging op het scherm en per e-mail met je bestelnummer.</li>
        <li>
          Is een product onverwacht niet meer beschikbaar, dan nemen we telefonisch contact op en betalen we het
          betreffende bedrag terug.
        </li>
      </ul>

      <h2>Afhalen en leveren</h2>
      <ul>
        <li>Je kiest bij het bestellen een tijdstip. We doen ons best om dat stipt te halen; op drukke momenten kan het enkele minuten later zijn.</li>
        <li>Afhalen gebeurt aan {site.street} in {site.city}.</li>
        <li>
          Leveren doen we enkel in de gemeenten die je bij het afrekenen kan kiezen, met de daar vermelde leveringskost en
          het minimumbedrag.
        </li>
        <li>Zorg dat je bereikbaar bent op het opgegeven telefoonnummer.</li>
      </ul>

      <h2>Annuleren en herroepingsrecht</h2>
      <p>
        Omdat we bereide maaltijden verkopen die snel bederven, geldt het wettelijke herroepingsrecht van 14 dagen niet
        (art. VI.53, 4° Wetboek van economisch recht). Wil je een bestelling toch annuleren, bel ons dan zo snel mogelijk;
        zolang we nog niet begonnen zijn met bereiden, betalen we je volledig terug.
      </p>

      <h2>Klachten</h2>
      <p>
        Is er iets mis met je bestelling? Laat het ons meteen weten via {site.phone} of{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>, dan zoeken we samen een oplossing. Je kan ook terecht bij het
        Europese ODR-platform:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>

      <h2>Allergenen</h2>
      <p>
        Al onze frituurproducten worden gebakken in ossenvet. Heb je een allergie of vraag over ingrediënten? Bel ons
        vóór je bestelt.
      </p>

      <h2>Privacy</h2>
      <p>
        Hoe we met je gegevens omgaan, lees je in ons <Link href="/privacybeleid">privacybeleid</Link>.
      </p>
    </LegalPage>
  );
}
