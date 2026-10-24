"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bike, Lock, PauseCircle, ShoppingBag, Store } from "lucide-react";
import { placeOrder } from "@/app/actions/order";
import { useCart } from "@/components/order/cart";
import { euro } from "@/lib/money";
import type { SlotDay } from "@/lib/slots";
import { site } from "@/lib/site";

interface Zone {
  id: string;
  postcode: string;
  name: string;
  fee: number;
  minOrder: number;
}

const input =
  "mt-1.5 w-full rounded-xl border-2 border-coal/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-bronze";

export function Checkout({
  orderingEnabled,
  pauseMessage,
  pickupEnabled,
  deliveryEnabled,
  pickupDays,
  deliveryDays,
  zones,
}: {
  orderingEnabled: boolean;
  pauseMessage: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  pickupDays: SlotDay[];
  deliveryDays: SlotDay[];
  zones: Zone[];
}) {
  const { lines, subtotal, ready, setOpen } = useCart();
  const [type, setType] = useState<"afhalen" | "leveren">(pickupEnabled ? "afhalen" : "leveren");
  const [slot, setSlot] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const days = type === "leveren" ? deliveryDays : pickupDays;
  const canAsap = days[0]?.label === "Vandaag";
  const selectedSlot = slot || (canAsap ? "asap" : days[0]?.slots[0]?.value ?? "");
  const zone = zones.find((z) => z.id === zoneId);
  const fee = type === "leveren" && zone ? zone.fee : 0;
  const belowMin = type === "leveren" && zone ? subtotal < zone.minOrder : false;

  if (!ready) return <div className="mt-12 h-64 animate-pulse rounded-3xl bg-sand" />;

  if (!orderingEnabled) {
    return (
      <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-sm">
        <PauseCircle className="size-10 text-ketchup" aria-hidden="true" />
        <p className="font-semibold text-coal">{pauseMessage}</p>
        <a href={site.phoneHref} className="btn btn-primary">
          Bel {site.phone}
        </a>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-sm">
        <ShoppingBag className="size-10 text-gold" aria-hidden="true" />
        <p className="text-lg text-ink/80">Je winkelmand is leeg.</p>
        <Link href="/menu" className="btn btn-primary">
          Naar het menu
        </Link>
      </div>
    );
  }

  if (!days.length && !(type === "afhalen" ? deliveryDays : pickupDays).length) {
    return (
      <p className="mx-auto mt-12 max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
        Er zijn momenteel geen tijdstippen beschikbaar. Bel ons op {site.phone}.
      </p>
    );
  }

  function submit(form: FormData) {
    setError("");
    startTransition(async () => {
      const res = await placeOrder({
        items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
        type,
        slot: selectedSlot,
        naam: String(form.get("naam") ?? ""),
        telefoon: String(form.get("telefoon") ?? ""),
        email: String(form.get("email") ?? ""),
        straat: String(form.get("straat") ?? ""),
        postcode: zone?.postcode,
        gemeente: zone?.name,
        opmerking: String(form.get("opmerking") ?? ""),
        akkoord: form.get("akkoord") === "on",
      });
      if (res.ok) window.location.href = res.redirect;
      else setError(res.error);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        // onSubmit i.p.v. action: React wist anders alle velden na een foutmelding.
        e.preventDefault();
        submit(new FormData(e.currentTarget));
      }}
      className="mt-12 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]"
    >
      <div className="space-y-6">
        {/* Afhalen of leveren */}
        <fieldset className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <legend className="sr-only">Afhalen of leveren</legend>
          <h2 className="font-display text-2xl text-coal">1. Afhalen of leveren?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: "afhalen", label: "Afhalen", sub: `${site.street}, ${site.city}`, icon: Store, enabled: pickupEnabled && pickupDays.length > 0 },
                { value: "leveren", label: "Leveren", sub: "Aan huis in de regio", icon: Bike, enabled: deliveryEnabled && deliveryDays.length > 0 },
              ] as const
            ).map((o) => (
              <label
                key={o.value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl p-4 ring-2 transition ${type === o.value ? "bg-gold/20 ring-gold" : "ring-coal/10 hover:ring-gold/60"} ${o.enabled ? "" : "pointer-events-none opacity-40"}`}
              >
                <input
                  type="radio"
                  name="type"
                  value={o.value}
                  checked={type === o.value}
                  disabled={!o.enabled}
                  onChange={() => {
                    setType(o.value);
                    setSlot("");
                  }}
                  className="sr-only"
                />
                <o.icon className="size-7 shrink-0 text-bronze" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-coal">{o.label}</span>
                  <span className="block text-sm text-ink/60">{o.enabled ? o.sub : "Momenteel niet mogelijk"}</span>
                </span>
              </label>
            ))}
          </div>

          {type === "leveren" && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block font-semibold text-coal sm:col-span-2">
                Straat en huisnummer *
                <input name="straat" required autoComplete="street-address" className={input} />
              </label>
              <label className="block font-semibold text-coal sm:col-span-2">
                Gemeente *
                <select required value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={input}>
                  <option value="">Kies je gemeente</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.postcode} {z.name} — levering {euro(z.fee)}, min. {euro(z.minOrder)}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-sm font-normal text-ink/60">
                  Staat je gemeente er niet bij? Dan leveren we daar (nog) niet; afhalen kan altijd.
                </span>
              </label>
            </div>
          )}
        </fieldset>

        {/* Tijdstip */}
        <fieldset className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <legend className="sr-only">Tijdstip</legend>
          <h2 className="font-display text-2xl text-coal">
            2. Wanneer {type === "leveren" ? "leveren" : "afhalen"}?
          </h2>
          <label className="mt-4 block font-semibold text-coal">
            Tijdstip *
            <select value={selectedSlot} onChange={(e) => setSlot(e.target.value)} className={input} required>
              {canAsap && <option value="asap">Zo snel mogelijk (vanaf {days[0].slots[0].label})</option>}
              {days.map((d) => (
                <optgroup key={d.label} label={d.label}>
                  {d.slots.map((s) => (
                    <option key={s.value} value={s.value}>
                      {d.label} {s.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </fieldset>

        {/* Gegevens */}
        <fieldset className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <legend className="sr-only">Je gegevens</legend>
          <h2 className="font-display text-2xl text-coal">3. Je gegevens</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block font-semibold text-coal">
              Naam *
              <input name="naam" required autoComplete="name" className={input} />
            </label>
            <label className="block font-semibold text-coal">
              Telefoon *
              <input name="telefoon" type="tel" required autoComplete="tel" className={input} />
            </label>
            <label className="block font-semibold text-coal sm:col-span-2">
              E-mail * <span className="font-normal text-ink/60">(voor je bevestiging)</span>
              <input name="email" type="email" required autoComplete="email" className={input} />
            </label>
            <label className="block font-semibold text-coal sm:col-span-2">
              Opmerking
              <textarea
                name="opmerking"
                rows={2}
                maxLength={500}
                placeholder="Bv. saus apart, geen zout, belletje werkt niet…"
                className={input}
              />
            </label>
          </div>
        </fieldset>
      </div>

      {/* Overzicht */}
      <aside className="rounded-3xl bg-coal p-6 text-cream shadow-xl sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-script text-4xl text-gold">Je bestelling</h2>
        <ul className="mt-4 divide-y divide-white/10">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-4 py-2.5">
              <span>
                {l.quantity} × {l.name}
              </span>
              <span className="tabular-nums">{euro(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setOpen(true)} className="mt-2 text-sm font-semibold text-gold underline">
          Bestelling aanpassen
        </button>
        <dl className="mt-5 space-y-1.5 border-t border-white/15 pt-4">
          <div className="flex justify-between">
            <dt>Subtotaal</dt>
            <dd className="tabular-nums">{euro(subtotal)}</dd>
          </div>
          {type === "leveren" && (
            <div className="flex justify-between">
              <dt>Levering</dt>
              <dd className="tabular-nums">{zone ? euro(fee) : "kies je gemeente"}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-2 text-xl">
            <dt className="font-semibold">Totaal</dt>
            <dd className="font-display text-3xl text-gold">{euro(subtotal + fee)}</dd>
          </div>
        </dl>

        {belowMin && zone && (
          <p className="mt-4 rounded-xl bg-ketchup/20 px-4 py-3 text-sm">
            Minimumbedrag voor levering in {zone.name}: {euro(zone.minOrder)}. Nog {euro(zone.minOrder - subtotal)} te gaan.
          </p>
        )}

        <label className="mt-5 flex items-start gap-3 text-sm text-cream/85">
          <input type="checkbox" name="akkoord" required className="mt-0.5 size-5 shrink-0 accent-gold" />
          <span>
            Ik ga akkoord met de{" "}
            <Link href="/voorwaarden" className="font-semibold text-gold underline">
              voorwaarden
            </Link>{" "}
            en het{" "}
            <Link href="/privacybeleid" className="font-semibold text-gold underline">
              privacybeleid
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-ketchup px-4 py-3 font-semibold text-white" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending || belowMin} className="btn btn-primary mt-6 w-full disabled:opacity-60">
          <Lock className="size-5" aria-hidden="true" />
          {pending ? "Even geduld…" : `Betalen ${euro(subtotal + fee)}`}
        </button>
        <p className="mt-3 text-center text-xs text-cream/60">
          Veilig betalen via Mollie: Bancontact, Payconiq, kredietkaart en meer.
        </p>
      </aside>
    </form>
  );
}
