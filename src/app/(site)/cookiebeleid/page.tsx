import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookiebeleid",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cookiebeleid" },
};

const COOKIES = [
  { name: "cookie-consent", provider: site.name, purpose: "Onthoudt je cookiekeuze (localStorage).", duration: "Tot je ze wist", type: "Noodzakelijk" },
  { name: "_ga", provider: "Google Analytics", purpose: "Onderscheidt unieke bezoekers.", duration: "2 jaar", type: "Analytisch" },
  { name: "_ga_<ID>", provider: "Google Analytics", purpose: "Bewaart de sessiestatus.", duration: "2 jaar", type: "Analytisch" },
  { name: "Google Maps", provider: "Google", purpose: "Toont de routekaart en kan cookies plaatsen.", duration: "Variabel", type: "Functioneel / derde partij" },
];

export default function CookiePage() {
  return (
    <LegalPage title="Cookiebeleid" updated="19 oktober 2026">
      <p>
        Cookies zijn kleine tekstbestanden die op je toestel worden opgeslagen wanneer je een website bezoekt. Volgens
        de Belgische wet betreffende de elektronische communicatie (art. 129) en de AVG plaatsen we enkel strikt
        noodzakelijke cookies zonder je toestemming. Analytische cookies en Google Maps laden pas nadat je op
        &ldquo;Accepteren&rdquo; klikt.
      </p>

      <h2>Welke cookies gebruiken we?</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-coal/20 text-coal">
              <th className="py-2 pr-3">Naam</th>
              <th className="py-2 pr-3">Aanbieder</th>
              <th className="py-2 pr-3">Doel</th>
              <th className="py-2 pr-3">Bewaartermijn</th>
              <th className="py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((c) => (
              <tr key={c.name} className="border-b border-coal/10 align-top">
                <td className="py-2 pr-3 font-mono">{c.name}</td>
                <td className="py-2 pr-3">{c.provider}</td>
                <td className="py-2 pr-3">{c.purpose}</td>
                <td className="py-2 pr-3">{c.duration}</td>
                <td className="py-2">{c.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Je keuze wijzigen</h2>
      <p>
        Je kan je toestemming op elk moment intrekken of aanpassen via{" "}
        <CookieSettingsButton className="font-semibold text-bronze underline" />. Je kan cookies ook verwijderen via de
        instellingen van je browser.
      </p>

      <h2>Meer informatie</h2>
      <p>
        Lees ook ons <Link href="/privacybeleid">privacybeleid</Link> of neem contact op via{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
