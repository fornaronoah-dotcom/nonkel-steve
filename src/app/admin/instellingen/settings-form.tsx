"use client";

import { useState, useTransition } from "react";
import { CreditCard, Printer, Trash2 } from "lucide-react";
import { deleteZone, saveSettings, saveZone } from "@/app/actions/shop";

interface Settings {
  orderingEnabled: boolean;
  pauseMessage: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  pickupLeadMin: number;
  deliveryLeadMin: number;
  slotMinutes: number;
}

interface Zone {
  id: string;
  postcode: string;
  name: string;
  fee: number;
  minOrder: number;
  active: boolean;
}

const field = "w-full rounded-lg border-2 border-coal/15 bg-white px-3 py-2 outline-none focus:border-bronze";
const card = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-coal/5";
const eur = (c: number) => (c / 100).toFixed(2).replace(".", ",");

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-coal/20 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-gold after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      <span className="font-semibold text-coal">{label}</span>
    </label>
  );
}

function ZoneRow({ z }: { z?: Zone }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <form
      className="grid grid-cols-2 items-center gap-2 border-b border-coal/10 py-3 sm:grid-cols-[5rem_1fr_6rem_6rem_auto_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        start(async () => {
          const r = await saveZone({
            id: z?.id,
            postcode: String(f.get("postcode")),
            name: String(f.get("name")),
            fee: String(f.get("fee")),
            minOrder: String(f.get("minOrder")),
            active: f.get("active") === "on",
          });
          setMsg(r.success ? "Opgeslagen ✓" : (r.error ?? "Mislukt"));
          if (r.success && !z) form.reset();
        });
      }}
    >
      <input name="postcode" defaultValue={z?.postcode} placeholder="8450" required className={field} aria-label="Postcode" />
      <input name="name" defaultValue={z?.name} placeholder="Gemeente" required className={field} aria-label="Gemeente" />
      <input name="fee" defaultValue={z ? eur(z.fee) : ""} placeholder="Kost" required inputMode="decimal" className={field} aria-label="Leveringskost (€)" />
      <input name="minOrder" defaultValue={z ? eur(z.minOrder) : ""} placeholder="Min." required inputMode="decimal" className={field} aria-label="Minimumbedrag (€)" />
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" name="active" defaultChecked={z?.active ?? true} className="size-4 accent-emerald-600" /> Actief
      </label>
      <div className="flex items-center gap-1">
        <button type="submit" disabled={pending} className="rounded-full bg-coal px-3 py-1.5 text-sm font-bold text-gold">
          {z ? "Opslaan" : "Toevoegen"}
        </button>
        {z && (
          <button
            type="button"
            aria-label={`Zone ${z.name} verwijderen`}
            disabled={pending}
            onClick={() => window.confirm(`Zone ${z.name} verwijderen?`) && start(async () => void (await deleteZone(z.id)))}
            className="grid size-8 place-items-center rounded-full text-ink/50 hover:bg-sand hover:text-ketchup"
          >
            <Trash2 className="size-4" />
          </button>
        )}
        {!z && <span className="size-8" aria-hidden="true" />}
      </div>
      {msg && <p className="col-span-full text-sm text-ink/60">{msg}</p>}
    </form>
  );
}

export function SettingsForm({
  settings,
  zones,
  printer,
  mollie,
}: {
  settings: Settings;
  zones: Zone[];
  printer: { url: string | null; lastSeen: string | null; mac: string | null };
  mollie: "live" | "test" | "geen";
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [now] = useState(() => Date.now());
  const printerOnline = printer.lastSeen !== null && now - new Date(printer.lastSeen).getTime() < 2 * 60_000;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl text-coal">Instellingen</h1>

      <form
        className={`${card} space-y-5`}
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          start(async () => {
            const r = await saveSettings({
              orderingEnabled: f.get("orderingEnabled") === "on",
              pauseMessage: String(f.get("pauseMessage")),
              pickupEnabled: f.get("pickupEnabled") === "on",
              deliveryEnabled: f.get("deliveryEnabled") === "on",
              pickupLeadMin: Number(f.get("pickupLeadMin")),
              deliveryLeadMin: Number(f.get("deliveryLeadMin")),
              slotMinutes: Number(f.get("slotMinutes")),
            });
            setMsg(r.success ? "Opgeslagen ✓" : (r.error ?? "Mislukt"));
          });
        }}
      >
        <h2 className="font-display text-2xl text-coal">Online bestellen</h2>
        <Toggle name="orderingEnabled" label="Online bestellen staat open" defaultChecked={settings.orderingEnabled} />
        <label className="block text-sm font-semibold text-coal">
          Melding als bestellen gepauzeerd is
          <input name="pauseMessage" defaultValue={settings.pauseMessage} className={`${field} mt-1 font-normal`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Toggle name="pickupEnabled" label="Afhalen mogelijk" defaultChecked={settings.pickupEnabled} />
          <Toggle name="deliveryEnabled" label="Leveren mogelijk" defaultChecked={settings.deliveryEnabled} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold text-coal">
            Bereidingstijd afhalen (min)
            <input name="pickupLeadMin" type="number" min={5} max={240} defaultValue={settings.pickupLeadMin} className={`${field} mt-1`} />
          </label>
          <label className="block text-sm font-semibold text-coal">
            Tijd tot levering (min)
            <input name="deliveryLeadMin" type="number" min={10} max={240} defaultValue={settings.deliveryLeadMin} className={`${field} mt-1`} />
          </label>
          <label className="block text-sm font-semibold text-coal">
            Tijdslots per
            <select name="slotMinutes" defaultValue={settings.slotMinutes} className={`${field} mt-1`}>
              {[10, 15, 20, 30].map((m) => (
                <option key={m} value={m}>
                  {m} minuten
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-sm text-ink/60">Tijdslots volgen de openingsuren van de website.</p>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-full bg-coal px-5 py-2 font-bold text-gold">
            Opslaan
          </button>
          {msg && <span className="text-sm text-ink/60">{msg}</span>}
        </div>
      </form>

      <section className={card}>
        <h2 className="font-display text-2xl text-coal">Leverzones</h2>
        <p className="mt-1 text-sm text-ink/60">Per postcode: leveringskost en minimumbedrag (subtotaal), in euro.</p>
        <div className="mt-3 hidden grid-cols-[5rem_1fr_6rem_6rem_auto_auto] gap-2 text-xs font-bold uppercase tracking-wider text-ink/50 sm:grid">
          <span>Postcode</span>
          <span>Gemeente</span>
          <span>Kost €</span>
          <span>Min. €</span>
        </div>
        {zones.map((z) => (
          <ZoneRow key={z.id} z={z} />
        ))}
        <ZoneRow />
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="flex items-center gap-2 font-display text-2xl text-coal">
          <Printer className="size-6" aria-hidden="true" /> Bonnetjesprinter
        </h2>
        <p>
          Status:{" "}
          <strong className={printerOnline ? "text-emerald-700" : "text-ketchup"}>{printerOnline ? "online" : "offline"}</strong>
          {printer.lastSeen && (
            <span className="text-ink/60">
              {" "}
              · laatst gezien {new Date(printer.lastSeen).toLocaleString("nl-BE", { timeZone: "Europe/Brussels" })}
              {printer.mac && ` · ${printer.mac}`}
            </span>
          )}
        </p>
        {printer.url ? (
          <>
            <p className="text-sm text-ink/70">
              Star CloudPRNT-printer (bv. TSP143IV, mC-Print3): stel in de printer bij <em>CloudPRNT → Server URL</em> deze
              URL in, met een poll-interval van 5 seconden:
            </p>
            <code className="block break-all rounded-lg bg-sand px-3 py-2 text-sm">{printer.url}</code>
            <p className="text-sm text-ink/60">Houd deze URL geheim: ze bevat de sleutel van de printer.</p>
          </>
        ) : (
          <p className="text-sm font-semibold text-ketchup">PRINTER_KEY is niet ingesteld in de environment variables.</p>
        )}
      </section>

      <section className={`${card} space-y-2`}>
        <h2 className="flex items-center gap-2 font-display text-2xl text-coal">
          <CreditCard className="size-6" aria-hidden="true" /> Betalingen (Mollie)
        </h2>
        <p>
          Modus:{" "}
          <strong className={mollie === "live" ? "text-emerald-700" : "text-ketchup"}>
            {mollie === "live" ? "live" : mollie === "test" ? "testmodus (geen echte betalingen)" : "niet ingesteld"}
          </strong>
        </p>
        <p className="text-sm text-ink/60">Terugbetalingen en uitbetalingen volg je op in het Mollie-dashboard.</p>
      </section>
    </div>
  );
}
