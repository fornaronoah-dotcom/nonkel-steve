"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const LINKS = [
  { href: "/admin/bestellingen", label: "Bestellingen" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/instellingen", label: "Instellingen" },
  { href: "/admin", label: "Berichten" },
];

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="sticky top-0 z-30 bg-coal text-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/admin/bestellingen" className="font-script text-3xl text-gold">
          Bie nonkel Steve
        </Link>
        <nav className="flex flex-1 flex-wrap gap-1" aria-label="Admin">
          {LINKS.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active ? "bg-gold text-coal" : "text-cream/80 hover:bg-white/10"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm font-semibold text-cream/70 hover:text-gold">
            Uitloggen
          </button>
        </form>
      </div>
    </header>
  );
}
