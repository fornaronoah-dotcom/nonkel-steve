"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/order/cart";
import { lockScroll } from "@/components/smooth-scroll";
import { euro } from "@/lib/money";

/** Winkelmand die van rechts inschuift (zelfde stijl als het mobiele menu). */
export function CartDrawer() {
  const { lines, subtotal, count, open, setOpen, setQuantity } = useCart();

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <>
      <div className={`nav-overlay ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        className={`nav-drawer ${open ? "is-open" : ""} !w-[min(92vw,420px)]`}
        aria-hidden={!open}
        inert={!open}
        aria-label="Winkelmand"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-coal">Je bestelling</h2>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-coal text-gold"
            aria-label="Winkelmand sluiten"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="my-auto flex flex-col items-center text-center text-ink/70">
            <ShoppingBag className="size-12 text-gold" aria-hidden="true" />
            <p className="mt-4">Je winkelmand is nog leeg.</p>
            <button type="button" className="btn btn-secondary mt-6" onClick={() => setOpen(false)}>
              Verder kiezen
            </button>
          </div>
        ) : (
          <>
            <ul className="-mx-2 mt-6 flex-1 divide-y divide-coal/10 overflow-y-auto px-2" data-lenis-prevent>
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{l.name}</p>
                    <p className="text-sm text-ink/60">{euro(l.price)} / stuk</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(l.id, l.quantity - 1)}
                      className="grid size-8 place-items-center rounded-full ring-1 ring-coal/20 hover:bg-sand"
                      aria-label={l.quantity === 1 ? `${l.name} verwijderen` : `Eén ${l.name} minder`}
                    >
                      {l.quantity === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
                    </button>
                    <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">
                      {l.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(l.id, l.quantity + 1)}
                      className="grid size-8 place-items-center rounded-full ring-1 ring-coal/20 hover:bg-sand"
                      aria-label={`Eén ${l.name} meer`}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="w-16 text-right font-display tabular-nums text-bronze">{euro(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-coal/10 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Subtotaal ({count})</span>
                <span className="font-display text-2xl text-coal">{euro(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-ink/60">Eventuele leveringskost zie je bij het afrekenen.</p>
              <Link href="/afrekenen" onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">
                Afrekenen
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/** Balk onderaan zodra er iets in de mand zit. */
export function CartBar() {
  const { count, subtotal, ready, setOpen } = useCart();
  if (!ready || count === 0) return null;
  return (
    <>
      {/* ruimte onderaan zodat de balk op mobiel de footer niet bedekt */}
      <div className="h-20 sm:hidden" aria-hidden="true" />
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:bottom-5 sm:left-auto sm:right-5 sm:p-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary w-full justify-between gap-6 shadow-xl sm:w-auto"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="size-5" aria-hidden="true" />
          Bekijk bestelling
          <span className="grid size-6 place-items-center rounded-full bg-coal text-xs text-gold">{count}</span>
        </span>
        <span className="font-display">{euro(subtotal)}</span>
      </button>
    </div>
    </>
  );
}

/** Opent de winkelmand; voor de knoppenparen op de menupagina. */
export function OpenCartButton({ className = "btn btn-primary" }: { className?: string }) {
  const { count, setOpen } = useCart();
  return (
    <button type="button" className={className} onClick={() => setOpen(true)}>
      <ShoppingBag className="size-5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
      Bekijk bestelling{count ? ` (${count})` : ""}
    </button>
  );
}

export function AddToCart({ product }: { product: { id: string; name: string; price: number } }) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add(product)}
      className="add-btn grid size-9 shrink-0 place-items-center rounded-full bg-gold text-coal shadow-[0_3px_0_var(--color-gold-dark)] transition hover:-translate-y-0.5 active:translate-y-0.5"
      aria-label={`${product.name} toevoegen aan je bestelling`}
    >
      <Plus className="size-5" strokeWidth={2.6} aria-hidden="true" />
    </button>
  );
}
