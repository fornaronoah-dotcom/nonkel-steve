// Gewone (niet-"use server") module: constanten mogen hier vrij geëxporteerd worden.
export const STATUSES = ["nieuw", "beantwoord", "afgehandeld"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  nieuw: "Nieuw",
  beantwoord: "Beantwoord",
  afgehandeld: "Afgehandeld",
};
