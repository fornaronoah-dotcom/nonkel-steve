export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bienonkelsteve.be").replace(/\/$/, "");

export const site = {
  name: "Bie Nonkel Steve",
  legalName: "Bie Nonkel Steve",
  vat: "BE0791454771",
  street: "Buurtspoorwegstraat 109",
  postalCode: "8450",
  city: "Bredene",
  phone: "0469 16 96 19",
  phoneHref: "tel:+32469169619",
  phoneIntl: "+32469169619",
  email: "bienonkelsteve@gmail.com",
  orderUrl: "https://bie-nonkel-steve.unipage.eu/",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Buurtspoorwegstraat+109,+8450+Bredene",
  mapsEmbed: "https://www.google.com/maps?q=Buurtspoorwegstraat+109,+8450+Bredene&output=embed",
};

/** 0 = zondag … 6 = zaterdag (zoals Date.getDay). null = gesloten. */
export type Slot = { open: string; close: string } | null;

export const HOURS: { day: string; schema: string; slot: Slot }[] = [
  { day: "Maandag", schema: "Monday", slot: { open: "11:30", close: "20:30" } },
  { day: "Dinsdag", schema: "Tuesday", slot: { open: "17:30", close: "20:30" } },
  { day: "Woensdag", schema: "Wednesday", slot: null },
  { day: "Donderdag", schema: "Thursday", slot: { open: "17:30", close: "20:30" } },
  { day: "Vrijdag", schema: "Friday", slot: { open: "11:30", close: "21:00" } },
  { day: "Zaterdag", schema: "Saturday", slot: { open: "11:30", close: "21:00" } },
  { day: "Zondag", schema: "Sunday", slot: { open: "17:30", close: "21:00" } },
];

export function formatSlot(slot: Slot) {
  return slot ? `${slot.open} – ${slot.close}` : "Gesloten";
}
