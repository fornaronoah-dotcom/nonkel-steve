import Link from "next/link";
import { Logo } from "@/components/logo";
import { CtaPair } from "@/components/cta";
import { HoursTable } from "@/components/hours-table";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-coal text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 text-center sm:px-6 md:grid-cols-3">
        <div>
          <Link href="/" aria-label="Bie Nonkel Steve — naar home">
            <Logo light />
          </Link>
          <p className="mx-auto mt-5 max-w-xs text-white/75">
            Frituur in Bredene. Friet gebakken in ossenvet, snacks, burgers en gerechten. Afhalen of leveren.
          </p>
          <CtaPair dark center className="mt-6" />
        </div>

        <div>
          <h2 className="font-display text-xl text-gold">Contact</h2>
          <address className="mt-4 space-y-1.5 not-italic text-white/85">
            <p>{site.street}</p>
            <p>
              {site.postalCode} {site.city}
            </p>
            <p>
              <a href={site.phoneHref} className="hover:text-gold">
                {site.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className="break-all hover:text-gold">
                {site.email}
              </a>
            </p>
            <p className="pt-2 text-sm text-white/60">BTW {site.vat}</p>
          </address>
          <nav className="mt-6 flex flex-col items-center gap-2 text-white/85" aria-label="Footer">
            <Link href="/menu" className="hover:text-gold">
              Menu &amp; prijzen
            </Link>
            <Link href="/contact" className="hover:text-gold">
              Contact
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-xl text-gold">Openingsuren</h2>
          <div className="mx-auto mt-3 max-w-xs text-left text-white/85">
            <HoursTable light />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center text-sm text-white/60 sm:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link href="/privacybeleid" className="hover:text-white">
              Privacybeleid
            </Link>
            <Link href="/cookiebeleid" className="hover:text-white">
              Cookiebeleid
            </Link>
            <CookieSettingsButton className="hover:text-white" />
          </div>
          <a href="https://ysmo.be/" target="_blank" rel="noopener" className="hover:text-white">
            Website gemaakt door YSMO
          </a>
        </div>
      </div>
    </footer>
  );
}
