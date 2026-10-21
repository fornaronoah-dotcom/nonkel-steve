"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { submitContact, type ContactState } from "@/app/actions/contact";

const input =
  "mt-1.5 w-full rounded-xl border-2 border-coal/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-bronze";

export function ContactForm({ page }: { page: "homepage" | "menu" | "contact" }) {
  const [state, action, pending] = useActionState<ContactState | undefined, FormData>(submitContact, undefined);

  if (state?.success) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-3xl bg-white p-8 shadow-sm" role="status">
        <CheckCircle2 className="size-10 text-emerald-600" aria-hidden="true" />
        <p className="font-display text-2xl text-coal">Bedankt, je bericht is verstuurd!</p>
        <p className="text-ink/75">We antwoorden zo snel mogelijk. Liever meteen antwoord? Bel ons tijdens de openingsuren.</p>
      </div>
    );
  }

  return (
    <form action={action} className="reveal rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <input type="hidden" name="page" value={page} />
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block font-semibold text-coal">
          Naam *
          <input name="naam" required autoComplete="name" className={input} />
        </label>
        <label className="block font-semibold text-coal">
          Telefoon
          <input name="telefoon" type="tel" autoComplete="tel" className={input} />
        </label>
        <label className="block font-semibold text-coal sm:col-span-2">
          E-mail *
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="block font-semibold text-coal sm:col-span-2">
          Bericht *
          <textarea name="bericht" required rows={4} className={input} placeholder="Je vraag of opmerking…" />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-ink/80">
        <input type="checkbox" name="privacy" required className="mt-0.5 size-5 shrink-0 accent-bronze" />
        <span>
          Ik ga akkoord dat mijn gegevens gebruikt worden om mijn vraag te beantwoorden, volgens het{" "}
          <Link href="/privacybeleid" className="font-semibold text-bronze underline">
            privacybeleid
          </Link>
          .
        </span>
      </label>

      {state?.error && (
        <p className="mt-4 rounded-xl bg-ketchup/10 px-4 py-3 font-semibold text-ketchup" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full sm:w-auto">
        <Send className="size-5" strokeWidth={2.4} aria-hidden="true" />
        {pending ? "Versturen…" : "Verstuur bericht"}
      </button>
      <p className="mt-3 text-sm text-ink/60">Voor bestellingen gebruik je best de online bestelpagina of bel je ons.</p>
    </form>
  );
}
