import { formatSlot } from "@/lib/slots";
import { site } from "@/lib/site";

/** Breedte in tekens: 42 past op 80 mm én 72 mm bonpapier (Font A). */
const W = 42;

type ReceiptOrder = {
  id: number;
  type: string;
  scheduledFor: Date;
  asap: boolean;
  naam: string;
  telefoon: string;
  straat: string | null;
  postcode: string | null;
  gemeente: string | null;
  opmerking: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paidAt: Date | null;
  createdAt: Date;
  items: { name: string; unitPrice: number; quantity: number }[];
};

/** Bonprinters kennen geen euroteken of accenten in platte tekst: naar ASCII. */
function ascii(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/€/g, "EUR")
    .replace(/[^\x20-\x7E\n]/g, "");
}

const money = (c: number) => (c / 100).toFixed(2).replace(".", ",");
const line = (ch = "-") => ch.repeat(W);
const center = (s: string) => " ".repeat(Math.max(0, Math.floor((W - s.length) / 2))) + s;
const cols = (left: string, right: string) => {
  const space = W - right.length - 1;
  const l = left.length > space ? left.slice(0, space) : left;
  return l + " ".repeat(W - l.length - right.length) + right;
};

function wrap(text: string, indent = "") {
  const out: string[] = [];
  let cur = indent;
  for (const word of text.split(/\s+/)) {
    if ((cur + word).length > W && cur.trim()) {
      out.push(cur.trimEnd());
      cur = indent;
    }
    cur += word + " ";
  }
  if (cur.trim()) out.push(cur.trimEnd());
  return out;
}

/** Bon als platte tekst (werkt op Star CloudPRNT `text/plain`, bruikbaar voor andere printers). */
export function renderReceipt(o: ReceiptOrder): string {
  const leveren = o.type === "leveren";
  const slot = formatSlot(o.scheduledFor, o.createdAt).toUpperCase();
  const when = o.asap ? `ZSM - ${slot.replace(/^VANDAAG OM /, "")}` : slot;
  const rows: string[] = [
    center(site.name.toUpperCase()),
    center(`${site.street}, ${site.postalCode} ${site.city}`),
    line("="),
    center(`BESTELLING #${o.id}`),
    center(leveren ? "*** LEVEREN ***" : "*** AFHALEN ***"),
    center(when),
    line("="),
  ];

  for (const it of o.items) {
    rows.push(cols(`${it.quantity} x ${it.name}`, money(it.unitPrice * it.quantity)));
  }
  rows.push(line());
  rows.push(cols("Subtotaal", money(o.subtotal)));
  if (leveren) rows.push(cols("Levering", money(o.deliveryFee)));
  rows.push(cols("TOTAAL EUR", money(o.total)));
  rows.push(center(o.paidAt ? "BETAALD (online)" : "NIET BETAALD"));
  rows.push(line());

  rows.push(`Klant: ${o.naam}`);
  rows.push(`Tel:   ${o.telefoon}`);
  if (leveren) {
    rows.push(`Adres: ${o.straat ?? ""}`);
    rows.push(`       ${o.postcode ?? ""} ${o.gemeente ?? ""}`);
  }
  if (o.opmerking) {
    rows.push(line());
    rows.push("OPMERKING:");
    rows.push(...wrap(o.opmerking, "  "));
  }
  rows.push(line());
  rows.push(
    center(
      new Intl.DateTimeFormat("nl-BE", { timeZone: "Europe/Brussels", dateStyle: "short", timeStyle: "short" }).format(
        o.createdAt,
      ),
    ),
  );
  rows.push("", "", "");
  return ascii(rows.join("\n"));
}
