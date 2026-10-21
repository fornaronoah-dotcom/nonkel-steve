import { HOURS, SITE_URL, site } from "@/lib/site";

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: site.name,
    url: SITE_URL,
    telephone: site.phoneIntl,
    email: site.email,
    vatID: site.vat,
    image: `${SITE_URL}/opengraph-image`,
    servesCuisine: ["Belgische frituur", "Friet", "Snacks", "Burgers"],
    priceRange: "€",
    acceptsReservations: false,
    hasMenu: `${SITE_URL}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      postalCode: site.postalCode,
      addressLocality: site.city,
      addressCountry: "BE",
    },
    areaServed: ["Bredene", "Oostende", "De Haan"],
    openingHoursSpecification: HOURS.filter((h) => h.slot).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${h.schema}`,
      opens: h.slot!.open,
      closes: h.slot!.close,
    })),
    potentialAction: {
      "@type": "OrderAction",
      target: site.orderUrl,
      deliveryMethod: [
        "http://purl.org/goodrelations/v1#DeliveryModePickUp",
        "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
