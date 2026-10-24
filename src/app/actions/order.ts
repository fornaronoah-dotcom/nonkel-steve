"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/menu";
import { mollieAmount } from "@/lib/money";
import { getMollie, markPaid, webhookUrl } from "@/lib/orders";
import { getSlotDays } from "@/lib/slots";
import { SITE_URL, site } from "@/lib/site";

export interface OrderInput {
  items: { productId: string; quantity: number }[];
  type: "afhalen" | "leveren";
  slot: string; // "asap" of ISO-tijdstip
  naam: string;
  telefoon: string;
  email: string;
  straat?: string;
  postcode?: string;
  gemeente?: string;
  opmerking?: string;
  akkoord: boolean;
}

export type OrderResult = { ok: true; redirect: string } | { ok: false; error: string };

const clean = (s: unknown, max: number) => String(s ?? "").trim().slice(0, max);

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const settings = await getSettings();
  if (!settings.orderingEnabled) return { ok: false, error: settings.pauseMessage };

  const type = input.type === "leveren" ? "leveren" : "afhalen";
  if (type === "afhalen" && !settings.pickupEnabled) return { ok: false, error: "Afhalen is momenteel niet mogelijk." };
  if (type === "leveren" && !settings.deliveryEnabled) return { ok: false, error: "Leveren is momenteel niet mogelijk." };

  // --- Producten: prijzen altijd uit de database, nooit uit de browser ---
  const wanted = new Map<string, number>();
  for (const it of input.items ?? []) {
    const q = Math.floor(Number(it.quantity));
    if (!it.productId || !Number.isFinite(q) || q < 1 || q > 30) return { ok: false, error: "Ongeldig aantal in je winkelmand." };
    wanted.set(it.productId, (wanted.get(it.productId) ?? 0) + q);
  }
  if (wanted.size === 0) return { ok: false, error: "Je winkelmand is leeg." };
  if (wanted.size > 60) return { ok: false, error: "Te veel verschillende producten." };

  const products = await prisma.product.findMany({
    where: { id: { in: [...wanted.keys()] }, active: true, category: { active: true } },
  });
  const missing = [...wanted.keys()].filter((id) => !products.some((p) => p.id === id));
  if (missing.length) return { ok: false, error: "Een product in je winkelmand bestaat niet meer. Kijk je mand even na." };
  const soldOut = products.filter((p) => !p.available);
  if (soldOut.length) {
    return { ok: false, error: `Helaas uitverkocht: ${soldOut.map((p) => p.name).join(", ")}. Haal het uit je mand.` };
  }
  const lines = products.map((p) => ({ productId: p.id, name: p.name, unitPrice: p.price, quantity: wanted.get(p.id)! }));
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  // --- Tijdstip ---
  const lead = type === "leveren" ? settings.deliveryLeadMin : settings.pickupLeadMin;
  const days = getSlotDays(lead, settings.slotMinutes);
  const allSlots = days.flatMap((d) => d.slots.map((s) => s.value));
  const asap = input.slot === "asap";
  if (asap && days[0]?.label !== "Vandaag") return { ok: false, error: "Zo snel mogelijk kan enkel vandaag. Kies een tijdstip." };
  const scheduled = asap ? allSlots[0] : allSlots.find((s) => s === input.slot);
  if (!scheduled) return { ok: false, error: "Dit tijdstip is niet meer beschikbaar. Kies een ander tijdstip." };

  // --- Klant ---
  const naam = clean(input.naam, 100);
  const telefoon = clean(input.telefoon, 30);
  const email = clean(input.email, 200);
  const opmerking = clean(input.opmerking, 500) || null;
  if (!naam) return { ok: false, error: "Vul je naam in." };
  if (!/^[+0-9 ()./-]{8,}$/.test(telefoon)) return { ok: false, error: "Vul een geldig telefoonnummer in." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Vul een geldig e-mailadres in." };
  if (!input.akkoord) return { ok: false, error: "Ga akkoord met de voorwaarden en het privacybeleid." };

  // --- Levering ---
  let deliveryFee = 0;
  let zoneId: string | null = null;
  let straat: string | null = null;
  let postcode: string | null = null;
  let gemeente: string | null = null;
  if (type === "leveren") {
    straat = clean(input.straat, 150);
    postcode = clean(input.postcode, 10);
    gemeente = clean(input.gemeente, 80);
    if (!straat || !gemeente) return { ok: false, error: "Vul je volledige leveradres in." };
    const zone = await prisma.deliveryZone.findFirst({ where: { postcode, active: true } });
    if (!zone) return { ok: false, error: `We leveren (nog) niet in ${postcode || "deze postcode"}. Afhalen kan wel!` };
    if (subtotal < zone.minOrder) {
      return { ok: false, error: `Het minimumbedrag voor levering in ${zone.name} is ${(zone.minOrder / 100).toFixed(2).replace(".", ",")} euro.` };
    }
    deliveryFee = zone.fee;
    zoneId = zone.id;
  }

  const order = await prisma.order.create({
    data: {
      token: randomBytes(18).toString("base64url"),
      type,
      scheduledFor: new Date(scheduled),
      asap,
      naam,
      telefoon,
      email,
      straat,
      postcode,
      gemeente,
      zoneId,
      opmerking,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      items: { create: lines },
    },
  });
  const confirmUrl = `/bestelling/${order.token}`;

  const mollie = getMollie();
  if (!mollie) {
    // Zonder Mollie-sleutel: enkel lokaal testen (betaling wordt gesimuleerd).
    if (process.env.NODE_ENV === "production") {
      await prisma.order.update({ where: { id: order.id }, data: { status: "mislukt" } });
      return { ok: false, error: "Online betalen is nog niet ingesteld. Bel ons om te bestellen." };
    }
    await markPaid(order.id);
    return { ok: true, redirect: confirmUrl };
  }

  try {
    const payment = await mollie.payments.create({
      amount: { currency: "EUR", value: mollieAmount(order.total) },
      description: `Bestelling #${order.id} - ${site.name}`,
      redirectUrl: `${SITE_URL}${confirmUrl}`,
      webhookUrl: webhookUrl(),
      metadata: { orderId: order.id },
    });
    await prisma.order.update({ where: { id: order.id }, data: { paymentId: payment.id } });
    const checkout = payment.getCheckoutUrl();
    if (!checkout) throw new Error("Geen checkout-URL van Mollie");
    return { ok: true, redirect: checkout };
  } catch (error) {
    console.error("Mollie-betaling aanmaken mislukt:", error);
    await prisma.order.update({ where: { id: order.id }, data: { status: "mislukt" } });
    return { ok: false, error: "De betaling kon niet gestart worden. Probeer opnieuw of bel ons." };
  }
}
