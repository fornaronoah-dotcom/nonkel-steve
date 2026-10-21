"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const KEY = "cookie-consent";
const EVENT = "cookie-consent-change";
export type Consent = "pending" | "accepted" | "rejected";

function readConsent(): Consent {
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === "accepted" || stored === "rejected" ? stored : "pending";
  } catch {
    return "pending";
  }
}

function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function setConsent(value: Consent) {
  try {
    if (value === "pending") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useConsent() {
  return useSyncExternalStore(subscribeConsent, readConsent, () => "pending" as Consent);
}

/** Opent de banner opnieuw zodat de bezoeker de keuze kan herzien (GDPR). */
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => setConsent("pending")}>
      Cookie-instellingen
    </button>
  );
}

export function CookieConsent() {
  const consent = useConsent();

  return (
    <>
      {/* GA laadt pas na toestemming */}
      {consent === "accepted" && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {consent === "pending" && (
        <div className="cookie-banner rounded-2xl bg-coal p-5 text-white shadow-2xl" role="dialog" aria-label="Cookietoestemming">
          <p className="text-sm leading-relaxed text-white/90">
            We gebruiken analytische cookies (Google Analytics) om onze website te verbeteren, en Google Maps voor
            de routekaart. Die laden we alleen als je akkoord gaat. Meer info in ons{" "}
            <Link href="/cookiebeleid" className="font-semibold text-gold underline">
              cookiebeleid
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setConsent("accepted")} className="btn btn-primary">
              Accepteren
            </button>
            <button type="button" onClick={() => setConsent("rejected")} className="btn btn-light">
              Weigeren
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { setConsent };
