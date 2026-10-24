import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Ornament } from "@/components/ornament";
import { CtaButton } from "@/components/cta";
import { ClearCart, RefreshWhilePending } from "@/components/order/order-status";
import { prisma } from "@/lib/prisma";
import { syncPayment } from "@/lib/orders";
import { euro } from "@/lib/money";
import { formatSlot } from "@/lib/slots";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Je bestelling",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const load = (token: string) => prisma.order.findUnique({ where: { token }, include: { items: true } });

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let order = await load(token);
  if (!order) notFound();

  // Webhook kan trager zijn dan de terugkeer van de klant: status meteen zelf nakijken.
  if (order.status === "open" && order.paymentId) {
    try {
      await syncPayment(order);
      order = (await load(token))!;
    } catch (error) {
      console.error("Betaalstatus ophalen mislukt:", error);
    }
  }

  const paid = order.paidAt !== null;
  const failed = order.status === "mislukt";
  const leveren = order.type === "leveren";
  const slot = formatSlot(order.scheduledFor, order.createdAt);
  const when = order.asap ? `zo snel mogelijk (rond ${slot.replace(/^vandaag om /, "")})` : slot;

  return (
    <section className="mx-auto max-w-2xl px-4 pb-24 pt-12 text-center sm:px-6 md:pt-16">
      {paid && <ClearCart />}
      {!paid && !failed && <RefreshWhilePending />}

      {paid ? (
        <CheckCircle2 className="mx-auto size-16 text-emerald-600" aria-hidden="true" />
      ) : failed ? (
        <XCircle className="mx-auto size-16 text-ketchup" aria-hidden="true" />
      ) : (
        <Clock className="mx-auto size-16 animate-pulse text-gold" aria-hidden="true" />
      )}
      <p className="font-script mt-4 text-4xl text-bronze">
        {paid ? "Smakelijk!" : failed ? "Oei…" : "Even geduld"}
      </p>
      <h1 className="font-display mt-2 text-4xl text-coal sm:text-5xl">
        {paid ? `Bestelling #${order.id} ontvangen` : failed ? "Betaling niet gelukt" : "Betaling wordt verwerkt"}
      </h1>
      <Ornament className="mt-5" />

      <p className="mt-6 text-lg text-ink/80">
        {paid ? (
          leveren ? (
            <>
              We leveren je bestelling <strong>{when}</strong> op {order.straat}, {order.postcode} {order.gemeente}.
            </>
          ) : (
            <>
              Je bestelling staat <strong>{when}</strong> klaar aan {site.street} in {site.city}.
            </>
          )
        ) : failed ? (
          "De betaling werd geannuleerd of is mislukt. Je winkelmand staat nog klaar, probeer gerust opnieuw."
        ) : (
          "We wachten op de bevestiging van je betaling. Deze pagina ververst vanzelf."
        )}
      </p>
      {paid && <p className="mt-2 text-ink/60">Je krijgt ook een bevestiging per e-mail op {order.email}.</p>}

      <div className="mt-10 rounded-3xl bg-white p-6 text-left shadow-sm sm:p-8">
        <ul className="divide-y divide-coal/10">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-2.5">
              <span>
                {i.quantity} × {i.name}
              </span>
              <span className="tabular-nums">{euro(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-coal/10 pt-3">
          {leveren && (
            <div className="flex justify-between">
              <dt>Levering</dt>
              <dd className="tabular-nums">{euro(order.deliveryFee)}</dd>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold">
            <dt>Totaal {paid && "(betaald)"}</dt>
            <dd className="font-display tabular-nums text-bronze">{euro(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {failed ? (
          <Link href="/afrekenen" className="btn btn-primary">
            Opnieuw proberen
          </Link>
        ) : (
          <CtaButton kind="order" label="Nog iets bestellen" />
        )}
        <CtaButton kind="call" variant="secondary" />
      </div>
    </section>
  );
}
