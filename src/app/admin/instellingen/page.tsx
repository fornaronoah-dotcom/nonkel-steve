import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getSettings } from "@/lib/menu";
import { SITE_URL } from "@/lib/site";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const [settings, zones] = await Promise.all([
    getSettings(),
    prisma.deliveryZone.findMany({ orderBy: { postcode: "asc" } }),
  ]);
  const mollieKey = process.env.MOLLIE_API_KEY ?? "";

  return (
    <SettingsForm
      settings={{
        orderingEnabled: settings.orderingEnabled,
        pauseMessage: settings.pauseMessage,
        pickupEnabled: settings.pickupEnabled,
        deliveryEnabled: settings.deliveryEnabled,
        pickupLeadMin: settings.pickupLeadMin,
        deliveryLeadMin: settings.deliveryLeadMin,
        slotMinutes: settings.slotMinutes,
      }}
      zones={zones}
      printer={{
        url: process.env.PRINTER_KEY ? `${SITE_URL}/api/cloudprnt/${process.env.PRINTER_KEY}` : null,
        lastSeen: settings.printerLastSeen?.toISOString() ?? null,
        mac: settings.printerMac,
      }}
      mollie={mollieKey.startsWith("live_") ? "live" : mollieKey.startsWith("test_") ? "test" : "geen"}
    />
  );
}
