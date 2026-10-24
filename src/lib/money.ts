/** Bedragen worden overal als eurocent (integer) bewaard. */
export function euro(cents: number) {
  return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

/** "12.50" — formaat dat Mollie verwacht. */
export function mollieAmount(cents: number) {
  return (cents / 100).toFixed(2);
}
