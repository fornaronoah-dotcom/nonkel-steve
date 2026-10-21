import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacybeleid",
  robots: { index: false, follow: true },
  alternates: { canonical: "/privacybeleid" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacybeleid" updated="19 oktober 2026">
      <p>
        {site.name} respecteert je privacy en verwerkt persoonsgegevens volgens de Algemene Verordening
        Gegevensbescherming (AVG/GDPR) en de Belgische wet van 30 juli 2018 betreffende de bescherming van natuurlijke
        personen met betrekking tot de verwerking van persoonsgegevens.
      </p>

      <h2>Verwerkingsverantwoordelijke</h2>
      <p>
        {site.legalName}
        <br />
        {site.street}, {site.postalCode} {site.city}
        <br />
        BTW {site.vat}
        <br />
        E-mail: <a href={`mailto:${site.email}`}>{site.email}</a> · Tel. {site.phone}
      </p>

      <h2>Welke gegevens verwerken we?</h2>
      <ul>
        <li>
          <strong>Contactformulier:</strong> naam, e-mailadres, telefoonnummer (optioneel) en je bericht.
        </li>
        <li>
          <strong>Websitestatistieken:</strong> enkel na jouw toestemming verzamelen we via Google Analytics anonieme
          gegevens over het gebruik van de website (zie ons <Link href="/cookiebeleid">cookiebeleid</Link>).
        </li>
        <li>
          <strong>Online bestellingen:</strong> verlopen via het platform van Unipage. Op die gegevens is het
          privacybeleid van Unipage van toepassing.
        </li>
      </ul>

      <h2>Waarom en op welke rechtsgrond?</h2>
      <ul>
        <li>Om je vraag te beantwoorden (toestemming en gerechtvaardigd belang, art. 6.1 a en f AVG).</li>
        <li>Om de website te verbeteren via statistieken (toestemming, art. 6.1 a AVG).</li>
      </ul>

      <h2>Hoe lang bewaren we je gegevens?</h2>
      <p>
        Berichten via het contactformulier bewaren we maximaal 12 maanden na het laatste contact, tenzij een langere
        bewaring wettelijk verplicht is. Analytische gegevens worden na maximaal 14 maanden automatisch verwijderd.
      </p>

      <h2>Met wie delen we je gegevens?</h2>
      <p>
        We verkopen je gegevens nooit. We werken met verwerkers die ons helpen de website te laten draaien: Vercel
        (hosting), een PostgreSQL-databaseprovider (opslag van formulierberichten), Resend (verzending van e-mails) en
        Google (Analytics en Maps, enkel na toestemming). Met hen zijn de nodige afspraken gemaakt. Wanneer gegevens
        buiten de Europese Economische Ruimte worden verwerkt, gebeurt dat op basis van passende waarborgen zoals het
        EU-VS Data Privacy Framework of standaardcontractbepalingen.
      </p>

      <h2>Jouw rechten</h2>
      <p>
        Je hebt het recht op inzage, verbetering, verwijdering, beperking van de verwerking, overdraagbaarheid en
        bezwaar. Een gegeven toestemming kan je altijd intrekken. Stuur hiervoor een e-mail naar{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. We antwoorden binnen één maand.
      </p>
      <p>
        Ben je niet tevreden over hoe we met je gegevens omgaan? Dan kan je klacht indienen bij de
        Gegevensbeschermingsautoriteit, Drukpersstraat 35, 1000 Brussel,{" "}
        <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener">
          www.gegevensbeschermingsautoriteit.be
        </a>
        .
      </p>

      <h2>Beveiliging</h2>
      <p>
        We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen, zoals versleutelde
        verbindingen (HTTPS) en beveiligde toegang tot onze beheeromgeving.
      </p>
    </LegalPage>
  );
}
