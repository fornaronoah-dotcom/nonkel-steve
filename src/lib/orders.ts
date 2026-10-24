import "server-only";
import { createMollieClient, type MollieClient } from "@mollie/api-client";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { euro } from "@/lib/money";
import { formatSlot } from "@/lib/slots";
import { SITE_URL, site } from "@/lib/site";

export const ORDER_STATUSES = ["open", "betaald", "in_bereiding", "klaar", "afgerond", "geannuleerd", "mislukt"] as const;

let mollie: MollieClient | null = null;
export function getMollie() {
  if (!process.env.MOLLIE_API_KEY) return null;
  mollie ??= createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  return mollie;
}

/** Mollie kan localhost niet bereiken: webhook enkel op een publieke URL. */
export function webhookUrl() {
  return /localhost|127\.0\.0\.1/.test(SITE_URL) ? undefined : `${SITE_URL}/api/mollie/webhook`;
}

/**
 * Zet een bestelling op betaald (idempotent: enkel vanuit open/mislukt),
 * plaatst ze in de printwachtrij en mailt de klant.
 */
export async function markPaid(orderId: number) {
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: { in: ["open", "mislukt"] } },
    data: { status: "betaald", paidAt: new Date(), printStatus: "wachtrij" },
  });
  if (count === 1) await sendConfirmation(orderId);
}

/** Haalt de actuele betaalstatus op bij Mollie en werkt de bestelling bij. */
export async function syncPayment(order: { id: number; status: string; paymentId: string | null }) {
  const client = getMollie();
  if (!client || !order.paymentId || !["open", "mislukt"].includes(order.status)) return;

  const payment = await client.payments.get(order.paymentId);
  if (payment.status === "paid") {
    await markPaid(order.id);
  } else if (["failed", "canceled", "expired"].includes(payment.status)) {
    await prisma.order.updateMany({ where: { id: order.id, status: "open" }, data: { status: "mislukt" } });
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function sendConfirmation(orderId: number) {
  if (!process.env.RESEND_API_KEY) return;
  const o = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!o) return;

  const leveren = o.type === "leveren";
  const slot = formatSlot(o.scheduledFor, o.createdAt);
  const when = o.asap ? `zo snel mogelijk (rond ${slot.replace(/^vandaag om /, "")})` : slot;
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.quantity} × ${esc(i.name)}</td><td style="padding:6px 0;text-align:right">${euro(i.unitPrice * i.quantity)}</td></tr>`,
    )
    .join("");

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Bie Nonkel Steve <noreply@bienonkelsteve.be>",
      to: o.email,
      replyTo: process.env.CONTACT_EMAIL || site.email,
      subject: `Bestelling #${o.id} bevestigd — ${site.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;color:#23272b">
          <h2 style="color:#1c2024">Bedankt voor je bestelling, ${esc(o.naam)}!</h2>
          <p>We hebben je betaling ontvangen. Je bestelling <strong>#${o.id}</strong> wordt
          ${leveren ? `<strong>${when}</strong> geleverd op ${esc(o.straat ?? "")}, ${esc(o.postcode ?? "")} ${esc(o.gemeente ?? "")}` : `<strong>${when}</strong> klaargezet om af te halen aan ${site.street}, ${site.postalCode} ${site.city}`}.</p>
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}</table>
          <table style="width:100%;margin-top:8px">
            ${leveren ? `<tr><td>Levering</td><td style="text-align:right">${euro(o.deliveryFee)}</td></tr>` : ""}
            <tr><td><strong>Totaal (betaald)</strong></td><td style="text-align:right"><strong>${euro(o.total)}</strong></td></tr>
          </table>
          ${o.opmerking ? `<p><em>Opmerking:</em> ${esc(o.opmerking)}</p>` : ""}
          <p>Vragen? Bel ons op ${site.phone}.</p>
          <p style="color:#888;font-size:12px">${site.name} · ${site.street}, ${site.postalCode} ${site.city} · BTW ${site.vat}</p>
        </div>`,
    });
  } catch (error) {
    console.error("Bevestigingsmail mislukt:", error);
  }
}
