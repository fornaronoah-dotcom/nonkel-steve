import type { Metadata } from "next";
import { Ornament } from "@/components/ornament";
import { Checkout } from "@/components/order/checkout";
import { getActiveZones, getSettings } from "@/lib/menu";
import { getSlotDays } from "@/lib/slots";

export const metadata: Metadata = {
  title: "Afrekenen",
  robots: { index: false, follow: false },
};

// Tijdslots hangen af van het huidige uur: altijd vers renderen.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [settings, zones] = await Promise.all([getSettings(), getActiveZones()]);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 md:pt-16">
      <div className="text-center">
        <p className="font-script text-4xl text-bronze">Bijna klaar</p>
        <h1 className="font-display mt-2 text-5xl text-coal">Afrekenen</h1>
        <Ornament className="mt-5" />
      </div>
      <Checkout
        orderingEnabled={settings.orderingEnabled}
        pauseMessage={settings.pauseMessage}
        pickupEnabled={settings.pickupEnabled}
        deliveryEnabled={settings.deliveryEnabled && zones.length > 0}
        pickupDays={getSlotDays(settings.pickupLeadMin, settings.slotMinutes)}
        deliveryDays={getSlotDays(settings.deliveryLeadMin, settings.slotMinutes)}
        zones={zones.map((z) => ({ id: z.id, postcode: z.postcode, name: z.name, fee: z.fee, minOrder: z.minOrder }))}
      />
    </section>
  );
}
