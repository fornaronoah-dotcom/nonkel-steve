"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bike, Printer, RefreshCw, Store } from "lucide-react";
import { refundOrder, reprintOrder, setOrderStatus } from "@/app/actions/shop";
import { euro } from "@/lib/money";

interface Order {
  id: number;
  status: string;
  type: string;
  scheduledFor: Date;
  asap: boolean;
  naam: string;
  telefoon: string;
  email: string;
  straat: string | null;
  postcode: string | null;
  gemeente: string | null;
  opmerking: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paidAt: Date | null;
  printStatus: string | null;
  createdAt: Date;
  items: { id: string; name: string; unitPrice: number; quantity: number }[];
}

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Wacht op betaling", cls: "bg-gray-100 text-gray-600" },
  mislukt: { label: "Betaling mislukt", cls: "bg-gray-100 text-gray-500" },
  betaald: { label: "Nieuw", cls: "bg-gold text-coal" },
  in_bereiding: { label: "In bereiding", cls: "bg-orange-100 text-orange-800" },
  klaar: { label: "Klaar", cls: "bg-emerald-100 text-emerald-800" },
  afgerond: { label: "Afgerond", cls: "bg-coal/10 text-coal" },
  geannuleerd: { label: "Geannuleerd", cls: "bg-ketchup/10 text-ketchup" },
};

const NEXT: Record<string, { status: string; label: string } | undefined> = {
  betaald: { status: "in_bereiding", label: "Start bereiding" },
  in_bereiding: { status: "klaar", label: "Klaar" },
  klaar: { status: "afgerond", label: "Afgehaald / geleverd" },
};

const PRINT: Record<string, string> = {
  wachtrij: "In printwachtrij",
  bezig: "Wordt geprint…",
  geprint: "Geprint",
  fout: "Printfout",
};

const time = (d: Date) =>
  new Date(d).toLocaleTimeString("nl-BE", { timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit" });
const day = (d: Date) =>
  new Date(d).toLocaleDateString("nl-BE", { timeZone: "Europe/Brussels", weekday: "short", day: "numeric", month: "short" });
const isToday = (d: Date) => day(d) === day(new Date());

type Filter = "actief" | "vandaag" | "alles";

function OrderCard({ o }: { o: Order }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const st = STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100" };
  const next = NEXT[o.status];
  const paid = o.paidAt !== null;
  const leveren = o.type === "leveren";

  const run = (fn: () => Promise<{ success: boolean; error?: string }>) =>
    start(async () => {
      setError("");
      const r = await fn();
      if (!r.success) setError(r.error ?? "Mislukt");
    });

  return (
    <article className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${o.status === "betaald" ? "ring-2 ring-gold" : "ring-coal/5"}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl text-coal">#{o.id}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-coal">
            {leveren ? <Bike className="size-4" aria-hidden="true" /> : <Store className="size-4" aria-hidden="true" />}
            {leveren ? "Leveren" : "Afhalen"} · {isToday(o.scheduledFor) ? "" : `${day(o.scheduledFor)} `}
            {o.asap ? `zsm (${time(o.scheduledFor)})` : time(o.scheduledFor)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
          {paid && o.printStatus && (
            <span className={`flex items-center gap-1 text-xs ${o.printStatus === "fout" ? "text-ketchup" : "text-ink/50"}`}>
              <Printer className="size-3.5" aria-hidden="true" /> {PRINT[o.printStatus] ?? o.printStatus}
            </span>
          )}
        </div>
      </header>

      <ul className="mt-4 space-y-1 border-y border-coal/10 py-3">
        {o.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-3">
            <span>
              <strong>{i.quantity}×</strong> {i.name}
            </span>
            <span className="tabular-nums text-ink/60">{euro(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      {o.opmerking && (
        <p className="mt-3 rounded-lg bg-gold/20 px-3 py-2 text-sm">
          <strong>Opmerking:</strong> {o.opmerking}
        </p>
      )}

      <div className="mt-3 grid gap-1 text-sm text-ink/80">
        <p>
          <strong>{o.naam}</strong> ·{" "}
          <a href={`tel:${o.telefoon}`} className="underline">
            {o.telefoon}
          </a>
        </p>
        {leveren && (
          <p>
            {o.straat}, {o.postcode} {o.gemeente}
          </p>
        )}
        <p className="text-ink/50">
          Besteld {day(o.createdAt)} {time(o.createdAt)} · {paid ? "betaald" : "niet betaald"} ·{" "}
          <strong className="text-ink">{euro(o.total)}</strong>
        </p>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-ketchup">{error}</p>}

      {paid && o.status !== "geannuleerd" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {next && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setOrderStatus(o.id, next.status))}
              className="rounded-full bg-coal px-4 py-2 text-sm font-bold text-gold disabled:opacity-50"
            >
              {next.label}
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => reprintOrder(o.id))}
            className="rounded-full px-4 py-2 text-sm font-semibold text-coal ring-1 ring-coal/20 hover:bg-sand"
          >
            Opnieuw printen
          </button>
          {o.status !== "afgerond" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (window.confirm(`Bestelling #${o.id} annuleren en ${euro(o.total)} terugbetalen?`)) run(() => refundOrder(o.id));
              }}
              className="ml-auto text-sm font-semibold text-ketchup hover:underline"
            >
              Annuleren &amp; terugbetalen
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export function OrdersBoard({
  orders,
  printerOnline,
  orderingEnabled,
}: {
  orders: Order[];
  printerOnline: boolean;
  orderingEnabled: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("actief");
  const [refreshing, startRefresh] = useTransition();

  // Elke 20 s verversen, zodat nieuwe bestellingen vanzelf verschijnen.
  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), 20_000);
    return () => window.clearInterval(id);
  }, [router]);

  const shown = orders.filter((o) => {
    if (filter === "actief") return ["betaald", "in_bereiding", "klaar"].includes(o.status);
    if (filter === "vandaag") return o.paidAt !== null && isToday(o.scheduledFor);
    return true;
  });
  if (filter === "actief") shown.sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor));

  const todayPaid = orders.filter((o) => o.paidAt && isToday(o.createdAt) && o.status !== "geannuleerd");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-coal">Bestellingen</h1>
          <p className="mt-1 text-ink/60">
            Vandaag: {todayPaid.length} bestellingen · {euro(todayPaid.reduce((s, o) => s + o.total, 0))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${printerOnline ? "bg-emerald-100 text-emerald-800" : "bg-ketchup/10 text-ketchup"}`}
          >
            <Printer className="size-4" aria-hidden="true" />
            Printer {printerOnline ? "online" : "offline"}
          </span>
          {!orderingEnabled && (
            <Link href="/admin/instellingen" className="rounded-full bg-ketchup px-3 py-1.5 font-semibold text-white">
              Online bestellen gepauzeerd
            </Link>
          )}
          <button
            type="button"
            onClick={() => startRefresh(() => router.refresh())}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold ring-1 ring-coal/15"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" /> Vernieuwen
          </button>
        </div>
      </header>

      <div className="mt-6 flex gap-2" role="tablist">
        {(
          [
            ["actief", "Actief"],
            ["vandaag", "Vandaag"],
            ["alles", "Alles (14 dagen)"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-coal/15 ${filter === value ? "bg-coal text-white" : "bg-white text-coal hover:bg-sand"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-10 text-center text-ink/60">Geen bestellingen.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((o) => (
            <OrderCard key={o.id} o={o} />
          ))}
        </div>
      )}
    </div>
  );
}
