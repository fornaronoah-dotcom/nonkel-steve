"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { CtaButton } from "@/components/cta";
import { site } from "@/lib/site";
import { lockScroll } from "@/components/smooth-scroll";
import { useCart } from "@/components/order/cart";

// 'Home' staat bewust niet in de navigatie: het logo linkt naar home.
const links = [
  { href: "/menu", label: "Menu" },
  { href: "/#uren", label: "Openingsuren" },
  { href: "/contact", label: "Contact" },
];

function CartButton({ className = "" }: { className?: string }) {
  const { count, ready, setOpen } = useCart();
  if (!ready || count === 0) return null;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`relative grid size-11 place-items-center rounded-full text-gold ring-1 ring-gold/60 transition hover:bg-gold hover:text-coal ${className}`}
      aria-label={`Winkelmand openen, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <ShoppingBag className="size-5" strokeWidth={2.2} aria-hidden="true" />
      <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-coal ring-2 ring-coal">
        {count}
      </span>
    </button>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-coal transition-shadow ${scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.25)]" : ""}`}
      >
        {/* Logo in het midden, zoals op het uithangbord */}
        <nav
          className="mx-auto grid max-w-6xl grid-cols-[2.75rem_1fr_2.75rem] items-center gap-4 px-4 py-3 sm:px-6 md:grid-cols-[1fr_auto_1fr]"
          aria-label="Hoofdnavigatie"
        >
          <div className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`nav-link font-semibold transition-colors hover:text-gold ${pathname === l.href ? "text-gold" : "text-cream/90"}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="md:hidden">
            <CartButton />
          </div>
          <Link href="/" aria-label="Bie Nonkel Steve — naar home" className="justify-self-center">
            <Logo light />
          </Link>
          <div className="hidden items-center justify-end gap-3 md:flex">
            <CartButton />
            <CtaButton kind="order" />
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-gold ring-1 ring-gold/60 md:hidden"
            aria-label="Menu openen"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" strokeWidth={2.4} aria-hidden="true" />
          </button>
        </nav>
        <div className="gold-rule" aria-hidden="true" />
      </header>

      <div className={`nav-overlay ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        id="mobile-drawer"
        className={`nav-drawer ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)} aria-label="Bie Nonkel Steve — naar home">
            <Logo />
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-coal text-white"
            aria-label="Menu sluiten"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Mobiele navigatie">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-coal/10 py-4 font-display text-2xl text-coal"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <CtaButton kind="order" />
          <CtaButton kind="call" variant="secondary" />
          <p className="mt-2 text-sm text-ink/70">
            {site.street}, {site.postalCode} {site.city}
          </p>
        </div>
      </aside>
    </>
  );
}
