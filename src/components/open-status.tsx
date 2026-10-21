"use client";

import { useEffect, useState } from "react";
import { HOURS } from "@/lib/site";

// HOURS begint op maandag; Date.getDay() op zondag.
const byJsDay = [HOURS[6], ...HOURS.slice(0, 6)];

function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Brussels",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

function status(): { open: boolean; text: string } {
  const { day, minutes } = brusselsNow();
  const today = byJsDay[day].slot;
  if (today && minutes >= toMin(today.open) && minutes < toMin(today.close)) {
    return { open: true, text: `Nu open tot ${today.close}` };
  }
  if (today && minutes < toMin(today.open)) {
    return { open: false, text: `Gesloten · opent vandaag om ${today.open}` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = byJsDay[(day + i) % 7];
    if (next.slot) {
      const when = i === 1 ? "morgen" : next.day.toLowerCase();
      return { open: false, text: `Gesloten · opent ${when} om ${next.slot.open}` };
    }
  }
  return { open: false, text: "Gesloten" };
}

export function OpenStatus({ light = false }: { light?: boolean }) {
  const [s, setS] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    const update = () => setS(status());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold ${light ? "bg-white/10 text-white" : "bg-white text-coal shadow-sm"}`}
      aria-live="polite"
    >
      <span
        className={`size-2.5 rounded-full ${s === null ? "bg-current opacity-30" : s.open ? "bg-emerald-500 animate-pulse" : "bg-ketchup"}`}
        aria-hidden="true"
      />
      {s?.text ?? "Openingsuren laden…"}
    </span>
  );
}
