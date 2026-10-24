"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/order/cart";

/** Leegt de winkelmand zodra de bestelling betaald is. */
export function ClearCart() {
  const { ready, clear } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}

/** Ververst de pagina elke 3 s tot de betaalstatus gekend is. */
export function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), 3000);
    return () => window.clearInterval(id);
  }, [router]);
  return null;
}
