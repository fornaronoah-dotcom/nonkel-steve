import { HOURS } from "@/lib/site";

const TZ = "Europe/Brussels";
const DAY_NAMES = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
// HOURS begint op maandag; Date.getDay() op zondag.
const byJsDay = [HOURS[6], ...HOURS.slice(0, 6)];

/** Datum/tijd-onderdelen van een moment in Brusselse tijd. */
function partsInBrussels(date: Date) {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => p.find((x) => x.type === t)!.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
  };
}

/** Maakt een Date voor een lokale Brusselse kloktijd. */
function brusselsTime(year: number, month: number, day: number, hour: number, minute: number) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const p = partsInBrussels(new Date(guess));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return new Date(guess - (asUtc - guess));
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const pad = (n: number) => String(n).padStart(2, "0");

export interface Slot {
  value: string; // ISO
  label: string; // "18:15"
}

export interface SlotDay {
  label: string; // "Vandaag", "Morgen", "Vrijdag 24/10"
  slots: Slot[];
}

/**
 * Beschikbare tijdslots binnen de openingsuren, voor vandaag en de eerstvolgende
 * open dag. `leadMin` = minimale tijd vanaf nu (bereiding/levering).
 */
export function getSlotDays(leadMin: number, slotMinutes: number, now = new Date()): SlotDay[] {
  const earliest = now.getTime() + leadMin * 60_000;
  const days: SlotDay[] = [];

  for (let offset = 0; offset < 8 && days.length < 2; offset++) {
    const d = partsInBrussels(new Date(now.getTime() + offset * 86_400_000));
    const hours = byJsDay[d.weekday].slot;
    if (!hours) continue;

    const slots: Slot[] = [];
    // Laatste slot een slot vóór sluitingstijd.
    for (let m = toMin(hours.open); m <= toMin(hours.close) - slotMinutes; m += slotMinutes) {
      const at = brusselsTime(d.year, d.month, d.day, Math.floor(m / 60), m % 60);
      if (at.getTime() < earliest) continue;
      slots.push({ value: at.toISOString(), label: `${pad(Math.floor(m / 60))}:${pad(m % 60)}` });
    }
    if (!slots.length) continue;

    const label =
      offset === 0
        ? "Vandaag"
        : offset === 1
          ? "Morgen"
          : `${DAY_NAMES[d.weekday][0].toUpperCase()}${DAY_NAMES[d.weekday].slice(1)} ${d.day}/${d.month}`;
    days.push({ label, slots });
  }
  return days;
}

/** Leesbaar tijdstip, bv. "vandaag om 18:15" of "vrijdag 24/10 om 18:15". */
export function formatSlot(iso: Date, now = new Date()) {
  const a = partsInBrussels(iso);
  const b = partsInBrussels(now);
  const tomorrow = partsInBrussels(new Date(now.getTime() + 86_400_000));
  const time = `${pad(a.hour)}:${pad(a.minute)}`;
  if (a.year === b.year && a.month === b.month && a.day === b.day) return `vandaag om ${time}`;
  if (a.year === tomorrow.year && a.month === tomorrow.month && a.day === tomorrow.day) return `morgen om ${time}`;
  return `${DAY_NAMES[a.weekday]} ${a.day}/${a.month} om ${time}`;
}
