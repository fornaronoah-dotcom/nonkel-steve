"use client";

import { MapPin } from "lucide-react";
import { setConsent, useConsent } from "@/components/cookie-consent";
import { site } from "@/lib/site";

/** Google Maps laadt pas na cookietoestemming; anders een klik-placeholder. */
export function MapEmbed() {
  const consent = useConsent();

  if (consent === "accepted") {
    return (
      <iframe
        title={`Kaart: ${site.name}, ${site.street}, ${site.city}`}
        src={site.mapsEmbed}
        className="h-full min-h-72 w-full rounded-3xl border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="reveal checker flex h-full min-h-72 flex-col items-center justify-center gap-4 rounded-3xl bg-sand p-6 text-center">
      <MapPin className="size-10 text-bronze" strokeWidth={2.2} aria-hidden="true" />
      <p className="max-w-xs text-sm text-ink/80">
        De kaart wordt geladen via Google Maps. Daarvoor hebben we je toestemming voor cookies nodig.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn btn-secondary" onClick={() => setConsent("accepted")}>
          Kaart tonen
        </button>
        <a href={site.mapsUrl} target="_blank" rel="noopener" className="btn btn-primary">
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
