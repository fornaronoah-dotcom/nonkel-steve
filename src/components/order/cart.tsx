"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";

export interface CartLine {
  id: string; // productId
  name: string;
  price: number; // eurocent, enkel voor weergave — de server rekent opnieuw
  quantity: number;
}

interface CartApi {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (p: { id: string; name: string; price: number }) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

/* ---------- Store in localStorage (gedeeld tussen tabbladen) ---------- */

const KEY = "ns-cart";
const EVENT = "ns-cart-change";
const EMPTY: CartLine[] = [];
let snapshot: CartLine[] | null = null;

function read(): CartLine[] {
  if (snapshot) return snapshot;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    snapshot = Array.isArray(parsed) ? parsed.filter((l: CartLine) => l && l.id && l.quantity > 0) : EMPTY;
  } catch {
    snapshot = EMPTY;
  }
  return snapshot!;
}

function write(lines: CartLine[]) {
  snapshot = lines;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    snapshot = null; // ander tabblad wijzigde de mand
    callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, callback);
  };
}

const noopSubscribe = () => () => {};

/* ---------- Context ---------- */

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  // false tijdens server-render en hydratie, daarna true (mand is dan uit localStorage geladen).
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);

  const add = useCallback((p: { id: string; name: string; price: number }) => {
    const cur = read();
    const found = cur.find((l) => l.id === p.id);
    write(
      found
        ? cur.map((l) => (l.id === p.id ? { ...l, quantity: Math.min(30, l.quantity + 1) } : l))
        : [...cur, { ...p, quantity: 1 }],
    );
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const cur = read();
    write(
      quantity <= 0
        ? cur.filter((l) => l.id !== id)
        : cur.map((l) => (l.id === id ? { ...l, quantity: Math.min(30, quantity) } : l)),
    );
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
      ready,
      open,
      setOpen,
      add,
      setQuantity,
      clear,
    }),
    [lines, ready, open, add, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart moet binnen <CartProvider> gebruikt worden");
  return ctx;
}
